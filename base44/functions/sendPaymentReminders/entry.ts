import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all pending/overdue payments
    const pendingPayments = await base44.asServiceRole.entities.Payment.filter({ status: 'bekliyor' });
    const overduePayments = await base44.asServiceRole.entities.Payment.filter({ status: 'gecikmis' });
    const allPayments = [...pendingPayments, ...overduePayments];

    if (!allPayments.length) {
      return Response.json({ message: 'No pending/overdue payments', sent: 0 });
    }

    // Group by teacher
    const byTeacher = {};
    for (const payment of allPayments) {
      if (!payment.teacherEmail) continue;
      if (!byTeacher[payment.teacherEmail]) byTeacher[payment.teacherEmail] = { bekliyor: [], gecikmiş: [] };
      if (payment.status === 'bekliyor') byTeacher[payment.teacherEmail].bekliyor.push(payment);
      else byTeacher[payment.teacherEmail].gecikmiş.push(payment);
    }

    let sentCount = 0;

    for (const [teacherEmail, data] of Object.entries(byTeacher)) {
      const sections = [];

      if (data.gecikmiş.length) {
        const rows = data.gecikmiş.map(p =>
          `• ${p.studentName || 'Öğrenci'} — ${(p.amount || 0).toLocaleString('tr-TR')} ₺ (${p.date || ''})`
        ).join('\n');
        const total = data.gecikmiş.reduce((s, p) => s + (p.amount || 0), 0);
        sections.push(`⚠️ GECİKMİŞ ÖDEMELER (${data.gecikmiş.length} adet)\n${rows}\nToplam: ${total.toLocaleString('tr-TR')} ₺`);
      }

      if (data.bekliyor.length) {
        const rows = data.bekliyor.map(p =>
          `• ${p.studentName || 'Öğrenci'} — ${(p.amount || 0).toLocaleString('tr-TR')} ₺ (${p.date || ''})`
        ).join('\n');
        const total = data.bekliyor.reduce((s, p) => s + (p.amount || 0), 0);
        sections.push(`⏳ BEKLEYEN ÖDEMELER (${data.bekliyor.length} adet)\n${rows}\nToplam: ${total.toLocaleString('tr-TR')} ₺`);
      }

      const body = `Merhaba,

Tahsil edilmemiş ödemeleriniz var:

${sections.join('\n\n')}

EduTakip üzerinden ödeme durumlarını güncelleyebilirsiniz.

─────────────────
EduTakip
`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: teacherEmail,
        subject: `💰 Bekleyen/Geciken Ödeme Hatırlatması`,
        body,
      });

      sentCount++;
    }

    return Response.json({ message: 'Payment reminders sent', sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});