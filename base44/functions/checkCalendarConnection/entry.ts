import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CONNECTOR_ID = '69d0d68af50f7f9115160538';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ connected: false }, { status: 401 });
    }

    const accessToken = await base44.asServiceRole.connectors.getCurrentAppUserAccessToken(CONNECTOR_ID);
    if (!accessToken) {
      return Response.json({ connected: false });
    }

    // Token var mı gerçekten çalışıyor mu diye Google'a basit bir istek at
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return Response.json({ connected: res.ok });
  } catch (e) {
    return Response.json({ connected: false });
  }
});