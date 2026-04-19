import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CONNECTOR_ID = '69d0d68af50f7f9115160538';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, action } = body; // action: 'create' | 'update' | 'delete'

    if (!lessonId) {
      return Response.json({ error: 'lessonId required' }, { status: 400 });
    }

    // Get access token for this app user
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
      accessToken = conn.accessToken;
    } catch (e) {
      return Response.json({ error: 'Google Calendar not connected', connected: false }, { status: 200 });
    }

    const authHeader = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // Fetch lesson data
    const lessons = await base44.entities.Lesson.filter({ id: lessonId, teacherEmail: user.email });
    const lesson = lessons[0];
    if (!lesson) {
      return Response.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // If lesson already has a googleEventId and action is 'delete'
    if (action === 'delete' && lesson.googleEventId) {
      const delRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${lesson.googleEventId}`,
        { method: 'DELETE', headers: authHeader }
      );
      if (delRes.status === 204 || delRes.status === 410) {
        await base44.entities.Lesson.update(lessonId, { googleEventId: null });
        return Response.json({ success: true, action: 'deleted' });
      }
      return Response.json({ error: 'Delete failed', status: delRes.status }, { status: 500 });
    }

    // Build event payload
    const dateStr = lesson.date; // YYYY-MM-DD
    const startDateTime = `${dateStr}T${lesson.startTime}:00`;
    const endDateTime = `${dateStr}T${lesson.endTime}:00`;

    const eventPayload = {
      summary: `📚 ${lesson.studentName} - ${lesson.subject || 'Ders'}`,
      description: [
        lesson.type === 'online' ? '🌐 Online Ders' : '🏫 Yüz Yüze',
        lesson.location ? `📍 Konum: ${lesson.location}` : '',
        lesson.meetingLink ? `🔗 Meeting: ${lesson.meetingLink}` : '',
        lesson.notes ? `📝 Not: ${lesson.notes}` : '',
      ].filter(Boolean).join('\n'),
      start: { dateTime: startDateTime, timeZone: 'Europe/Istanbul' },
      end: { dateTime: endDateTime, timeZone: 'Europe/Istanbul' },
      location: lesson.location || '',
    };

    let googleEventId = lesson.googleEventId;
    let resultAction = 'created';

    if (googleEventId && action === 'update') {
      // Update existing event
      const updateRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
        { method: 'PUT', headers: authHeader, body: JSON.stringify(eventPayload) }
      );
      if (updateRes.ok) {
        resultAction = 'updated';
      } else {
        // Event may no longer exist, create new
        googleEventId = null;
      }
    }

    if (!googleEventId) {
      // Create new event
      const createRes = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        { method: 'POST', headers: authHeader, body: JSON.stringify(eventPayload) }
      );
      if (!createRes.ok) {
        const err = await createRes.text();
        return Response.json({ error: 'Calendar API error', detail: err }, { status: 500 });
      }
      const created = await createRes.json();
      googleEventId = created.id;
      resultAction = 'created';
    }

    // Save googleEventId back to lesson
    await base44.entities.Lesson.update(lessonId, { googleEventId });

    return Response.json({ success: true, action: resultAction, googleEventId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});