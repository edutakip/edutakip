import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Delete } from 'lucide-react';

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [waitNext, setWaitNext] = useState(false);
  const [history, setHistory] = useState([]);

  const inputDigit = (d) => {
    if (waitNext) {
      setDisplay(String(d));
      setWaitNext(false);
    } else {
      setDisplay(display === '0' ? String(d) : display + d);
    }
  };

  const inputDot = () => {
    if (waitNext) { setDisplay('0.'); setWaitNext(false); return; }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const handleOp = (nextOp) => {
    const cur = parseFloat(display);
    if (prev !== null && !waitNext) {
      const result = calculate(prev, cur, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(cur);
    }
    setWaitNext(true);
    setOp(nextOp);
  };

  const calculate = (a, b, operator) => {
    switch (operator) {
      case '+': return +(a + b).toPrecision(12) * 1;
      case '−': return +(a - b).toPrecision(12) * 1;
      case '×': return +(a * b).toPrecision(12) * 1;
      case '÷': return b !== 0 ? +(a / b).toPrecision(12) * 1 : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (op === null || waitNext) return;
    const cur = parseFloat(display);
    const result = calculate(prev, cur, op);
    const entry = `${prev} ${op} ${cur} = ${result}`;
    setHistory(h => [entry, ...h].slice(0, 10));
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
    setWaitNext(true);
  };

  const handleSpecial = (btn) => {
    if (btn === 'C') { setDisplay('0'); setPrev(null); setOp(null); setWaitNext(false); }
    else if (btn === '±') setDisplay(String(parseFloat(display) * -1));
    else if (btn === '%') setDisplay(String(parseFloat(display) / 100));
    else if (btn === '÷' || btn === '×' || btn === '−' || btn === '+') handleOp(btn);
    else if (btn === '=') handleEquals();
    else if (btn === '.') inputDot();
    else inputDigit(btn);
  };

  const isOp = (b) => ['÷', '×', '−', '+'].includes(b);
  const isActive = (b) => isOp(b) && op === b && waitNext;

  const btnStyle = (b) => {
    const base = {
      border: 'none', borderRadius: 16, fontSize: b === '0' ? '1.4rem' : '1.5rem',
      fontWeight: 700, cursor: 'pointer', transition: 'all 0.1s',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 72,
      WebkitTapHighlightColor: 'transparent',
      userSelect: 'none',
    };
    if (b === 'C' || b === '±' || b === '%')
      return { ...base, background: '#d1d5db', color: '#111827' };
    if (isOp(b) || b === '=')
      return { ...base, background: isActive(b) || b === '=' ? '#f97316' : '#f97316', color: 'white',
        boxShadow: '0 4px 14px rgba(249,115,22,0.35)' };
    return { ...base, background: '#1f2937', color: 'white' };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827', marginBottom: '1.5rem', textAlign: 'center' }}>🧮 Hesap Makinesi</h1>

        {/* Calculator body */}
        <div style={{ background: '#111827', borderRadius: 28, padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>

          {/* Display */}
          <div style={{ background: '#1f2937', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '1.25rem', minHeight: 90, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', gap: '0.25rem', overflow: 'hidden' }}>
            {op && prev !== null && (
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', fontWeight: 500 }}>
                {prev} {op}
              </div>
            )}
            <div style={{
              color: 'white', fontWeight: 300,
              fontSize: display.length > 10 ? '1.6rem' : display.length > 7 ? '2rem' : '2.8rem',
              lineHeight: 1, wordBreak: 'break-all', textAlign: 'right',
            }}>
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
            {BUTTONS.flat().map((btn, i) => (
              <button key={i}
                onClick={() => handleSpecial(btn)}
                style={{
                  ...btnStyle(btn),
                  gridColumn: btn === '0' ? 'span 2' : 'span 1',
                  justifyContent: btn === '0' ? 'flex-start' : 'center',
                  paddingLeft: btn === '0' ? '1.5rem' : undefined,
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#374151' }}>Geçmiş</span>
              <button onClick={() => setHistory([])} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Delete size={13} /> Temizle
              </button>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {history.map((h, i) => (
                <div key={i} style={{ padding: '0.6rem 1rem', borderBottom: i < history.length - 1 ? '1px solid #f9fafb' : 'none', fontSize: '0.82rem', color: '#6b7280', fontFamily: 'monospace' }}>
                  {h}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}