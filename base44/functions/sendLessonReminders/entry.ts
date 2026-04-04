import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get today's date in Istanbul timezone
    const now = new Date();
    const istanbulOffset = 3; // UTC+3
    const istanbulNow = new Date(now.getTime() + istanbulOffset * 60 * 60 * 1000);
    const today = istanbulNow.toISOString().slice(0, 10);

    // Get all lessons for today
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
      // Sort by start time
      teacherLessons.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

      const lessonRows = teacherLessons.map(l => {
        const typeLabel = l.type === 'online' ? '💻 Online' : '📍 Yüz yüze';
        const link = l.meetingLink ? `\n   🔗 ${l.meetingLink}` : '';
        return `• ${l.startTime} - ${l.endTime} | ${l.studentName || 'Öğrenci'} | ${l.subject || 'Ders'} | ${typeLabel}${link}`;
      }).join('\n');

      const body = `Merhaba,

Bugün (${today}) için ${teacherLessons.length} dersiniz var:

${lessonRows}

İyi dersler dileriz! 🎓

─────────────────
EduTakip
`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: teacherEmail,
        subject: `📅 Bugünkü Dersleriniz — ${today}`,
        body,
      });

      sentCount++;
    }

    return Response.json({ message: 'Lesson reminders sent', sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});