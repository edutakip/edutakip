import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getSubjectEmoji(subject) {
  if (!subject) return '📚';
  const s = subject.toLowerCase();
  if (s.includes('alman') || s.includes('german')) return '🇩🇪';
  if (s.includes('ingiliz') || s.includes('english')) return '🇬🇧';
  if (s.includes('fransız') || s.includes('french')) return '🇫🇷';
  if (s.includes('matematik') || s.includes('math')) return '📐';
  if (s.includes('fizik') || s.includes('physics')) return '⚛️';
  if (s.includes('kimya') || s.includes('chemistry')) return '🧪';
  if (s.includes('biyoloji') || s.includes('biology')) return '🧬';
  if (s.includes('tarih') || s.includes('history')) return '🏛️';
  if (s.includes('müzik') || s.includes('music')) return '🎵';
  if (s.includes('türkçe')) return '🇹🇷';
  return '📖';
}

function buildLessonCard(lesson, index) {
  const isOnline = lesson.type === 'online';
  const borderColor = isOnline ? '#6366f1' : '#10b981';
  const badgeBg = isOnline ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)';
  const badgeColor = isOnline ? '#6366f1' : '#10b981';
  const badgeText = isOnline ? '💻 Online' : '📍 Yüz yüze';
  const emoji = getSubjectEmoji(lesson.subject);
  const initials = (lesson.studentName || 'Ö')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const actionButton = isOnline && lesson.meetingLink
    ? `<a href="${lesson.meetingLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#ffffff;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:10px 24px;border-radius:50px;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(99,102,241,0.35);">Derse Katıl →</a>`
    : `<span style="display:inline-block;background:rgba(16,185,129,0.1);color:#10b981;font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:700;padding:8px 18px;border-radius:50px;border:1.5px solid rgba(16,185,129,0.3);">📍 Konum: ${lesson.location || 'Belirtilmedi'}</span>`;

  const divider = index > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr>
        <td style="border-top:1px dashed #e2e8f0;padding:0;"></td>
        <td style="white-space:nowrap;padding:0 14px;color:#a0aec0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;">⏱</td>
        <td style="border-top:1px dashed #e2e8f0;padding:0;"></td>
      </tr>
    </table>` : '';

  return `
  ${divider}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;border:1px solid #edf2f7;border-left:4px solid ${borderColor};margin-bottom:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <tr>
      <td style="padding:22px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a0aec0;margin-bottom:6px;">DERS ${index + 1}</div>
              <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#1a202c;line-height:1.2;margin-bottom:4px;">
                ${lesson.startTime} <span style="color:#a0aec0;font-size:16px;">–</span> ${lesson.endTime}
              </div>
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:15px;color:#4a5568;font-weight:600;margin-bottom:10px;">
                ${emoji} ${lesson.subject || 'Ders'}
              </div>
              <span style="display:inline-block;background:${badgeBg};color:${badgeColor};font-family:'DM Sans',Arial,sans-serif;font-size:12px;font-weight:700;padding:4px 12px;border-radius:50px;margin-bottom:16px;">${badgeText}</span>
            </td>
            <td style="vertical-align:top;text-align:right;width:52px;">
              <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#e8eaf6,#c5cae9);display:inline-flex;align-items:center;justify-content:center;font-family:'DM Sans',Arial,sans-serif;font-size:16px;font-weight:800;color:#5c6bc0;line-height:48px;text-align:center;">${initials}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <div style="border-top:1px dashed #e2e8f0;margin:10px 0 14px;"></div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#718096;">👤 <strong style="color:#2d3748;">${lesson.studentName || 'Öğrenci'}</strong></span>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    ${actionButton}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function buildHtmlEmail(teacherEmail, lessons, today) {
  const dateLabel = formatDate(today);
  const lessonCards = lessons.map((l, i) => buildLessonCard(l, i)).join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Bugünkü Dersleriniz – EduTakip</title>
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
            <!-- Geometric accent dots -->
            <div style="position:absolute;top:20px;right:30px;width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
            <div style="position:absolute;top:10px;right:80px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>
            <div style="position:absolute;bottom:20px;left:25px;width:45px;height:45px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>

            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69ade51e0f0a53b9492b7a1e/d40c3749a_255133d07_logo.png" alt="EduTakip" width="52" height="52" style="border-radius:14px;margin-bottom:14px;display:block;margin-left:auto;margin-right:auto;" />
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;margin-bottom:6px;">EduTakip</div>
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.55);letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;">Özel Ders Yönetim Platformu</div>
            <!-- Date badge -->
            <div style="display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:50px;padding:8px 22px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;backdrop-filter:blur(4px);">
              📅 ${dateLabel}
            </div>
          </td>
        </tr>

        <!-- GREETING BAR -->
        <tr>
          <td style="background:#ffffff;padding:28px 40px 0;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:20px;color:#1a202c;margin-bottom:6px;">Merhaba,</div>
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#718096;line-height:1.6;">
              Bugün <strong style="color:#6366f1;">${lessons.length} dersin</strong> var. Hazır mısın? 🚀
            </div>
          </td>
        </tr>

        <!-- LESSON CARDS -->
        <tr>
          <td style="background:#ffffff;padding:20px 40px 8px;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            ${lessonCards}
          </td>
        </tr>

        <!-- MOTIVATIONAL QUOTE -->
        <tr>
          <td style="background:#ffffff;padding:8px 40px 28px;border-left:1px solid #edf2f7;border-right:1px solid #edf2f7;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(124,58,237,0.06));border-radius:12px;padding:20px 24px;border-left:3px solid #6366f1;">
                  <div style="font-family:'Playfair Display',Georgia,serif;font-size:15px;font-style:italic;color:#4a5568;line-height:1.6;margin-bottom:8px;">
                    "Bugün öğrendiğin, yarının temelidir."
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
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:8px;">
              Sosyal Medyada Biz
            </div>
            <div style="margin-bottom:18px;">
              <span style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.5);">📘 &nbsp; 📸 &nbsp; 🐦</span>
            </div>
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.8;">
              © 2026 EduTakip. Tüm hakları saklıdır.<br/>
              Bu e-posta otomatik olarak gönderilmiştir.<br/>
              <a href="#" style="color:rgba(167,139,250,0.7);text-decoration:underline;font-size:11px;">Abonelikten çık</a>
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
    const today = istanbulNow.toISOString().slice(0, 10);

    const lessons = await base44.asServiceRole.entities.Lesson.filter({ date: today, status: 'planlandı' });

    if (!lessons.length) {
      return Response.json({ message: 'No lessons today', sent: 0 });
    }

    // Group lessons by teacher
    const byTeacher = {};
    for (const lesson of lessons) {
      if (!lesson.teacherEmail) continue;
      if (!byTeacher[lesson.teacherEmail]) byTeacher[lesson.teacherEmail] = [];
      byTeacher[lesson.teacherEmail].push(lesson);
    }

    let sentCount = 0;

    for (const [teacherEmail, teacherLessons] of Object.entries(byTeacher)) {
      teacherLessons.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

      const htmlBody = buildHtmlEmail(teacherEmail, teacherLessons, today);

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: teacherEmail,
        subject: `📅 Bugünkü Dersleriniz — ${formatDate(today)}`,
        body: htmlBody,
      });

      sentCount++;
    }

    return Response.json({ message: 'Lesson reminders sent', sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});