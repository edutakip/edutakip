import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lessonInfo, notes, imageUrls = [] } = await req.json();

    const { grade, unit, topic, book, pages } = lessonInfo || {};

    const lessonContext = [
      grade && `Sınıf Seviyesi: ${grade}`,
      unit && `Ünite: ${unit}`,
      topic && `Konu: ${topic}`,
      book && `Kitap: ${book}`,
      pages && `Sayfalar: ${pages}`,
    ].filter(Boolean).join('\n');

    const prompt = `You are an experienced English teacher. Create a homework assignment based on this lesson.

LESSON INFO:
${lessonContext}
${notes ? `\nNOTES:\n${notes}` : ''}

Return ONLY valid JSON with this exact structure:
{
  "analysis": {
    "learnedTopics": "brief summary of topics covered",
    "needsReinforcement": "key points to reinforce",
    "vocabulary": "key vocabulary words",
    "difficulty": "Başlangıç / Orta / İleri"
  },
  "homework": {
    "title": "homework title in English",
    "grade": "${grade || 'General'}",
    "difficulty": "difficulty level",
    "instructions": "1-2 sentence instructions in English",
    "vocabulary": "5 vocabulary exercises (matching or fill-in-the-blank)",
    "grammar": "5 grammar exercises related to ${topic || 'the lesson topic'}",
    "reading": "Short reading text (60-80 words) + 3 comprehension questions",
    "writing": "Writing task: 30-50 word paragraph prompt",
    "speaking": "1-2 discussion questions (optional)"
  }
}`;

    const requestBody = {
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          analysis: {
            type: 'object',
            properties: {
              learnedTopics: { type: 'string' },
              needsReinforcement: { type: 'string' },
              vocabulary: { type: 'string' },
              difficulty: { type: 'string' },
            }
          },
          homework: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              grade: { type: 'string' },
              difficulty: { type: 'string' },
              instructions: { type: 'string' },
              vocabulary: { type: 'string' },
              grammar: { type: 'string' },
              reading: { type: 'string' },
              writing: { type: 'string' },
              speaking: { type: 'string' },
            }
          }
        }
      }
    };

    // If images are provided, include them
    if (imageUrls.length > 0) {
      requestBody.file_urls = imageUrls;
    }

    let result = null;
    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      result = await base44.integrations.Core.InvokeLLM({
        ...requestBody,
      });

      if (result?.homework) break;

      console.warn(`[generateAIHomework] Attempt ${attempt}/${MAX_RETRIES}: 'homework' field missing. Full LLM response:`, JSON.stringify(result));

      if (attempt === MAX_RETRIES) {
        console.error('[generateAIHomework] All retries exhausted. Last LLM response:', JSON.stringify(result));
        return Response.json({ error: 'AI yanıtında ödev bilgisi bulunamadı. Lütfen tekrar deneyin.' }, { status: 500 });
      }
    }

    return Response.json({ analysis: result.analysis, homework: result.homework });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});