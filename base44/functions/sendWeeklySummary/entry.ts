import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function buildStatCard(value, label, color, bg) {
  return `
  <td style="width:25%;text-align:center;padding:0 6px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-radius:12px;border:1px solid ${color}22;">
      <tr>
        <td style="padding:16px 8px;text-align:center;">
          <div style="font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:800;color:${color};line-height:1;">${value}</div>
          <div style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#718096;margin-top:5px;font-weight:600;">${label}</div>
        </td>
      </tr>
    </table>
  </td>`;
}

function buildHtmlEmail(weekStart, weekEnd, completed, planned, cancelled, totalLessons, totalCollected, collectedCount, totalPending, pendingCount) {
  const weekStartFmt = formatDate(weekStart);
  const weekEndFmt = formatDate(weekEnd);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Haftalık Özet – EduTakip</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
</style>
</head>
<body style="margin:0;padding:0;background:#f0f2f8;font-family:'DM Sans',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f8;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;position:relative;">
            <div style="position:absolute;top:20px;right:30px;width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
            <div style="position:absolute;top:10px;right:80px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>
            <div style="position:absolute;bottom:20px;left:25px;width:45px;height:45px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" width="52" height="52" style="border-radius:14px;margin-bottom:14px;display:block;margin-left:auto;margin-right:auto;" />
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;margin-bottom:6px;">EduTakip</div>
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.55);letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;">Özel Ders Yönetim Platformu</div>
            <div style="display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:50px;padding:8px 22px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;">
              📊 ${weekStartFmt} – ${weekEndFmt}
            </div>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td style="background:#ffffff;padding:28px 40px 0;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:20px;color:#1a202c;margin-bottom:6px;">Haftalık Özet</div>
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#718096;line-height:1.6;">
              Bu haftanın ders ve ödeme özetine göz atın. 📈
            </div>
          </td>
        </tr>

        <!-- LESSON STATS -->
        <tr>
          <td style="background:#ffffff;padding:20px 40px 8px;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a0aec0;margin-bottom:12px;">📚 DERSLER</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${buildStatCard(completed, 'Tamamlanan', '#10b981', 'rgba(16,185,129,0.08)')}
                ${buildStatCard(planned, 'Planlanan', '#6366f1', 'rgba(99,102,241,0.08)')}
                ${buildStatCard(cancelled, 'İptal', '#ef4444', 'rgba(239,68,68,0.08)')}
                ${buildStatCard(totalLessons, 'Toplam', '#64748b', 'rgba(100,116,139,0.08)')}
              </tr>
            </table>
          </td>
        </tr>

        <!-- PAYMENT STATS -->
        <tr>
          <td style="background:#ffffff;padding:20px 40px 8px;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a0aec0;margin-bottom:12px;">💰 ÖDEMELER</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:50%;padding:0 6px 0 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(16,185,129,0.08);border-radius:12px;border:1px solid rgba(16,185,129,0.2);">
                    <tr>
                      <td style="padding:18px 20px;">
                        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;color:#10b981;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">✅ Tahsil Edilen</div>
                        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:800;color:#065f46;">${totalCollected.toLocaleString('tr-TR')} ₺</div>
                        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#6ee7b7;margin-top:3px;">${collectedCount} ödeme</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="width:50%;padding:0 0 0 6px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(245,158,11,0.08);border-radius:12px;border:1px solid rgba(245,158,11,0.2);">
                    <tr>
                      <td style="padding:18px 20px;">
                        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;color:#f59e0b;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">⏳ Bekleyen/Geciken</div>
                        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:22px;font-weight:800;color:#92400e;">${totalPending.toLocaleString('tr-TR')} ₺</div>
                        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#fde68a;margin-top:3px;">${pendingCount} ödeme</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MOTIVATIONAL QUOTE -->
        <tr>
          <td style="background:#ffffff;padding:20px 40px 28px;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(124,58,237,0.06));border-radius:12px;padding:20px 24px;border-left:3px solid #6366f1;">
                  <div style="font-family:'Playfair Display',Georgia,serif;font-size:15px;font-style:italic;color:#4a5568;line-height:1.6;margin-bottom:8px;">
                    "Başarı, her gün tekrarlanan küçük çabaların toplamıdır."
                  </div>
                  <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#a0aec0;font-weight:600;letter-spacing:0.5px;">— EduTakip 🎓</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- DIVIDER -->
        <tr>
          <td style="background:#ffffff;padding:0 40px;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            <div style="border-top:1px dashed #e2e8f0;"></div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b,#2e1b6e);border-radius:0 0 16px 16px;padding:28px 40px;text-align:center;">
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.8;">
              © 2026 EduTakip. Tüm hakları saklıdır.<br/>
              Bu e-posta otomatik olarak gönderilmiştir.
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const istanbulOffset = 3;
    const istanbulNow = new Date(now.getTime() + istanbulOffset * 60 * 60 * 1000);
    const today = new Date(istanbulNow.toISOString().slice(0, 10));

    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekStart = monday.toISOString().slice(0, 10);
    const weekEnd = sunday.toISOString().slice(0, 10);

    const allLessons = await base44.asServiceRole.entities.Lesson.filter({});
    const allPayments = await base44.asServiceRole.entities.Payment.filter({});

    const weekLessons = allLessons.filter(l => l.date >= weekStart && l.date <= weekEnd);
    const weekPayments = allPayments.filter(p => p.date >= weekStart && p.date <= weekEnd);

    const teacherEmails = [...new Set([
      ...weekLessons.map(l => l.teacherEmail),
      ...weekPayments.map(p => p.teacherEmail),
    ].filter(Boolean))];

    if (!teacherEmails.length) {
      return Response.json({ message: 'No data for this week', sent: 0 });
    }

    let sentCount = 0;

    for (const teacherEmail of teacherEmails) {
      const myLessons = weekLessons.filter(l => l.teacherEmail === teacherEmail);
      const myPayments = weekPayments.filter(p => p.teacherEmail === teacherEmail);

      const completed = myLessons.filter(l => l.status === 'tamamlandı').length;
      const planned = myLessons.filter(l => l.status === 'planlandı').length;
      const cancelled = myLessons.filter(l => l.status === 'iptal').length;

      const collectedPayments = myPayments.filter(p => p.status === 'alındı');
      const totalCollected = collectedPayments.reduce((s, p) => s + (p.amount || 0), 0);
      const pendingPayments = myPayments.filter(p => p.status !== 'alındı');
      const totalPending = pendingPayments.reduce((s, p) => s + (p.amount || 0), 0);

      const htmlBody = buildHtmlEmail(
        weekStart, weekEnd,
        completed, planned, cancelled, myLessons.length,
        totalCollected, collectedPayments.length,
        totalPending, pendingPayments.length
      );

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: teacherEmail,
        subject: `📊 Haftalık Özet — ${formatDate(weekStart)} / ${formatDate(weekEnd)}`,
        body: htmlBody,
      });

      sentCount++;
    }

    return Response.json({ message: 'Weekly summaries sent', sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});