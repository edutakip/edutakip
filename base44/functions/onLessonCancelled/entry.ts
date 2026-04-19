import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CONNECTOR_ID = '69d0d68af50f7f9115160538';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const { data } = body;
    if (!data || !data.googleEventId || !data.teacherEmail) {
      return Response.json({ status: 'skipped', reason: 'no googleEventId or teacherEmail' });
    }

    // Entity automation'dan geldiği için "current user" yok.
    // teacherEmail üzerinden öğretmenin userId'sini bulup token al.
    let teacherUsers;
    try {
      teacherUsers = await base44.asServiceRole.entities.User.filter({ email: data.teacherEmail });
    } catch (e) {
      return Response.json({ status: 'skipped', reason: 'teacher lookup failed' });
    }

    if (!teacherUsers || teacherUsers.length === 0) {
      return Response.json({ status: 'skipped', reason: 'teacher not found' });
    }

    const teacherId = teacherUsers[0].id;

    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID, { userId: teacherId });
      accessToken = conn.accessToken;
    } catch (e) {
      return Response.json({ status: 'skipped', reason: 'not connected: ' + e.message });
    }

    const delRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${data.googleEventId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (delRes.status === 204 || delRes.status === 410) {
      await base44.asServiceRole.entities.Lesson.update(data.id, { googleEventId: null });
      return Response.json({ status: 'deleted' });
    }

    return Response.json({ status: 'error', httpStatus: delRes.status });
  } catch (error) {
    console.error('onLessonCancelled error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});