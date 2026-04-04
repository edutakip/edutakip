import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calculate this week's date range (Mon-Sun)
    const now = new Date();
    const istanbulOffset = 3;
    const istanbulNow = new Date(now.getTime() + istanbulOffset * 60 * 60 * 1000);
    const today = new Date(istanbulNow.toISOString().slice(0, 10));

    // Monday of this week
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekStart = monday.toISOString().slice(0, 10);
    const weekEnd = sunday.toISOString().slice(0, 10);

    // Get all lessons and payments this week
    const allLessons = await base44.asServiceRole.entities.Lesson.filter({});
    const allPayments = await base44.asServiceRole.entities.Payment.filter({});

    const weekLessons = allLessons.filter(l => l.date >= weekStart && l.date <= weekEnd);
    const weekPayments = allPayments.filter(p => p.date >= weekStart && p.date <= weekEnd);

    // Get all teachers from lessons
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

      const completedLessons = myLessons.filter(l => l.status === 'tamamlandı');
      const plannedLessons = myLessons.filter(l => l.status === 'planlandı');
      const cancelledLessons = myLessons.filter(l => l.status === 'iptal');

      const collectedPayments = myPayments.filter(p => p.status === 'alındı');
      const totalCollected = collectedPayments.reduce((s, p) => s + (p.amount || 0), 0);

      const pendingPayments = myPayments.filter(p => p.status !== 'alındı');
      const totalPending = pendingPayments.reduce((s, p) => s + (p.amount || 0), 0);

      const body = `Merhaba,

${weekStart} - ${weekEnd} haftasına ait özetiniz:

📚 DERSLER
• Tamamlanan: ${completedLessons.length}
• Planlanan: ${plannedLessons.length}
• İptal edilen: ${cancelledLessons.length}
• Toplam: ${myLessons.length}

💰 ÖDEMELER
• Tahsil edilen: ${totalCollected.toLocaleString('tr-TR')} ₺ (${collectedPayments.length} ödeme)
• Bekleyen/Geciken: ${totalPending.toLocaleString('tr-TR')} ₺ (${pendingPayments.length} ödeme)

İyi haftalar dileriz! 🌟

─────────────────
EduTakip
`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: teacherEmail,
        subject: `📊 Haftalık Özet — ${weekStart} / ${weekEnd}`,
        body,
      });

      sentCount++;
    }

    return Response.json({ message: 'Weekly summaries sent', sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});