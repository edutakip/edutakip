import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Güvenli veri erişim fonksiyonu - Agent için
 * teacherEmail filtresi ZORUNLU olarak uygulanır, kullanıcı bunu bypass edemez.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { entity, operation, filters = {}, data, recordId } = body;

    const ALLOWED_ENTITIES = ['Student', 'Lesson', 'Payment', 'Homework', 'LessonReport', 'Message', 'MessageTemplate'];

    if (!ALLOWED_ENTITIES.includes(entity)) {
      return Response.json({ error: 'Entity not allowed' }, { status: 400 });
    }

    // teacherEmail her zaman mevcut kullanıcıya kilitlenir
    const safeFilters = { ...filters, teacherEmail: user.email };

    const entityRef = base44.asServiceRole.entities[entity];

    if (operation === 'list' || operation === 'filter') {
      const records = await entityRef.filter(safeFilters);
      return Response.json({ success: true, records, count: records.length });
    }

    if (operation === 'create') {
      // Oluşturulacak kayıtta teacherEmail zorunlu
      const safeData = { ...data, teacherEmail: user.email };
      const record = await entityRef.create(safeData);
      return Response.json({ success: true, record });
    }

    if (operation === 'update') {
      if (!recordId) return Response.json({ error: 'recordId required' }, { status: 400 });
      // Güncellenecek kaydın bu öğretmene ait olduğunu doğrula
      const existing = await entityRef.filter({ id: recordId, teacherEmail: user.email });
      if (!existing || existing.length === 0) {
        return Response.json({ error: 'Record not found or access denied' }, { status: 403 });
      }
      const safeData = { ...data };
      delete safeData.teacherEmail; // teacherEmail değiştirilemez
      const record = await entityRef.update(recordId, safeData);
      return Response.json({ success: true, record });
    }

    if (operation === 'delete') {
      if (!recordId) return Response.json({ error: 'recordId required' }, { status: 400 });
      // Silinecek kaydın bu öğretmene ait olduğunu doğrula
      const existing = await entityRef.filter({ id: recordId, teacherEmail: user.email });
      if (!existing || existing.length === 0) {
        return Response.json({ error: 'Record not found or access denied' }, { status: 403 });
      }
      await entityRef.delete(recordId);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });

  } catch (error) {
    console.error('[agentGetData] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});