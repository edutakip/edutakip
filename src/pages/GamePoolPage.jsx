import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Gamepad2, Plus, Trash2, Search, Filter, BookOpen, ChevronDown, X, CheckCircle } from 'lucide-react';
import { showToast } from '@/lib/toast';

const GRADE_LEVELS = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'];
const DIFFICULTY_COLORS = { Kolay: '#10b981', Orta: '#f59e0b', Zor: '#ef4444' };
const DIFFICULTY_BG = { Kolay: '#d1fae5', Orta: '#fef3c7', Zor: '#fee2e2' };

function QuestionTypeBadge({ type }) {
  const map = { multiple: { label: 'Çoktan Seçmeli', color: '#6366f1', bg: '#eef2ff' }, truefalse: { label: 'D/Y', color: '#0891b2', bg: '#e0f2fe' }, fill: { label: 'Boşluk', color: '#059669', bg: '#d1fae5' } };
  const cfg = map[type] || { label: type, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: cfg.bg, color: cfg.color, padding: '0.15rem 0.45rem', borderRadius: 20 }}>{cfg.label}</span>
  );
}

function GameCard({ game, onDelete, onUse }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}>
      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontWeight: 800, color: '#111827', fontSize: '0.95rem', margin: '0 0 0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.title}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#eef2ff', color: '#4f46e5', padding: '0.2rem 0.55rem', borderRadius: 20 }}>📚 {game.className}</span>
              {game.subject && <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', padding: '0.2rem 0.55rem', borderRadius: 20 }}>✏️ {game.subject}</span>}
              {game.difficulty && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: DIFFICULTY_BG[game.difficulty] || '#f3f4f6', color: DIFFICULTY_COLORS[game.difficulty] || '#6b7280', padding: '0.2rem 0.55rem', borderRadius: 20 }}>
                  ⚡ {game.difficulty}
                </span>
              )}
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#f8fafc', color: '#6b7280', padding: '0.2rem 0.55rem', borderRadius: 20 }}>🎯 {game.questions?.length || 0} soru</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            <button onClick={() => onUse(game)} style={{ padding: '0.45rem 0.85rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Plus size={13} /> Kullan
            </button>
            <button onClick={() => onDelete(game.id)} style={{ padding: '0.45rem', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        {game.questions?.length > 0 && (
          <button onClick={() => setExpanded(e => !e)} style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}>
            <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            {expanded ? 'Soruları Gizle' : 'Soruları Gör'}
          </button>
        )}
      </div>
      {expanded && game.questions?.length > 0 && (
        <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafbff', padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {game.questions.map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 800, color: '#6366f1', flexShrink: 0 }}>{i + 1}.</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem', flexWrap: 'wrap' }}>
                  <QuestionTypeBadge type={q.type} />
                  <span style={{ color: '#374151', fontWeight: 600 }}>{q.question}</span>
                </div>
                {q.type === 'fill' && q.answers?.length > 0 && (
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>✓ {q.answers[0]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SaveToPoolModal({ questions, teacherEmail, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', className: '', subject: '', difficulty: 'Orta' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.className) return;
    setSaving(true);
    try {
      await base44.entities.GamePool.create({ ...form, questions, teacherEmail });
      showToast({ message: '✅ Oyun havuza kaydedildi!' });
      onSaved();
      onClose();
    } catch (e) {
      showToast({ message: 'Kayıt başarısız: ' + e.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '1.75rem', maxWidth: 420, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.05rem', color: '#111827', margin: 0 }}>Oyun Havuzuna Kaydet</h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} color="#6b7280" /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            { label: 'Başlık *', key: 'title', placeholder: 'Örn: 5. Sınıf Present Perfect Çalışması' },
            { label: 'Konu', key: 'subject', placeholder: 'Örn: İngilizce - Grammar' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sınıf *</label>
            <div style={{ position: 'relative' }}>
              <select value={form.className} onChange={e => setForm(p => ({ ...p, className: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 2rem 0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', color: form.className ? '#111827' : '#9ca3af', outline: 'none', background: 'white', appearance: 'none', boxSizing: 'border-box' }}>
                <option value=''>Sınıf seçin...</option>
                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown size={14} color='#9ca3af' style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zorluk</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Kolay', 'Orta', 'Zor'].map(d => (
                <button key={d} onClick={() => setForm(p => ({ ...p, difficulty: d }))}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: `1.5px solid ${form.difficulty === d ? DIFFICULTY_COLORS[d] : '#e5e7eb'}`, background: form.difficulty === d ? DIFFICULTY_BG[d] : 'white', color: form.difficulty === d ? DIFFICULTY_COLORS[d] : '#6b7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.65rem 0.9rem', fontSize: '0.82rem', color: '#6b7280' }}>
            🎯 <strong>{questions?.length || 0}</strong> soru kaydedilecek
          </div>
        </div>
        <button onClick={handleSave} disabled={saving || !form.title || !form.className}
          style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem', borderRadius: 12, border: 'none', background: form.title && form.className ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#e5e7eb', color: form.title && form.className ? 'white' : '#9ca3af', fontWeight: 800, fontSize: '0.9rem', cursor: form.title && form.className ? 'pointer' : 'default', boxShadow: form.title && form.className ? '0 4px 14px rgba(99,102,241,0.3)' : 'none' }}>
          {saving ? 'Kaydediliyor...' : '✅ Havuza Kaydet'}
        </button>
      </div>
    </div>
  );
}

export default function GamePoolPage({ onSelectGame, onClose }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [filterClass, setFilterClass] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setMe(u);
      base44.entities.GamePool.filter({ teacherEmail: u.email }, '-created_date').then(data => {
        setGames(data);
        setLoading(false);
      });
    });
  }, []);

  const handleDelete = async (id) => {
    await base44.entities.GamePool.delete(id);
    setGames(prev => prev.filter(g => g.id !== id));
    showToast({ message: 'Oyun silindi' });
  };

  const filtered = games.filter(g => {
    const matchClass = !filterClass || g.className === filterClass;
    const matchDiff = !filterDifficulty || g.difficulty === filterDifficulty;
    const matchSearch = !search || g.title?.toLowerCase().includes(search.toLowerCase()) || g.subject?.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchDiff && matchSearch;
  });

  const uniqueClasses = [...new Set(games.map(g => g.className).filter(Boolean))].sort();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '1.5rem 1.5rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gamepad2 size={22} color='white' />
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Oyun Havuzu</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', margin: 0 }}>{games.length} oyun kaydedildi</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '0.5rem 1rem', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <X size={14} /> Kapat
          </button>
        )}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.25rem 1rem' }}>
        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 14, padding: '1rem', border: '1.5px solid #e5e7eb', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <Search size={14} color='#9ca3af' style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Başlık veya konu ara..."
              style={{ width: '100%', padding: '0.55rem 0.9rem 0.55rem 2rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
          <div style={{ position: 'relative' }}>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              style={{ padding: '0.55rem 2rem 0.55rem 0.85rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.82rem', color: filterClass ? '#111827' : '#9ca3af', outline: 'none', background: 'white', appearance: 'none', cursor: 'pointer' }}>
              <option value=''>Tüm Sınıflar</option>
              {(uniqueClasses.length ? uniqueClasses : GRADE_LEVELS).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronDown size={13} color='#9ca3af' style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
              style={{ padding: '0.55rem 2rem 0.55rem 0.85rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.82rem', color: filterDifficulty ? '#111827' : '#9ca3af', outline: 'none', background: 'white', appearance: 'none', cursor: 'pointer' }}>
              <option value=''>Tüm Zorluklar</option>
              {['Kolay', 'Orta', 'Zor'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={13} color='#9ca3af' style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          {(filterClass || filterDifficulty || search) && (
            <button onClick={() => { setFilterClass(''); setFilterDifficulty(''); setSearch(''); }}
              style={{ padding: '0.5rem 0.85rem', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <X size={12} /> Temizle
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', animation: 'spin 0.9s linear infinite' }} />
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: '3rem 1.5rem', textAlign: 'center', border: '1.5px dashed #e5e7eb' }}>
            <Gamepad2 size={40} color='#d1d5db' style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 0.3rem' }}>{games.length === 0 ? 'Henüz havuzda oyun yok' : 'Filtreyle eşleşen oyun bulunamadı'}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>{games.length === 0 ? 'AI Ödev Oluşturucu\'dan oluşturduğunuz oyunları buraya kaydedin.' : 'Farklı filtreler deneyin.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, margin: '0 0 0.25rem' }}>{filtered.length} oyun gösteriliyor</p>
            {filtered.map(g => (
              <GameCard key={g.id} game={g} onDelete={handleDelete} onUse={onSelectGame || (() => {})} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { SaveToPoolModal };