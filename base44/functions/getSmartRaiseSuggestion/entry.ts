import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { studentId } = body;

    if (!studentId) {
      return Response.json({ error: 'studentId is required' }, { status: 400 });
    }

    // Öğrenci bilgisini al
    const student = await base44.entities.Student.list().then(students =>
      students.find(s => s.id === studentId && s.teacherEmail === user.email)
    );

    if (!student) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    // Öğrencinin ödeme geçmişini al
    const payments = await base44.entities.Payment.filter({
      studentId: studentId,
      teacherEmail: user.email
    });

    // Öğrencinin ders geçmişini al
    const lessons = await base44.entities.Lesson.filter({
      studentId: studentId,
      teacherEmail: user.email
    });

    // Öğrencinin ders raporlarını al
    const reports = await base44.entities.LessonReport.filter({
      studentId: studentId,
      teacherEmail: user.email
    });

    // Veri analizi
    const currentFeePerLesson = student.feePerLesson || 0;
    const totalPayments = payments.filter(p => p.status === 'alındı').length || 0;
    const pendingPayments = payments.filter(p => p.status === 'bekliyor').length || 0;
    const latePayments = payments.filter(p => p.status === 'gecikmis').length || 0;

    // Ortalama ders performansı
    const avgRating = reports.length > 0
      ? (reports.reduce((sum, r) => sum + (r.rating || 0), 0) / reports.length).toFixed(2)
      : null;

    // Ödeme disiplini skoru (0-100)
    const paymentDiscipline = (() => {
      if (totalPayments === 0) return 0;
      const onTimePayments = totalPayments - latePayments;
      return Math.round((onTimePayments / totalPayments) * 100);
    })();

    // Zam önerisi mantığı
    const suggestion = calculateRaiseSuggestion(
      currentFeePerLesson,
      paymentDiscipline,
      avgRating,
      totalPayments,
      latePayments,
      lessons.length
    );

    return Response.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        currentFeePerLesson,
        lessonDuration: student.lessonDuration || 60,
      },
      analysis: {
        totalPayments,
        pendingPayments,
        latePayments,
        paymentDiscipline,
        avgRating,
        totalLessons: lessons.length,
      },
      suggestion,
    });
  } catch (error) {
    console.error('[getSmartRaiseSuggestion] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateRaiseSuggestion(
  currentFee,
  paymentDiscipline,
  avgRating,
  totalPayments,
  latePayments,
  totalLessons
) {
  // Eğer çok az ders varsa zam önerme
  if (totalLessons < 5) {
    return {
      recommendation: 'bekleme',
      raisePercentage: 0,
      newFee: currentFee,
      reason: 'Öğrenci ile henüz yeterli ders geçmemiş. En az 5 ders sonrasında zam değerlendirmesi yapılabilir.',
      factors: {
        paymentDiscipline: 'Bilgisiz',
        performance: 'Bilgisiz',
      },
    };
  }

  let recommendation = 'dusur';
  let raisePercentage = 0;
  let reason = '';
  const factors = {
    paymentDiscipline: '',
    performance: '',
  };

  // Ödeme disiplinine bakarak değerlendirme
  if (paymentDiscipline >= 90) {
    raisePercentage += 10;
    factors.paymentDiscipline = 'Mükemmel (90%+) - +10% öne sürülür';
  } else if (paymentDiscipline >= 75) {
    raisePercentage += 5;
    factors.paymentDiscipline = 'İyi (75-89%) - +5% öne sürülür';
  } else if (paymentDiscipline >= 50) {
    factors.paymentDiscipline = 'Orta (50-74%) - Zam önerilmez';
  } else {
    raisePercentage -= 10;
    factors.paymentDiscipline = 'Düşük (<50%) - Zam yapılmamalı';
  }

  // Performansa bakarak değerlendirme
  if (avgRating && avgRating >= 4.5) {
    raisePercentage += 15;
    factors.performance = 'Mükemmel (4.5+) - +15% öne sürülür';
  } else if (avgRating && avgRating >= 4.0) {
    raisePercentage += 10;
    factors.performance = 'Çok iyi (4.0-4.4) - +10% öne sürülür';
  } else if (avgRating && avgRating >= 3.0) {
    factors.performance = 'Orta (3.0-3.9) - Zam önerilmez';
  } else if (avgRating) {
    raisePercentage -= 10;
    factors.performance = 'Düşük (<3.0) - Zam yapılmamalı';
  }

  // Gecikmeli ödeme cezası
  if (latePayments > 2) {
    raisePercentage -= 5;
    factors.paymentDiscipline += ' (-5% gecikmeler nedeniyle)';
  }

  // Sonuçlandırma
  if (raisePercentage >= 15) {
    recommendation = 'onemle-al';
    reason = `Öğrenci mükemmel bir aday. Ödeme disiplini ve akademik performansı çok iyi. %${raisePercentage} oranında zam yapılabilir.`;
  } else if (raisePercentage >= 5) {
    recommendation = 'dusunerek-al';
    reason = `Öğrenci iyi performans gösteriyor. %${raisePercentage} oranında ılımlı bir zam yapılabilir.`;
  } else if (raisePercentage <= -5) {
    recommendation = 'dusur';
    reason = 'Öğrencinin ödeme disiplini veya performansı zam önermeyi desteklemiyor. Şu anda zam yapılmamalı.';
  } else {
    recommendation = 'bekleme';
    reason = 'Veriler zam yapılmasını güçlü şekilde desteklemiyor. Bir sonraki döneme kadar gözlemlenmelidir.';
  }

  const newFee = Math.round(currentFee * (1 + raisePercentage / 100));

  return {
    recommendation, // 'onemle-al' | 'dusunerek-al' | 'bekleme' | 'dusur'
    raisePercentage,
    newFee,
    reason,
    factors,
  };
}