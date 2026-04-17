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

    const prompt = `Sen deneyimli bir İngilizce öğretmenisin. Bir öğretmen şu dersi işledi:

DERS BİLGİLERİ:
${lessonContext}

DERS NOTLARI:
${notes || '(Not girilmedi)'}

Lütfen şunları yap:
1. Dersi analiz et
2. Bu derse uygun, öğrencinin seviyesine göre kapsamlı bir ev ödevi oluştur

Yanıtını JSON formatında ver:
{
  "analysis": {
    "learnedTopics": "Öğrenilen konular özeti",
    "needsReinforcement": "Pekiştirilmesi gereken noktalar",
    "vocabulary": "Tekrar edilmesi gereken kelimeler listesi",
    "difficulty": "Zorluk seviyesi (Başlangıç / Orta / İleri)"
  },
  "homework": {
    "title": "Ödev başlığı (İngilizce)",
    "grade": "${grade || 'Genel'}",
    "difficulty": "Zorluk seviyesi",
    "instructions": "Genel ödev talimatları (İngilizce, 1-2 cümle)",
    "vocabulary": "Kelime çalışması egzersizi — en az 5 aktivite/kelime içersin. Match the words, fill in the blanks gibi görevler ver.",
    "grammar": "Dil bilgisi egzersizi — ${topic || 'dersin konusuna'} uygun 5-6 cümlelik alıştırma. Cümle tamamlama, dönüştürme, hata bulma gibi.",
    "reading": "Kısa okuma metni (80-120 kelime) + 3 anlama sorusu. Metin dersin konusuyla ilişkili olsun.",
    "writing": "Yazma görevi — 40-60 kelime, konuyla ilgili bir paragraf veya kısa yazı isteniyor.",
    "speaking": "İsteğe bağlı konuşma aktivitesi — bir veya iki soru/tartışma konusu"
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

    const result = await base44.integrations.Core.InvokeLLM({
      ...requestBody,
      model: 'claude_sonnet_4_6',
    });

    return Response.json({ analysis: result.analysis, homework: result.homework });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});