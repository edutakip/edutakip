import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function buildPaymentRow(p, isOverdue) {
  const color = isOverdue ? '#ef4444' : '#f59e0b';
  const bg = isOverdue ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)';
  const border = isOverdue ? '#fecaca' : '#fde68a';
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-radius:10px;border:1px solid ${border};border-left:4px solid ${color};margin-bottom:10px;">
    <tr>
      <td style="padding:14px 18px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:700;color:#1a202c;">👤 ${p.studentName || 'Öğrenci'}</div>
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#718096;margin-top:3px;">📅 ${p.date || ''} ${p.description ? '· ' + p.description : ''}</div>
            </td>
            <td style="text-align:right;white-space:nowrap;">
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:17px;font-weight:800;color:${color};">${(p.amount || 0).toLocaleString('tr-TR')} ₺</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function buildHtmlEmail(overdue, pending) {
  const overdueTotal = overdue.reduce((s, p) => s + (p.amount || 0), 0);
  const pendingTotal = pending.reduce((s, p) => s + (p.amount || 0), 0);
  const grandTotal = overdueTotal + pendingTotal;

  const overdueSection = overdue.length ? `
    <div style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ef4444;margin-bottom:10px;">⚠️ GECİKMİŞ ÖDEMELER (${overdue.length})</div>
    ${overdue.map(p => buildPaymentRow(p, true)).join('')}
    <div style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:700;color:#ef4444;text-align:right;margin-bottom:24px;">Toplam: ${overdueTotal.toLocaleString('tr-TR')} ₺</div>
  ` : '';

  const pendingSection = pending.length ? `
    <div style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f59e0b;margin-bottom:10px;">⏳ BEKLEYEN ÖDEMELER (${pending.length})</div>
    ${pending.map(p => buildPaymentRow(p, false)).join('')}
    <div style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:700;color:#f59e0b;text-align:right;margin-bottom:8px;">Toplam: ${pendingTotal.toLocaleString('tr-TR')} ₺</div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ödeme Hatırlatması – EduTakip</title>
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
              💰 Ödeme Hatırlatması
            </div>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td style="background:#ffffff;padding:28px 40px 0;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:20px;color:#1a202c;margin-bottom:6px;">Merhaba,</div>
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#718096;line-height:1.6;">
              Tahsil edilmemiş ödemeleriniz var. Toplam bekleyen tutar: <strong style="color:#ef4444;">${grandTotal.toLocaleString('tr-TR')} ₺</strong>
            </div>
          </td>
        </tr>

        <!-- PAYMENT SECTIONS -->
        <tr>
          <td style="background:#ffffff;padding:20px 40px 8px;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            ${overdueSection}
            ${pendingSection}
          </td>
        </tr>

        <!-- INFO BOX -->
        <tr>
          <td style="background:#ffffff;padding:8px 40px 28px;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(124,58,237,0.06));border-radius:12px;padding:20px 24px;border-left:3px solid #6366f1;">
                  <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#4a5568;line-height:1.6;">
                    EduTakip üzerinden ödeme durumlarını güncelleyebilir, velilere WhatsApp bildirimi gönderebilirsiniz.
                  </div>
                  <div style="margin-top:14px;">
                    <a href="https://edutakip.com/TeacherFinance" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#ffffff;font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:10px 22px;border-radius:50px;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(99,102,241,0.35);">Ödemeleri Yönet →</a>
                  </div>
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

    const pendingPayments = await base44.asServiceRole.entities.Payment.filter({ status: 'bekliyor' });
    const overduePayments = await base44.asServiceRole.entities.Payment.filter({ status: 'gecikmis' });
    const allPayments = [...pendingPayments, ...overduePayments];

    if (!allPayments.length) {
      return Response.json({ message: 'No pending/overdue payments', sent: 0 });
    }

    const byTeacher = {};
    for (const payment of allPayments) {
      if (!payment.teacherEmail) continue;
      if (!byTeacher[payment.teacherEmail]) byTeacher[payment.teacherEmail] = { bekliyor: [], gecikmiş: [] };
      if (payment.status === 'bekliyor') byTeacher[payment.teacherEmail].bekliyor.push(payment);
      else byTeacher[payment.teacherEmail].gecikmiş.push(payment);
    }

    let sentCount = 0;

    for (const [teacherEmail, data] of Object.entries(byTeacher)) {
      const grandTotal = [...data.gecikmiş, ...data.bekliyor].reduce((s, p) => s + (p.amount || 0), 0);
      const htmlBody = buildHtmlEmail(data.gecikmiş, data.bekliyor);

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: teacherEmail,
        subject: `💰 Bekleyen Ödemeler — ${grandTotal.toLocaleString('tr-TR')} ₺`,
        body: htmlBody,
      });

      sentCount++;
    }

    return Response.json({ message: 'Payment reminders sent', sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});