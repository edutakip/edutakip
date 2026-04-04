import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteCode } = await req.json();
    if (!inviteCode) {
      return Response.json({ error: 'Kod gerekli' }, { status: 400 });
    }

    // Service role ile ara (RLS bypass)
    const students = await base44.asServiceRole.entities.Student.filter({ inviteCode: inviteCode.toUpperCase() });

    if (students.length === 0) {
      return Response.json({ found: false });
    }

    const student = students[0];

    // Update student with parent email
    await base44.asServiceRole.entities.Student.update(student.id, {
      inviteAccepted: true,
      parentEmail: user.email,
    });

    return Response.json({ found: true, studentName: student.name });
  } catch (error) {
    console.error('joinWithInviteCode error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});