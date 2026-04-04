import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CONNECTOR_ID = '69d0d68af50f7f9115160538';

// Generates a Google Meet link via Calendar API if user has connected Google Calendar.
// Returns { link, provider: 'googlemeet' | 'jitsi' }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { date, startTime, endTime, studentName, subject } = body;

    // Try to get Google Calendar access token
    let accessToken;
    try {
      accessToken = await base44.asServiceRole.connectors.getCurrentAppUserAccessToken(CONNECTOR_ID);
    } catch (e) {
      // Not connected — return null so frontend uses Jitsi
      return Response.json({ connected: false });
    }

    // Build a minimal calendar event with conferenceData to get a Meet link
    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;
    const requestId = `edutakip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const eventPayload = {
      summary: `📚 ${studentName || 'Öğrenci'} - ${subject || 'Ders'}`,
      start: { dateTime: startDateTime, timeZone: 'Europe/Istanbul' },
      end: { dateTime: endDateTime, timeZone: 'Europe/Istanbul' },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Calendar API error:', err);
      return Response.json({ connected: true, error: err });
    }

    const created = await res.json();
    const meetLink = created.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri
      || created.hangoutLink
      || null;

    const googleEventId = created.id;

    return Response.json({ connected: true, link: meetLink, provider: 'googlemeet', googleEventId });
  } catch (error) {
    console.error('generateMeetingLink error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});