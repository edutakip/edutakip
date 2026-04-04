import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function getZoomAccessToken() {
  const accountId = Deno.env.get('ZOOM_ACCOUNT_ID');
  const clientId = Deno.env.get('ZOOM_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET');

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoom token alınamadı: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, startTime, duration } = await req.json();

    const accessToken = await getZoomAccessToken();

    const meetingPayload = {
      topic: topic || 'EduTakip Dersi',
      type: 2, // Scheduled meeting
      start_time: startTime, // ISO 8601: "2024-01-15T10:00:00"
      duration: duration || 60,
      timezone: 'Europe/Istanbul',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        waiting_room: false,
        auto_recording: 'none',
      },
    };

    const meetingRes = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingPayload),
    });

    if (!meetingRes.ok) {
      const err = await meetingRes.text();
      throw new Error(`Zoom toplantısı oluşturulamadı: ${err}`);
    }

    const meeting = await meetingRes.json();

    return Response.json({
      join_url: meeting.join_url,
      meeting_id: meeting.id,
      password: meeting.password,
    });
  } catch (error) {
    console.error('createZoomMeeting error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});