import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return Response.json({ error: 'Kod gerekli' }, { status: 400 });
    }

    const code = inviteCode.toUpperCase().trim();
    console.log('Searching for inviteCode:', code);

    // Get current user
    let userEmail = '';
    try {
      const user = await base44.auth.me();
      userEmail = user?.email || '';
    } catch (e) {
      console.log('Auth error (test mode?):', e.message);
    }

    // Service role ile RLS bypass ederek ara
    const students = await base44.asServiceRole.entities.Student.filter({ inviteCode: code });
    console.log('Students found:', students.length, 'for code:', code);

    if (!students || students.length === 0) {
      return Response.json({ found: false });
    }

    const student = students[0];
    console.log('Found student:', student.name, 'id:', student.id);

    // Update student with parent email
    await base44.asServiceRole.entities.Student.update(student.id, {
      inviteAccepted: true,
      parentEmail: userEmail,
    });

    return Response.json({ found: true, studentName: student.name });
  } catch (error) {
    console.error('joinWithInviteCode error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});