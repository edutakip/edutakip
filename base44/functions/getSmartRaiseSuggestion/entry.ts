import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, language = 'tr' } = body;

    if (!studentId) {
      return Response.json({ error: 'studentId is required' }, { status: 400 });
    }

    // Öğrenci bilgisini al
    const student = await base44.asServiceRole.entities.Student.list().then(students =>
      students.find(s => s.id === studentId && s.teacherEmail === user.email)
    );

    if (!student) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    // Öğrencinin ödeme geçmişini al
    const payments = await base44.asServiceRole.entities.Payment.filter({
      studentId: studentId,
      teacherEmail: user.email
    });

    // Öğrencinin ders geçmişini al
    const lessons = await base44.asServiceRole.entities.Lesson.filter({
      studentId: studentId,
      teacherEmail: user.email
    });

    // Öğrencinin ders raporlarını al
    const reports = await base44.asServiceRole.entities.LessonReport.filter({
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
      lessons.length,
      language
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
  totalLessons,
  language = 'tr'
) {
  const isEnglish = language === 'en';
  
  // Eğer çok az ders varsa zam önerme
  if (totalLessons < 5) {
    return {
      recommendation: 'wait',
      raisePercentage: 0,
      newFee: currentFee,
      reason: isEnglish 
        ? 'Not enough lessons with the student yet. Fee review can be considered after at least 5 lessons.'
        : 'Öğrenci ile henüz yeterli ders geçmemiş. En az 5 ders sonrasında zam değerlendirmesi yapılabilir.',
      factors: {
        paymentDiscipline: isEnglish ? 'Unknown' : 'Bilgisiz',
        performance: isEnglish ? 'Unknown' : 'Bilgisiz',
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
    factors.paymentDiscipline = isEnglish 
      ? 'Excellent (90%+) - +10% suggested'
      : 'Mükemmel (90%+) - +10% öne sürülür';
  } else if (paymentDiscipline >= 75) {
    raisePercentage += 5;
    factors.paymentDiscipline = isEnglish 
      ? 'Good (75-89%) - +5% suggested'
      : 'İyi (75-89%) - +5% öne sürülür';
  } else if (paymentDiscipline >= 50) {
    factors.paymentDiscipline = isEnglish 
      ? 'Fair (50-74%) - Raise not recommended'
      : 'Orta (50-74%) - Zam önerilmez';
  } else {
    raisePercentage -= 10;
    factors.paymentDiscipline = isEnglish 
      ? 'Poor (<50%) - Raise not advised'
      : 'Düşük (<50%) - Zam yapılmamalı';
  }

  // Performansa bakarak değerlendirme
  if (avgRating && avgRating >= 4.5) {
    raisePercentage += 15;
    factors.performance = isEnglish 
      ? 'Excellent (4.5+) - +15% suggested'
      : 'Mükemmel (4.5+) - +15% öne sürülür';
  } else if (avgRating && avgRating >= 4.0) {
    raisePercentage += 10;
    factors.performance = isEnglish 
      ? 'Very Good (4.0-4.4) - +10% suggested'
      : 'Çok iyi (4.0-4.4) - +10% öne sürülür';
  } else if (avgRating && avgRating >= 3.0) {
    factors.performance = isEnglish 
      ? 'Fair (3.0-3.9) - Raise not recommended'
      : 'Orta (3.0-3.9) - Zam önerilmez';
  } else if (avgRating) {
    raisePercentage -= 10;
    factors.performance = isEnglish 
      ? 'Poor (<3.0) - Raise not advised'
      : 'Düşük (<3.0) - Zam yapılmamalı';
  }

  // Gecikmeli ödeme cezası
  if (latePayments > 2) {
    raisePercentage -= 5;
    factors.paymentDiscipline += isEnglish 
      ? ' (-5% due to delays)'
      : ' (-5% gecikmeler nedeniyle)';
  }

  // Sonuçlandırma
  if (raisePercentage >= 15) {
    recommendation = 'strongly-recommend';
    reason = isEnglish
      ? `This student is an excellent candidate. Their payment reliability and academic performance are outstanding. A ${raisePercentage}% fee increase is justified.`
      : `Öğrenci mükemmel bir aday. Ödeme disiplini ve akademik performansı çok iyi. %${raisePercentage} oranında zam yapılabilir.`;
  } else if (raisePercentage >= 5) {
    recommendation = 'consider-increase';
    reason = isEnglish
      ? `This student shows good performance. A moderate ${raisePercentage}% fee increase can be considered.`
      : `Öğrenci iyi performans gösteriyor. %${raisePercentage} oranında ılımlı bir zam yapılabilir.`;
  } else if (raisePercentage <= -5) {
    recommendation = 'not-recommended';
    reason = isEnglish
      ? "The student's payment reliability or performance does not support a fee increase. No raise is advised at this time."
      : 'Öğrencinin ödeme disiplini veya performansı zam önermeyi desteklemiyor. Şu anda zam yapılmamalı.';
  } else {
    recommendation = 'wait';
    reason = isEnglish
      ? 'Data does not strongly support a fee increase. Continue monitoring until the next review period.'
      : 'Veriler zam yapılmasını güçlü şekilde desteklemiyor. Bir sonraki döneme kadar gözlemlenmelidir.';
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