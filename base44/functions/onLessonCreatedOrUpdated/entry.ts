import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CONNECTOR_ID = '69d0d68af50f7f9115160538';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const { event, data } = body;
    if (!data || !data.teacherEmail) {
      return Response.json({ status: 'skipped', reason: 'no data' });
    }

    const lesson = data;
    const action = event?.type === 'create' ? 'create' : 'update';

    // Get access token for the teacher
    let accessToken;
    try {
      // We need to get the token as the teacher user
      // Use service role to get teacher's connection
      accessToken = await base44.asServiceRole.connectors.getCurrentAppUserAccessToken(CONNECTOR_ID);
    } catch (e) {
      // Teacher hasn't connected Google Calendar — skip silently
      return Response.json({ status: 'skipped', reason: 'not connected' });
    }

    const authHeader = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const dateStr = lesson.date;
    const startDateTime = `${dateStr}T${lesson.startTime}:00`;
    const endDateTime = lesson.endTime ? `${dateStr}T${lesson.endTime}:00` : null;

    if (!startDateTime || !endDateTime) {
      return Response.json({ status: 'skipped', reason: 'missing time' });
    }

    const eventPayload = {
      summary: `📚 ${lesson.studentName || 'Öğrenci'} - ${lesson.subject || 'Ders'}`,
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

    if (googleEventId && action === 'update') {
      // Try to update
      const updateRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
        { method: 'PUT', headers: authHeader, body: JSON.stringify(eventPayload) }
      );
      if (updateRes.ok) {
        return Response.json({ status: 'updated', googleEventId });
      }
      // Event gone — fall through to create
      googleEventId = null;
    }

    // Create new event
    const createRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      { method: 'POST', headers: authHeader, body: JSON.stringify(eventPayload) }
    );

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('Calendar API error:', err);
      return Response.json({ status: 'error', detail: err });
    }

    const created = await createRes.json();
    googleEventId = created.id;

    // Save googleEventId back to lesson
    await base44.asServiceRole.entities.Lesson.update(lesson.id, { googleEventId });

    return Response.json({ status: 'created', googleEventId });
  } catch (error) {
    console.error('onLessonCreatedOrUpdated error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});