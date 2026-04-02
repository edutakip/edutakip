import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Bugünün tarihini al
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Bugünün derslerini sorgula
    const allLessons = await base44.entities.Lesson.filter({
      teacherEmail: user.email,
      date: todayStr,
    });

    if (allLessons.length === 0) {
      return Response.json({
        success: true,
        lessons: [],
        message: 'Bugün dersler bulunmamaktadır.',
      });
    }

    // Her ders için öğrencinin önceki ders raporunu hazırla
    const lessonPrepData = await Promise.all(
      allLessons.map(async (lesson) => {
        // Öğrenci bilgisini al
        const student = await base44.entities.Student.list()
          .then(students => students.find(s => s.id === lesson.studentId));

        // Öğrencinin önceki ders raporlarını sırala (en yenisinden başlayarak)
        const lessonReports = await base44.entities.LessonReport.filter({
          studentId: lesson.studentId,
          teacherEmail: user.email,
        });

        // Bugünden önceki en son raporu bul
        const previousReport = lessonReports
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .find(r => new Date(r.date) < new Date(todayStr));

        return {
          lesson: {
            studentName: lesson.studentName || student?.name || 'Bilinmiyor',
            studentId: lesson.studentId,
            date: lesson.date,
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            subject: lesson.subject,
            type: lesson.type,
            location: lesson.location,
            meetingLink: lesson.meetingLink,
          },
          previousLesson: previousReport
            ? {
                date: previousReport.date,
                topicsCovered: previousReport.topicsCovered,
                homework: previousReport.homework,
                nextGoal: previousReport.nextGoal,
                strengths: previousReport.strengths,
                improvements: previousReport.improvements,
                rating: previousReport.rating,
                generalNote: previousReport.generalNote,
              }
            : null,
        };
      })
    );

    // Hazırlık önerileri oluştur
    const preparation = lessonPrepData.map((data) => {
      let suggestion = `📚 ${data.lesson.studentName} - ${data.lesson.startTime}`;

      if (data.previousLesson) {
        suggestion += `\n\n📖 Geçen Ders:\n`;
        if (data.previousLesson.topicsCovered) {
          suggestion += `• Konular: ${data.previousLesson.topicsCovered}\n`;
        }
        if (data.previousLesson.homework) {
          suggestion += `• Ödev: ${data.previousLesson.homework}\n`;
        }
        if (data.previousLesson.nextGoal) {
          suggestion += `• Hedef: ${data.previousLesson.nextGoal}\n`;
        }
        if (data.previousLesson.strengths) {
          suggestion += `• Güçlü Yönler: ${data.previousLesson.strengths}\n`;
        }
        if (data.previousLesson.improvements) {
          suggestion += `• Geliştirilmesi Gereken: ${data.previousLesson.improvements}\n`;
        }
      } else {
        suggestion += `\n\nℹ️ Bu öğrenci ile daha önce ders raporları oluşturulmamıştır.`;
      }

      return {
        ...data,
        suggestion,
      };
    });

    return Response.json({
      success: true,
      today: todayStr,
      totalLessons: lessonPrepData.length,
      lessons: preparation,
    });
  } catch (error) {
    console.error('[getTodayLessonPrep] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});