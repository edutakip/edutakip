import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CONNECTOR_ID = '69d0d68af50f7f9115160538';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const { data } = body;
    if (!data || !data.googleEventId) {
      return Response.json({ status: 'skipped', reason: 'no googleEventId' });
    }

    let accessToken;
    try {
      accessToken = await base44.asServiceRole.connectors.getCurrentAppUserAccessToken(CONNECTOR_ID);
    } catch (e) {
      return Response.json({ status: 'skipped', reason: 'not connected' });
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