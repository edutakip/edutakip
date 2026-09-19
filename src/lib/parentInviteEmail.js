import { base44 } from '@/api/base44Client';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png';

export function buildParentInviteHTML({ teacherName, studentName, parentName, appUrl, inviteCode, isEn }) {
  const greeting = isEn
    ? `Hello${parentName ? ` ${parentName}` : ''},`
    : `Merhaba${parentName ? ` ${parentName}` : ''},`;

  const intro = isEn
    ? `<strong>${teacherName}</strong> has invited you to EduTakip. You can now follow <strong>${studentName}</strong>'s lessons online.`
    : `<strong>${teacherName}</strong> sizi EduTakip'e davet ediyor. <strong>${studentName}</strong> için ders takibini artık online olarak yapabilirsiniz.`;

  const features = isEn
    ? [
        { icon: '📅', text: 'View lesson schedule' },
        { icon: '📚', text: 'Track homework assignments' },
        { icon: '📊', text: 'Follow progress reports' },
        { icon: '💳', text: 'Check payment history' },
      ]
    : [
        { icon: '📅', text: 'Ders programını görüntüleme' },
        { icon: '📚', text: 'Ödev takibi' },
        { icon: '📊', text: 'Gelişim raporları' },
        { icon: '💳', text: 'Ödeme geçmişi' },
      ];

  const ctaText = isEn ? 'Access EduTakip' : "EduTakip'e Giriş Yap";
  const registerNote = isEn
    ? 'Click the button below to go to EduTakip. If you don\'t have an account yet, register from the login page, then enter your connection code.'
    : 'Aşağıdaki butona tıklayarak EduTakip\'e gidin. Henüz hesabınız yoksa giriş sayfasından kayıt olun, ardından bağlantı kodunuzu girin.';

  const codeLabel = isEn ? 'Your Connection Code' : 'Bağlantı Kodunuz';
  const codeInstruction = isEn
    ? 'After logging in, enter this code to connect to your child:'
    : 'Giriş yaptıktan sonra çocuğunuza bağlanmak için bu kodu girin:';
  const codeReminder = isEn
    ? 'Save this code — you may need it again if you log in from another device.'
    : 'Bu kodu kaydedin — başka cihazdan giriş yaparsanız tekrar gerekebilir.';

  const footerText = isEn
    ? '© 2024 EduTakip · Teacher & Parent Lesson Management Platform'
    : '© 2024 EduTakip · Öğretmen & Veli Ders Takip Platformu';

  const tagline = isEn
    ? 'Teacher & Parent Lesson Management Platform'
    : 'Öğretmen & Veli Ders Takip Platformu';

  const featuresHtml = features
    .map(
      (f) => `<tr>
        <td style="padding:10px 0;">
          <span style="font-size:18px;vertical-align:middle;">${f.icon}</span>
          <span style="color:#374151;font-size:14px;font-weight:600;margin-left:10px;vertical-align:middle;">${f.text}</span>
        </td>
      </tr>`
    )
    .join('');

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
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;">
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#4f46e5 100%);padding:40px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="EduTakip" style="width:56px;height:56px;border-radius:14px;margin:0 auto 16px;display:block;" />
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 6px;">EduTakip</h1>
              <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">${tagline}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="color:#1e1b4b;font-size:20px;font-weight:800;margin:0 0 16px;">${greeting}</h2>
              <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">${intro}</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f8fafc;border-radius:12px;padding:16px 20px;">
                ${featuresHtml}
              </table>
              <p style="color:#92400e;font-size:13px;line-height:1.5;margin:0 0 24px;padding:12px 16px;background:#fef3c7;border-radius:8px;">⚠️ ${registerNote}</p>
              ${inviteCode ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#eef2ff;border:2px dashed #6366f1;border-radius:12px;padding:20px;text-align:center;">
                <tr>
                  <td>
                    <p style="color:#4338ca;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">${codeLabel}</p>
                    <p style="color:#374151;font-size:13px;line-height:1.5;margin:0 0 14px;">${codeInstruction}</p>
                    <div style="display:inline-block;background:#ffffff;border:2px solid #6366f1;border-radius:10px;padding:12px 28px;">
                      <span style="color:#1e1b4b;font-size:28px;font-weight:900;letter-spacing:6px;font-family:'Courier New',monospace;">${inviteCode}</span>
                    </div>
                    <p style="color:#6b7280;font-size:12px;margin:14px 0 0;">💡 ${codeReminder}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0;">
                    <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 40px;border-radius:12px;">${ctaText}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">${footerText}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendParentInviteEmail({ parentEmail, teacherName, studentName, parentName, inviteCode, isEn }) {
  const appUrl = inviteCode
    ? `https://edu-track-492b7a1e.base44.app/?code=${inviteCode}`
    : 'https://edu-track-492b7a1e.base44.app/';
  const html = buildParentInviteHTML({ teacherName, studentName, parentName, appUrl, inviteCode, isEn });
  const subject = isEn
    ? `You're invited to track ${studentName}'s lessons on EduTakip`
    : `${studentName} için EduTakip daveti`;

  await base44.integrations.Core.SendEmail({
    to: parentEmail,
    subject,
    html,
  });
}

// Shared: send branded invite email + mark student as invited
export async function sendParentInviteFull({ student, teacherName, isEn }) {
  if (!student.parentEmail) throw new Error('NO_PARENT_EMAIL');
  await sendParentInviteEmail({
    parentEmail: student.parentEmail,
    teacherName,
    studentName: student.name,
    parentName: student.parentName,
    inviteCode: student.inviteCode,
    isEn,
  });
  await base44.entities.Student.update(student.id, { parentInviteSent: true });
}