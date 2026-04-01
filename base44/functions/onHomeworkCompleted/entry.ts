import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const homeworkId = body?.event?.entity_id || body?.data?.id;
    if (!homeworkId) {
      return Response.json({ skipped: 'no homeworkId' });
    }

    const homeworks = await base44.asServiceRole.entities.Homework.filter({ id: homeworkId });
    const hw = homeworks[0];
    if (!hw || !hw.attachments || hw.attachments.length === 0) {
      return Response.json({ skipped: 'no attachments' });
    }

    // AI değerlendirmesini çağır
    await base44.asServiceRole.functions.invoke('evaluateHomework', { homeworkId });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});