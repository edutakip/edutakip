import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { homeworkId } = await req.json();
    if (!homeworkId) {
      return Response.json({ error: 'homeworkId gerekli' }, { status: 400 });
    }

    // Ödev verisini al
    const homeworks = await base44.asServiceRole.entities.Homework.filter({ id: homeworkId });
    const hw = homeworks[0];
    if (!hw) {
      return Response.json({ error: 'Ödev bulunamadı' }, { status: 404 });
    }

    if (!hw.attachments || hw.attachments.length === 0) {
      return Response.json({ error: 'Dosya yok' }, { status: 400 });
    }

    const prompt = `Sen bir eğitim değerlendirme uzmanısın. 
Öğrencinin çözdüğü ödev aşağıdaki görsel dosyalarda yer almaktadır.

Ödevin açıklaması / sorusu:
"${hw.title}${hw.description ? '\n' + hw.description : ''}"

Lütfen bu ödevi değerlendir ve JSON formatında yanıt ver:
- effort: Öğrencinin gösterdiği çabayı değerlendir. Değerler: "Yüksek", "Orta", "Düşük"
- understanding: Konuyu anlama düzeyi. Değerler: "İyi", "Orta", "Zayıf"  
- feedback: 2-3 cümlelik Türkçe detaylı geri bildirim. Öğrencinin ne yapıp yapmadığını, doğru/yanlış yanların neler olduğunu belirt.
- warning: Eğer gönderilen görsel ödev çözümü değilse (örn. ekran görüntüsü, alakasız resim), bunu Türkçe olarak belirt. Ödev çözümü ise bu alanı boş bırak.

Değerlendirmeyi Türkçe yap. Öğrenci ve veli perspektifinden yapıcı ol.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: hw.attachments,
      response_json_schema: {
        type: "object",
        properties: {
          effort: { type: "string" },
          understanding: { type: "string" },
          feedback: { type: "string" },
          warning: { type: "string" }
        }
      }
    });

    // Sonucu ödeve kaydet
    await base44.asServiceRole.entities.Homework.update(hw.id, {
      aiEvaluation: result
    });

    return Response.json({ success: true, evaluation: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});