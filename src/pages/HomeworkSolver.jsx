import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Home, Trophy, Zap, Star } from 'lucide-react';

// ── Confetti burst ────────────────────────────────────────────
function ConfettiBurst({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4,
      r: Math.random() * 7 + 3,
      color: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 6)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 1,
      alpha: 1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.012;
      });
      if (particles.some(p => p.alpha > 0)) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
}

// ── Progress Bar ──────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ padding: '1rem 1.25rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          İlerleme
        </span>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>{current}/{total}</span>
      </div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
          transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '0 0 8px rgba(167,139,250,0.6)',
        }} />
      </div>
    </div>
  );
}

// ── Hearts / Lives ────────────────────────────────────────────
function Hearts({ lives, maxLives = 3 }) {
  return (
    <div style={{ display: 'flex', gap: '0.2rem' }}>
      {Array.from({ length: maxLives }).map((_, i) => (
        <span key={i} style={{ fontSize: '1.1rem', filter: i >= lives ? 'grayscale(1) opacity(0.3)' : 'none', transition: 'all 0.3s' }}>❤️</span>
      ))}
    </div>
  );
}

// ── Question Card ─────────────────────────────────────────────
function QuestionCard({ question, onAnswer, slideDir }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setSelected(null);
    setConfirmed(false);
    setInputVal('');
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [question]);

  const handleCheck = () => {
    if (confirmed) return;
    let ans = question.type === 'fill' ? inputVal.trim() : selected;
    if (!ans && ans !== 0) return;
    setConfirmed(true);
    let correct = false;
    if (question.type === 'fill') {
      correct = question.answers?.some(a => a.toLowerCase().trim() === ans.toLowerCase().trim()) ?? false;
    } else {
      correct = ans === question.correctIndex;
    }
    setTimeout(() => onAnswer(correct), 900);
  };

  const isReady = question.type === 'fill' ? inputVal.trim().length > 0 : selected !== null;

  const slideIn = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0) scale(1)' : `translateX(${slideDir === 'left' ? '40px' : '-40px'}) scale(0.97)`,
    transition: 'opacity 0.35s ease, transform 0.35s ease',
  };

  return (
    <div style={{ ...slideIn, padding: '0 1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Type badge */}
      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
          background: 'rgba(167,139,250,0.2)', color: '#c4b5fd', padding: '0.25rem 0.65rem', borderRadius: 20,
          border: '1px solid rgba(167,139,250,0.3)',
        }}>
          {question.type === 'multiple' ? '🔤 Çoktan Seçmeli' :
           question.type === 'truefalse' ? '✅ Doğru / Yanlış' :
           question.type === 'fill' ? '✏️ Boşluk Doldurma' : '❓ Soru'}
        </span>
      </div>

      {/* Question text */}
      <div style={{
        background: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.25rem',
        marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
      }}>
        <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', lineHeight: 1.55, margin: 0 }}>
          {question.question}
        </p>
      </div>

      {/* Options */}
      {(question.type === 'multiple' || question.type === 'truefalse') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {question.options?.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.07)';
            let border = '1.5px solid rgba(255,255,255,0.12)';
            let color = 'rgba(255,255,255,0.9)';
            let icon = null;

            if (confirmed) {
              if (i === question.correctIndex) {
                bg = 'rgba(16,185,129,0.2)'; border = '1.5px solid #10b981'; color = '#6ee7b7';
                icon = <CheckCircle size={18} color="#10b981" />;
              } else if (i === selected && i !== question.correctIndex) {
                bg = 'rgba(239,68,68,0.2)'; border = '1.5px solid #ef4444'; color = '#fca5a5';
                icon = <XCircle size={18} color="#ef4444" />;
              }
            } else if (selected === i) {
              bg = 'rgba(99,102,241,0.3)'; border = '1.5px solid #818cf8'; color = 'white';
            }

            return (
              <button key={i} onClick={() => !confirmed && setSelected(i)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.85rem 1.1rem', borderRadius: 14,
                background: bg, border, color,
                fontWeight: 600, fontSize: '0.9rem', cursor: confirmed ? 'default' : 'pointer',
                textAlign: 'left', transition: 'all 0.2s',
                transform: selected === i && !confirmed ? 'scale(1.02)' : 'scale(1)',
              }}>
                <span>{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>
      )}

      {/* Fill input */}
      {question.type === 'fill' && (
        <div style={{ marginBottom: '1.25rem' }}>
          <input
            value={inputVal}
            onChange={e => !confirmed && setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && isReady && !confirmed && handleCheck()}
            placeholder="Cevabını yaz..."
            disabled={confirmed}
            style={{
              width: '100%', padding: '0.9rem 1.1rem', borderRadius: 14,
              border: confirmed
                ? (question.answers?.some(a => a.toLowerCase().trim() === inputVal.toLowerCase().trim())
                  ? '1.5px solid #10b981' : '1.5px solid #ef4444')
                : '1.5px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)', color: 'white',
              fontSize: '1rem', fontWeight: 600, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.3s',
            }}
          />
          {confirmed && (
            <p style={{ fontSize: '0.78rem', color: '#6ee7b7', marginTop: '0.5rem', fontWeight: 600 }}>
              Doğru cevap: {question.answers?.[0]}
            </p>
          )}
        </div>
      )}

      {/* Check button */}
      {!confirmed && (
        <button onClick={handleCheck} disabled={!isReady} style={{
          padding: '0.9rem', borderRadius: 14, border: 'none',
          background: isReady ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : 'rgba(255,255,255,0.1)',
          color: isReady ? 'white' : 'rgba(255,255,255,0.3)',
          fontWeight: 800, fontSize: '1rem', cursor: isReady ? 'pointer' : 'default',
          boxShadow: isReady ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}>
          Kontrol Et <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

// ── Finish Screen ─────────────────────────────────────────────
function FinishScreen({ score, total, onHome }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', textAlign: 'center' }}>
      <div style={{ marginBottom: '1.5rem', animation: 'pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <Trophy size={64} color="#f59e0b" fill="#f59e0b" />
      </div>
      <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
        {pct >= 80 ? 'Harika!' : pct >= 50 ? 'İyi İş!' : 'Daha fazla çalış!'}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        {total} sorudan {score} doğru ({pct}%)
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1,2,3].map(s => (
          <Star key={s} size={36} color="#f59e0b" fill={s <= stars ? '#f59e0b' : 'transparent'}
            style={{ filter: s <= stars ? 'drop-shadow(0 0 8px rgba(245,158,11,0.7))' : 'none' }} />
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '1rem 2rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#a78bfa' }}>{pct}%</div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Başarı Oranı</div>
      </div>
      <button onClick={onHome} style={{
        padding: '0.9rem 2rem', borderRadius: 14, border: 'none',
        background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white',
        fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
      }}>
        <Home size={18} /> Ana Sayfaya Dön
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function HomeworkSolver() {
  const [hw, setHw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [slideDir, setSlideDir] = useState('left');
  const [finished, setFinished] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [answered, setAnswered] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hwId = params.get('id');
    if (!hwId) { setError('Ödev bulunamadı.'); setLoading(false); return; }
    base44.entities.Homework.filter({ id: hwId }).then(list => {
      const found = list[0];
      if (!found) { setError('Ödev bulunamadı.'); setLoading(false); return; }
      setHw(found);
      setLoading(false);
    }).catch(() => { setError('Ödev yüklenemedi.'); setLoading(false); });
  }, []);

  const questions = hw?.questions || [];
  const total = questions.length;

  const saveResult = (finalScore, finalTotal) => {
    if (!hw?.id) return;
    const pct = finalTotal > 0 ? Math.round((finalScore / finalTotal) * 100) : 0;
    base44.entities.Homework.update(hw.id, {
      status: 'tamamlandı',
      gameResult: { score: finalScore, total: finalTotal, percentage: pct },
    }).catch(() => {});
  };

  const handleAnswer = (correct) => {
    const newScore = correct ? score + 1 : score;
    const newLives = correct ? lives : Math.max(0, lives - 1);
    const next = currentIdx + 1;

    setAnswered(a => a + 1);
    if (correct) {
      setScore(newScore);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    } else {
      setLives(newLives);
    }

    setSlideDir('left');
    if (next >= total || newLives <= 0) {
      setTimeout(() => {
        saveResult(newScore, total);
        setFinished(true);
      }, 400);
    } else {
      setTimeout(() => setCurrentIdx(next), 400);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#a78bfa', animation: 'spin 0.9s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !hw) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: 'white', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
      <XCircle size={48} color="#ef4444" />
      <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>{error || 'Ödev yüklenemedi.'}</p>
      <button onClick={() => window.history.back()} style={{ padding: '0.7rem 1.5rem', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Geri Dön</button>
    </div>
  );

  if (total === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: 'white', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
      <Zap size={48} color="#f59e0b" />
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Bu ödevde henüz soru yok</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Öğretmenin interaktif sorular eklemesi bekleniyor.</p>
      <button onClick={() => window.history.back()} style={{ padding: '0.7rem 1.5rem', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Geri Dön</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#1e1b4b 0%,#312e81 40%,#1e3a5f 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pop{from{transform:scale(0.3);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
      `}</style>

      <ConfettiBurst active={confetti} />

      {!finished && (
        <>
          {/* Header */}
          <div style={{ padding: '1rem 1.25rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => window.history.back()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: '0.4rem 0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              ✕ Çık
            </button>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: 0, fontWeight: 600 }}>
                {hw.title}
              </p>
            </div>
            <Hearts lives={lives} />
          </div>

          <ProgressBar current={answered} total={total} />

          {/* Skor */}
          <div style={{ padding: '0.5rem 1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '0.25rem 0.65rem' }}>
              <Zap size={12} color="#fbbf24" fill="#fbbf24" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24' }}>{score} puan</span>
            </div>
          </div>
        </>
      )}

      {finished ? (
        <FinishScreen score={score} total={total} onHome={() => navigate('/ParentHomework')} />
      ) : (
        <QuestionCard
          key={currentIdx}
          question={questions[currentIdx]}
          onAnswer={handleAnswer}
          slideDir={slideDir}
        />
      )}
    </div>
  );
}