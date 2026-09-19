import { base44 } from '@/api/base44Client';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png';

export function buildReceiptHTML({ teacherName, studentName, subject, parentName, amount, date, method, description, receiptNo }) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:480px;">
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#4f46e5 100%);padding:36px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="EduTakip" style="width:52px;height:52px;border-radius:13px;margin:0 auto 14px;display:block;" />
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 4px;">EduTakip</h1>
              <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">Ödeme Makbuzu</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#eef2ff;border-radius:10px;padding:12px 18px;">
                <tr>
                  <td style="text-align:center;">
                    <span style="color:#4338ca;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Makbuz No</span><br/>
                    <span style="color:#1e1b4b;font-size:16px;font-weight:800;letter-spacing:2px;font-family:'Courier New',monospace;">${receiptNo}</span>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#9ca3af;font-size:13px;">Öğretmen</span><br/>
                    <span style="color:#1e1b4b;font-size:15px;font-weight:700;">${teacherName || '-'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#9ca3af;font-size:13px;">Öğrenci</span><br/>
                    <span style="color:#1e1b4b;font-size:15px;font-weight:700;">${studentName || '-'}${subject ? ' · ' + subject : ''}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#9ca3af;font-size:13px;">Ödeme Tarihi</span><br/>
                    <span style="color:#374151;font-size:15px;font-weight:600;">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#9ca3af;font-size:13px;">Ödeme Yöntemi</span><br/>
                    <span style="color:#374151;font-size:15px;font-weight:600;">${method}</span>
                  </td>
                </tr>
                ${description ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="color:#9ca3af;font-size:13px;">Açıklama</span><br/>
                    <span style="color:#374151;font-size:14px;">${description}</span>
                  </td>
                </tr>
                ` : ''}
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:linear-gradient(135deg,#1e1b4b,#4f46e5);border-radius:12px;padding:18px 24px;">
                <tr>
                  <td style="color:rgba(255,255,255,0.7);font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Toplam Tutar</td>
                  <td align="right" style="color:#ffffff;font-size:24px;font-weight:900;">₺${(amount || 0).toLocaleString('tr-TR')}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:18px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">Bu makbuz EduTakip tarafından oluşturulmuştur.</p>
              <p style="color:#9ca3af;font-size:11px;margin:4px 0 0;">© 2024 EduTakip · Öğretmen & Veli Ders Takip Platformu</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendReceiptEmail({ parentEmail, parentName, teacherName, studentName, subject, amount, date, method, description, receiptNo }) {
  const html = buildReceiptHTML({ teacherName, studentName, subject, parentName, amount, date, method, description, receiptNo });
  const subjectLine = `Ödeme Makbuzu — ${studentName || ''} · ${receiptNo}`;

  await base44.integrations.Core.SendEmail({
    to: parentEmail,
    subject: subjectLine,
    html,
  });
}