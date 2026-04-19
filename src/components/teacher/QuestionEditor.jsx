import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Pencil, Trash2, Plus, CheckCircle, X, Save, Sparkles, Send, Loader2, ChevronDown } from 'lucide-react';
import { showToast } from '@/lib/toast';

const TYPE_LABELS = { multiple: 'Çoktan Seçmeli', truefalse: 'D/Y', fill: 'Boşluk Doldurma' };
const TYPE_COLORS = { multiple: '#6366f1', truefalse: '#f59e0b', fill: '#10b981' };

function QuestionCard({ q, index, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(q);

  const save = () => { onUpdate(index, draft); setEditing(false); };
  const cancel = () => { setDraft(q); setEditing(false); };

  const color = TYPE_COLORS[q.type] || '#6366f1';

  if (!editing) {
    return (
      <div style={{ background: 'white', borderRadius: 12, border: `1.5px solid ${color}22`, padding: '0.9rem 1rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, background: `${color}18`, color, padding: '0.15rem 0.5rem', borderRadius: 20 }}>
                {index + 1}. {TYPE_LABELS[q.type] || q.type}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', lineHeight: 1.5 }}>{q.question}</p>
            {q.type === 'multiple' && q.options?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {q.options.map((opt, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: i === q.correctIndex ? '#059669' : '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {i === q.correctIndex ? <CheckCircle size={11} color='#059669' /> : <span style={{ width: 11, height: 11, borderRadius: '50%', border: '1.5px solid #d1d5db', display: 'inline-block' }} />}
                    {opt}
                  </div>
                ))}
              </div>
            )}
            {q.type === 'truefalse' && (
              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                ✓ Doğru cevap: {q.correctIndex === 0 ? 'Doğru' : 'Yanlış'}
              </div>
            )}
            {q.type === 'fill' && q.answers?.length > 0 && (
              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                ✓ Kabul edilen: {q.answers.join(', ')}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
            <button onClick={() => setEditing(true)} style={{ padding: '0.3rem', borderRadius: 7, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex' }}>
              <Pencil size={13} color='#6b7280' />
            </button>
            <button onClick={() => onDelete(index)} style={{ padding: '0.3rem', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex' }}>
              <Trash2 size={13} color='#dc2626' />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div style={{ background: '#f8faff', borderRadius: 12, border: `1.5px solid ${color}`, padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{index + 1}. Soru — Düzenleniyor</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={save} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: 8, border: 'none', background: '#059669', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            <Save size={12} /> Kaydet
          </button>
          <button onClick={cancel} style={{ padding: '0.35rem 0.6rem', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex' }}>
            <X size={13} color='#6b7280' />
          </button>
        </div>
      </div>

      {/* Type selector */}
      <div style={{ marginBottom: '0.65rem' }}>
        <label style={labelStyle}>Soru Türü</label>
        <select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value }))} style={inputStyle}>
          <option value="multiple">Çoktan Seçmeli</option>
          <option value="truefalse">Doğru / Yanlış</option>
          <option value="fill">Boşluk Doldurma</option>
        </select>
      </div>

      {/* Question text */}
      <div style={{ marginBottom: '0.65rem' }}>
        <label style={labelStyle}>Soru Metni</label>
        <textarea value={draft.question} onChange={e => setDraft(d => ({ ...d, question: e.target.value }))} rows={2}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
      </div>

      {/* Multiple choice options */}
      {draft.type === 'multiple' && (
        <div style={{ marginBottom: '0.65rem' }}>
          <label style={labelStyle}>Seçenekler (doğru cevabı seçin)</label>
          {(draft.options || ['', '', '', '']).map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <button onClick={() => setDraft(d => ({ ...d, correctIndex: i }))}
                style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${draft.correctIndex === i ? '#059669' : '#d1d5db'}`, background: draft.correctIndex === i ? '#059669' : 'white', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {draft.correctIndex === i && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', display: 'block' }} />}
              </button>
              <input value={opt} onChange={e => { const opts = [...(draft.options || [])]; opts[i] = e.target.value; setDraft(d => ({ ...d, options: opts })); }}
                placeholder={`Seçenek ${i + 1}`} style={{ ...inputStyle, margin: 0, flex: 1 }} />
            </div>
          ))}
        </div>
      )}

      {/* True/False */}
      {draft.type === 'truefalse' && (
        <div style={{ marginBottom: '0.65rem' }}>
          <label style={labelStyle}>Doğru Cevap</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Doğru', 'Yanlış'].map((lbl, i) => (
              <button key={i} onClick={() => setDraft(d => ({ ...d, correctIndex: i, options: ['Doğru', 'Yanlış'] }))}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: `1.5px solid ${draft.correctIndex === i ? '#059669' : '#e5e7eb'}`, background: draft.correctIndex === i ? '#ecfdf5' : 'white', color: draft.correctIndex === i ? '#059669' : '#374151', fontWeight: draft.correctIndex === i ? 700 : 500, cursor: 'pointer', fontSize: '0.82rem' }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fill blank answers */}
      {draft.type === 'fill' && (
        <div style={{ marginBottom: '0.65rem' }}>
          <label style={labelStyle}>Kabul Edilen Cevaplar (virgülle ayırın)</label>
          <input value={(draft.answers || []).join(', ')} onChange={e => setDraft(d => ({ ...d, answers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
            placeholder="goes, go, went" style={inputStyle} />
        </div>
      )}
    </div>
  );
}

export default function QuestionEditor({ questions, setQuestions, lessonInfo, notes }) {
  const [revisePrompt, setRevisePrompt] = useState('');
  const [revising, setRevising] = useState(false);

  const updateQuestion = (index, updated) => {
    setQuestions(prev => prev.map((q, i) => i === index ? updated : q));
  };

  const deleteQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      type: 'multiple',
      question: 'Yeni soru...',
      options: ['Seçenek A', 'Seçenek B', 'Seçenek C', 'Seçenek D'],
      correctIndex: 0,
    }]);
  };

  const handleRevise = async () => {
    if (!revisePrompt.trim()) return;
    setRevising(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an English teacher. You have these interactive homework questions:
${JSON.stringify(questions, null, 2)}

Lesson context: ${lessonInfo?.topic || ''} - ${lessonInfo?.grade || ''}
${notes ? `Teacher notes: ${notes}` : ''}

Teacher's revision request: "${revisePrompt}"

Apply the requested changes to the questions. You can modify existing questions, add new ones, or remove some.
Keep the total between 5-12 questions. Return only valid JSON array of questions with same structure.`,
        response_json_schema: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correctIndex: { type: 'number' },
                  answers: { type: 'array', items: { type: 'string' } },
                }
              }
            }
          }
        }
      });
      if (res?.questions?.length > 0) {
        setQuestions(res.questions);
        setRevisePrompt('');
        showToast({ message: `✅ ${res.questions.length} soru güncellendi!` });
      } else {
        showToast({ message: 'Güncelleme başarısız oldu', type: 'error' });
      }
    } catch (e) {
      showToast({ message: 'Hata: ' + e.message, type: 'error' });
    } finally {
      setRevising(false);
    }
  };

  return (
    <div>
      {/* AI Revise Box */}
      <div style={{ background: 'linear-gradient(135deg,#faf5ff,#f0f4ff)', borderRadius: 14, padding: '1rem 1.1rem', border: '1.5px solid #e0d7ff', marginBottom: '1rem' }}>
        <p style={{ fontWeight: 800, fontSize: '0.82rem', color: '#5b21b6', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={14} /> Soruları AI ile değiştir
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <textarea value={revisePrompt} onChange={e => setRevisePrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && revisePrompt.trim() && !revising) { e.preventDefault(); handleRevise(); } }}
            placeholder='Örn: Soruları daha zor yap, 3 tane fill-in-the-blank ekle, gramer odaklı yap...' rows={2} disabled={revising}
            style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: 10, border: '1.5px solid #c4b5fd', fontSize: '0.85rem', color: '#111827', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.55, background: 'white' }}
            onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#c4b5fd'} />
          <button onClick={handleRevise} disabled={!revisePrompt.trim() || revising}
            style={{ padding: '0.65rem 1rem', borderRadius: 10, border: 'none', background: revisePrompt.trim() && !revising ? 'linear-gradient(135deg,#7c3aed,#6366f1)' : '#e5e7eb', color: revisePrompt.trim() && !revising ? 'white' : '#9ca3af', fontWeight: 800, fontSize: '0.82rem', cursor: revisePrompt.trim() && !revising ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {revising ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
            {revising ? 'Güncelleniyor...' : 'Uygula'}
          </button>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#7c3aed', opacity: 0.7, marginTop: '0.35rem', marginBottom: 0 }}>Enter ile gönderebilirsiniz</p>
      </div>

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
        {questions.map((q, i) => (
          <QuestionCard key={i} q={q} index={i} onUpdate={updateQuestion} onDelete={deleteQuestion} />
        ))}
      </div>

      {/* Add question */}
      <button onClick={addQuestion} style={{ width: '100%', padding: '0.65rem', borderRadius: 10, border: '1.5px dashed #c7d2fe', background: '#f8faff', color: '#6366f1', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        <Plus size={14} /> Soru Ekle
      </button>
    </div>
  );
}

const labelStyle = { fontSize: '0.68rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '0.3rem' };
const inputStyle = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.85rem', color: '#111827', outline: 'none', background: 'white', boxSizing: 'border-box' };