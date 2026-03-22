import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, CheckCircle, Sparkles, ChevronRight } from 'lucide-react';
import WhatsAppMessageModal from './WhatsAppMessageModal';

const STEPS = ['Ders Bilgisi', 'Sayfalar', 'Performans', 'Detaylar', 'Rapor'];

const RATING_LABELS = { 1: 'Zayıf', 2: 'Orta', 3: 'İyi', 4: 'Çok İyi', 5: 'Mükemmel' };

const CHOICES = {
  understood:   [{ v: 'tam',    l: 'Tam Anladı',        icon: '✅' }, { v: 'kismen', l: 'Kısmen Anladı',     icon: '🔶' }, { v: 'tekrar', l: 'Tekrar Gerekli',    icon: '🔁' }],
  participation:[{ v: 'aktif',  l: 'Aktif Katılım',     icon: '🙋' }, { v: 'orta',   l: 'Orta Katılım',      icon: '😐' }, { v: 'pasif',  l: 'Pasif',             icon: '😶' }],
  motivation:   [{ v: 'yuksek',l: 'Yüksek',             icon: '🔥' }, { v: 'normal', l: 'Normal',            icon: '👍' }, { v: 'dusuk',  l: 'Düşük',             icon: '😞' }],
};

function ChoiceGroup({ label, field, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {CHOICES[field].map(opt => (
          <button key={opt.v} onClick={() => onChange(opt.v)}
            style={{ padding: '0.5rem 1rem', borderRadius: 10, border: `1.5px solid ${value === opt.v ? '#4f46e5' : '#e5e7eb'}`, background: value === opt.v ? '#eef2ff' : 'white', color: value === opt.v ? '#4338ca' : '#6b7280', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {opt.icon} {opt.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Genel Performans Puanı</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => onChange(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', fontSize: '1.75rem', lineHeight: 1, transition: 'transform 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            {n <= value ? '⭐' : '☆'}
          </button>
        ))}
        {value > 0 && <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', marginLeft: '0.25rem' }}>{RATING_LABELS[value]}</span>}
      </div>
    </div>
  );
}

export default function LessonReportModal({ lesson, onClose, onSaved }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    topics: '',
    understood: '',
    participation: '',
    motivation: '',
    challenge: '',
    homework: '',
    nextGoal: '',
    rating: 4,
    attendance: 'katıldı',
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [existing, setExisting] = useState(null);
  const [whatsapp, setWhatsapp] = useState(null);
  const [pageImages, setPageImages] = useState([]); // base64 resimler

  useEffect(() => {
    base44.entities.LessonReport.filter({ lessonId: lesson.id }).then(reports => {
      if (reports.length > 0) {
        const r = reports[0];
        setExisting(r);
        setForm(f => ({
          ...f,
          topics: r.topicsCovered || '',
          homework: r.homework || '',
          nextGoal: r.nextGoal || '',
          rating: r.rating || 4,
          attendance: r.attendance || 'katıldı',
          challenge: r.improvements || '',
          generalNote: r.generalNote || '',
        }));
        if (r.generalNote) {
          setGeneratedReport(r.generalNote);
          setStep(3);
        }
      }
    });
  }, [lesson.id]);

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generateReport = async () => {
    setGenerating(true);
    try {
      const understoodMap = { tam: 'tam olarak anladı', kismen: 'konuyu kısmen anladı', tekrar: 'konuyu tekrar gözden geçirmesi gerekiyor' };
      const participationMap = { aktif: 'aktif bir katılım gösterdi', orta: 'orta düzeyde katılım gösterdi', pasif: 'derse pasif olarak katıldı' };
      const motivationMap = { yuksek: 'yüksek', normal: 'normal', dusuk: 'düşük' };
      const ratingStars = '⭐'.repeat(form.rating) + '☆'.repeat(5 - form.rating);

      const prompt = `Sen deneyimli ve pedagojik açıdan güçlü bir özel öğretmensin. Aşağıdaki ders bilgilerine dayanarak veliye gönderilecek profesyonel, sıcak ve pedagojik bir ders değerlendirme raporu yaz.

Ders Bilgileri:
- Öğrenci: ${lesson.studentName}
- Konu: ${lesson.subject || 'Belirtilmemiş'}
- Tarih: ${lesson.date}
- İşlenen Konular: ${form.topics}
- Anlama Düzeyi: ${understoodMap[form.understood] || form.understood}
- Katılım: ${participationMap[form.participation] || form.participation}
- Motivasyon: ${motivationMap[form.motivation] || form.motivation} seviyedeydi
- Performans Puanı: ${form.rating}/5 ${ratingStars}
- Katılım Durumu: ${form.attendance}
${form.challenge ? `- Zorlandığı Nokta: ${form.challenge}` : ''}
${form.homework ? `- Verilen Ödev: ${form.homework}` : ''}
${form.nextGoal ? `- Sonraki Ders Hedefi: ${form.nextGoal}` : ''}

Raporu şu formatta yaz:
1. Giriş cümlesi (bugünkü dersi özetle)
2. Öğrencinin performansını ve katılımını açıkla
3. Varsa zorlandığı noktayı pedagojik bir dille açıkla ve nasıl çalışacağını belirt
4. Ödevi ve sonraki ders hedefini belirt (📚 ve ➡️ emojileriyle)
5. Teşekkür cümlesiyle bitir

Ton: Profesyonel ama sıcak. Türkçe. Veliye hitap et. Madde madde değil, akıcı paragraflar halinde yaz.`;

      // Eğer resim varsa vision API kullan
      let result;
      if (pageImages.length > 0) {
        const imageDescPrompt = prompt + `

Ayrıca ders sayfalarının ${pageImages.length} adet fotoğrafı da sana gönderilmiştir. Bu sayfalardaki içerikleri de göz önünde bulundurarak raporu zenginleştir.`;
        result = await base44.integrations.Core.InvokeLLM({
          prompt: imageDescPrompt,
          images: pageImages.map(img => ({ type: 'base64', data: img.split(',')[1], mediaType: img.split(';')[0].split(':')[1] })),
        });
      } else {
        result = await base44.integrations.Core.InvokeLLM({ prompt });
      }
      const text = typeof result === 'string' ? result : result?.text || result?.content || JSON.stringify(result);
      setGeneratedReport(text);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    const data = {
      lessonId: lesson.id,
      studentId: lesson.studentId,
      studentName: lesson.studentName,
      teacherEmail: me.email,
      date: lesson.date,
      subject: lesson.subject,
      rating: form.rating,
      attendance: form.attendance,
      topicsCovered: form.topics,
      generalNote: generatedReport,
      improvements: form.challenge,
      homework: form.homework,
      nextGoal: form.nextGoal,
    };

    if (existing) {
      await base44.entities.LessonReport.update(existing.id, data);
    } else {
      await base44.entities.LessonReport.create(data);
    }

    if (form.homework?.trim()) {
      const existingHws = await base44.entities.Homework.filter({ lessonId: lesson.id });
      if (existingHws.length > 0) {
        await base44.entities.Homework.update(existingHws[0].id, { title: form.homework, description: form.homework });
      } else {
        await base44.entities.Homework.create({
          lessonId: lesson.id, studentId: lesson.studentId,
          studentName: lesson.studentName, teacherEmail: me.email,
          title: form.homework, description: form.homework, status: 'verildi',
        });
      }
    }

    setLoading(false);

    const students = await base44.entities.Student.filter({ id: lesson.studentId });
    const student = students[0];
    const phone = student?.parentPhone || lesson.parentPhone;

    if (phone) {
      setWhatsapp({ phone, message: generatedReport });
    } else {
      onSaved?.();
      onClose();
    }
  };

  const inp = {
    width: '100%', background: '#f8fafc', border: '1.5px solid #e5e7eb',
    borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.875rem',
    color: '#111827', outline: 'none', boxSizing: 'border-box', resize: 'vertical',
  };

  const canNext = () => {
    if (step === 0) return form.topics.trim() && form.attendance;
    if (step === 1) return true; // Sayfalar opsiyonel
    if (step === 2) return form.understood && form.participation && form.motivation && form.rating;
    if (step === 3) return true;
    return true;
  };

  if (whatsapp) {
    return <WhatsAppMessageModal phone={whatsapp.phone} message={whatsapp.message} onClose={() => { onSaved?.(); onClose(); }} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.15rem' }}>Ders Değerlendirmesi</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{lesson.studentName} · {lesson.date} · {lesson.startTime?.slice(0,5)}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
            <X size={16} color='#6b7280' />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', padding: '1rem 1.5rem 0' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: i <= step ? '#4f46e5' : '#f3f4f6', color: i <= step ? 'white' : '#9ca3af', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: i === step ? 700 : 500, color: i === step ? '#4f46e5' : '#9ca3af', whiteSpace: 'nowrap' }}>{s}</span>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? '#4f46e5' : '#f3f4f6', margin: '0 0.5rem', transition: 'all 0.2s' }} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* Step 0: Ders Bilgisi */}
          {step === 0 && (
            <>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>İşlenen Konular</label>
                <textarea value={form.topics} onChange={e => u('topics', e.target.value)}
                  placeholder="Örn: Present Simple zamanı + Çiftlik hayvanları..." rows={3} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Katılım Durumu</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['katıldı', 'geç kaldı', 'katılmadı'].map(opt => (
                    <button key={opt} onClick={() => u('attendance', opt)}
                      style={{ border: `1.5px solid ${form.attendance === opt ? '#4f46e5' : '#e5e7eb'}`, background: form.attendance === opt ? '#eef2ff' : 'white', color: form.attendance === opt ? '#4338ca' : '#6b7280', borderRadius: 10, padding: '0.45rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 1: Sayfalar */}
          {step === 1 && (
            <>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem', border: '1.5px dashed #e5e7eb', textAlign: 'center' }}>
                <label htmlFor="pageImgInput" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                  <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Sayfa Fotoğrafı Ekle</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>İşlenen sayfaların fotoğraflarını ekleyin (opsiyonel). AI rapor yazarken bu sayfaları da analiz eder.</div>
                  <input id="pageImgInput" type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={async e => {
                      const files = Array.from(e.target.files);
                      const b64s = await Promise.all(files.map(f => new Promise((res) => {
                        const reader = new FileReader();
                        reader.onload = ev => res(ev.target.result);
                        reader.readAsDataURL(f);
                      })));
                      setPageImages(prev => [...prev, ...b64s].slice(0, 4));
                    }} />
                </label>
              </div>
              {pageImages.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>{pageImages.length} fotoğraf eklendi</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {pageImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img} alt={`Sayfa ${i+1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e5e7eb' }} />
                        <button onClick={() => setPageImages(prev => prev.filter((_, pi) => pi !== i))}
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 2: Performans */}
          {step === 2 && (
            <>
              <StarRating value={form.rating} onChange={v => u('rating', v)} />
              <ChoiceGroup label="Konuyu Anladı mı?" field="understood" value={form.understood} onChange={v => u('understood', v)} />
              <ChoiceGroup label="Katılım Seviyesi" field="participation" value={form.participation} onChange={v => u('participation', v)} />
              <ChoiceGroup label="Motivasyon" field="motivation" value={form.motivation} onChange={v => u('motivation', v)} />
            </>
          )}

          {/* Step 3: Detaylar */}
          {step === 3 && (
            <>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zorlandığı Nokta <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></label>
                <textarea value={form.challenge} onChange={e => u('challenge', e.target.value)}
                  placeholder="Öğrencinin zorlandığı veya dikkat edilmesi gereken bir alan..." rows={3} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verilen Ödev <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></label>
                <textarea value={form.homework} onChange={e => u('homework', e.target.value)}
                  placeholder="Aktivite kitabı sayfa 63..." rows={2} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sonraki Ders Hedefi <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></label>
                <textarea value={form.nextGoal} onChange={e => u('nextGoal', e.target.value)}
                  placeholder="Sayfa 52'den devam, telaffuza odaklanacağız..." rows={2} style={inp} />
              </div>
            </>
          )}

          {/* Step 4: Rapor */}
          {step === 4 && (
            <>
              <div style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderRadius: 14, padding: '1rem', border: '1.5px solid #c7d2fe', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Sparkles size={18} color='#4f46e5' />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#4338ca' }}>AI tarafından oluşturuldu</div>
                  <div style={{ fontSize: '0.75rem', color: '#6366f1' }}>Metni düzenleyebilir veya olduğu gibi kullanabilirsiniz</div>
                </div>
              </div>
              <textarea value={generatedReport} onChange={e => setGeneratedReport(e.target.value)}
                rows={14} style={{ ...inp, lineHeight: 1.7, fontSize: '0.88rem' }} />
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              style={{ padding: '0.6rem 1.1rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              Geri
            </button>
          ) : <div />}

          {step < 3 && (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', background: canNext() ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e5e7eb', color: canNext() ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '0.85rem', cursor: canNext() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              İleri <ChevronRight size={15} />
            </button>
          )}

          {step === 3 && (
            <button onClick={generateReport} disabled={generating}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
              {generating ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={15} />}
              {generating ? 'Rapor Oluşturuluyor...' : 'AI ile Rapor Oluştur'}
            </button>
          )}

          {step === 4 && (
            <button onClick={handleSave} disabled={loading || !generatedReport}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
              {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={15} />}
              Kaydet ve Veliye Gönder
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}