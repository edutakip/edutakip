import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { description, currentTheme, certLang, form } = await req.json();

  const prompt = `You are a certificate design assistant. The user wants to generate a custom certificate design.

Current certificate info:
- Student name: ${form?.studentName || ''}
- Tutor name: ${form?.tutorName || ''}
- Course: ${form?.course || ''}
- Date: ${form?.date || ''}
- Certificate language: ${certLang}
- Current theme: ${currentTheme}

User's design description: "${description}"

Based on the description, generate a complete certificate theme as a JSON object with these EXACT fields:
- id: a unique short id (snake_case, no spaces)
- labelEn: English label for this theme (max 3 words)
- labelTr: Turkish label for this theme (max 3 words)
- accent: a CSS color (hex) that matches the description
- bg: a CSS linear-gradient string for the background
- border: a CSS border string (e.g. "8px solid #color" or "12px double #color")
- titleColor: CSS color for the title text
- bodyColor: CSS color for body/secondary text
- nameColor: CSS color for the student name
- fontFamily: CSS font-family string (use only web-safe or Google fonts available in quotes)
- nameBorder: CSS border string for the name underline
- shadow: CSS box-shadow string
- icon: a single relevant emoji

Also generate a personalized message for the student based on the description (in the same language as certLang). Return it as "suggestedMessage" field (max 15 words).

Respond ONLY with valid JSON, no markdown, no explanation.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        labelEn: { type: 'string' },
        labelTr: { type: 'string' },
        accent: { type: 'string' },
        bg: { type: 'string' },
        border: { type: 'string' },
        titleColor: { type: 'string' },
        bodyColor: { type: 'string' },
        nameColor: { type: 'string' },
        fontFamily: { type: 'string' },
        nameBorder: { type: 'string' },
        shadow: { type: 'string' },
        icon: { type: 'string' },
        suggestedMessage: { type: 'string' },
      },
    },
  });

  return Response.json(result);
});