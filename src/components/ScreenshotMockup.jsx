import React from 'react';

// Mini UI mockups for each screen type
const mockups = {
  dashboard: (
    <div style={{ width: '100%', height: '100%', background: '#0f0e1a', padding: '8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Top stats */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[['#6366f1','12','Öğrenci'],['#10b981','8','Ders'],['#f59e0b','₺2.4k','Gelir']].map(([c,v,l]) => (
          <div key={l} style={{ flex:1, background: '#1e1b4b', borderRadius: 6, padding: '5px 6px' }}>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.5)', marginBottom: 1 }}>{l}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {/* Chart bars */}
      <div style={{ background: '#1e1b4b', borderRadius: 6, padding: '6px', flex: 1 }}>
        <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>Haftalık Dersler</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }}>
          {[60,80,45,90,70,55,85].map((h,i) => (
            <div key={i} style={{ flex:1, height:`${h}%`, borderRadius: '3px 3px 0 0', background: `rgba(99,102,241,${0.4+i*0.08})` }} />
          ))}
        </div>
      </div>
      {/* List */}
      <div style={{ background: '#1e1b4b', borderRadius: 6, padding: '5px 6px' }}>
        {['Ahmet K. — Bugün 15:00','Zeynep A. — Yarın 10:00'].map(t => (
          <div key={t} style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,.6)', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>{t}</div>
        ))}
      </div>
    </div>
  ),

  students: (
    <div style={{ width: '100%', height: '100%', background: '#0f0e1a', padding: '8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>Öğrencilerim (12)</div>
      {[
        { name: 'Ahmet Kaya', grade: '9. Sınıf', color: '#6366f1' },
        { name: 'Zeynep Arslan', grade: '10. Sınıf', color: '#10b981' },
        { name: 'Mert Demir', grade: '8. Sınıf', color: '#f59e0b' },
        { name: 'Elif Yıldız', grade: '11. Sınıf', color: '#ec4899' },
      ].map(s => (
        <div key={s.name} style={{ background: '#1e1b4b', borderRadius: 7, padding: '5px 7px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{s.name[0]}</div>
          <div>
            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#fff' }}>{s.name}</div>
            <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,.4)' }}>{s.grade}</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 30, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.1)' }}>
            <div style={{ width: `${60+Math.random()*40}%`, height: '100%', borderRadius: 2, background: s.color }} />
          </div>
        </div>
      ))}
    </div>
  ),

  lessons: (
    <div style={{ width: '100%', height: '100%', background: '#0f0e1a', padding: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.5)', marginBottom: 1 }}>Dersler — Nisan 2026</div>
      {[
        { student: 'Ahmet K.', time: '15:00', status: 'tamamlandı', color: '#10b981' },
        { student: 'Zeynep A.', time: '17:00', status: 'planlandı', color: '#6366f1' },
        { student: 'Mert D.', time: '19:00', status: 'planlandı', color: '#6366f1' },
        { student: 'Elif Y.', time: '10:00', status: 'iptal', color: '#ef4444' },
      ].map(l => (
        <div key={l.student} style={{ background: '#1e1b4b', borderRadius: 6, padding: '5px 7px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 3, height: 28, borderRadius: 2, background: l.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#fff' }}>{l.student}</div>
            <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,.4)' }}>{l.time}</div>
          </div>
          <div style={{ fontSize: '0.42rem', padding: '2px 5px', borderRadius: 10, background: `${l.color}22`, color: l.color, fontWeight: 600 }}>{l.status}</div>
        </div>
      ))}
    </div>
  ),

  calendar: (
    <div style={{ width: '100%', height: '100%', background: '#0f0e1a', padding: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>Nisan 2026</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {['P','S','Ç','P','C','C','P'].map((d,i) => (
          <div key={i} style={{ fontSize: '0.42rem', textAlign: 'center', color: 'rgba(255,255,255,.35)', fontWeight: 700 }}>{d}</div>
        ))}
        {Array.from({length:30},(_,i)=>i+1).map(d => (
          <div key={d} style={{ fontSize: '0.45rem', textAlign: 'center', padding: '2px 0', borderRadius: 3, background: [3,8,10,15,17,22,24].includes(d) ? '#6366f1' : 'transparent', color: [3,8,10,15,17,22,24].includes(d) ? '#fff' : 'rgba(255,255,255,.5)', fontWeight: [3,8,10,15,17,22,24].includes(d) ? 700 : 400 }}>{d}</div>
        ))}
      </div>
    </div>
  ),

  finance: (
    <div style={{ width: '100%', height: '100%', background: '#0f0e1a', padding: '8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ flex:1, background: '#052e16', borderRadius: 6, padding: '5px 6px', border: '1px solid #10b981' }}>
          <div style={{ fontSize: '0.48rem', color: '#10b981' }}>Toplam Gelir</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#10b981' }}>₺4.800</div>
        </div>
        <div style={{ flex:1, background: '#1e1b4b', borderRadius: 6, padding: '5px 6px' }}>
          <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,.4)' }}>Bekleyen</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f59e0b' }}>₺600</div>
        </div>
      </div>
      <div style={{ background: '#1e1b4b', borderRadius: 6, padding: '6px', flex: 1 }}>
        <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>Aylık Gelir</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 35 }}>
          {[50,65,45,80,70,90,75,85].map((h,i) => (
            <div key={i} style={{ flex:1, height:`${h}%`, borderRadius: '3px 3px 0 0', background: i===7 ? '#10b981' : `rgba(16,185,129,0.35)` }} />
          ))}
        </div>
      </div>
      {[
        { name:'Ahmet K.', amount:'₺400', status:'alındı', c:'#10b981'},
        { name:'Zeynep A.', amount:'₺350', status:'bekliyor', c:'#f59e0b'},
      ].map(p => (
        <div key={p.name} style={{ background: '#1e1b4b', borderRadius: 5, padding: '4px 6px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.5rem', color: '#fff', flex: 1 }}>{p.name}</span>
          <span style={{ fontSize: '0.5rem', fontWeight: 700, color: p.c, marginRight: 5 }}>{p.amount}</span>
          <span style={{ fontSize: '0.4rem', padding: '1px 4px', borderRadius: 8, background: `${p.c}22`, color: p.c }}>{p.status}</span>
        </div>
      ))}
    </div>
  ),

  reports: (
    <div style={{ width: '100%', height: '100%', background: '#0f0e1a', padding: '8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.5)', marginBottom: 1 }}>Gelişim Raporları</div>
      {[
        { name: 'Ahmet K.', score: 85, trend: '↑', color: '#10b981' },
        { name: 'Zeynep A.', score: 72, trend: '→', color: '#6366f1' },
        { name: 'Mert D.', score: 91, trend: '↑', color: '#10b981' },
      ].map(r => (
        <div key={r.name} style={{ background: '#1e1b4b', borderRadius: 6, padding: '5px 7px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#fff' }}>{r.name}</span>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: r.color }}>{r.score} {r.trend}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,.1)' }}>
            <div style={{ width: `${r.score}%`, height: '100%', borderRadius: 2, background: r.color }} />
          </div>
        </div>
      ))}
      <div style={{ background: '#1e1b4b', borderRadius: 6, padding: '5px 7px', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>Sınıf Ortalaması</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {['Katılım','Ödev','Başarı'].map((l,i) => (
            <div key={l} style={{ flex:1, textAlign:'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: ['#6366f1','#f59e0b','#10b981'][i] }}>{[92,78,85][i]}%</div>
              <div style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,.35)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  addStudent: (
    <div style={{ width: '100%', height: '100%', background: '#0f0e1a', padding: '8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>Yeni Öğrenci Ekle</div>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 2 }}>
        {[1,2,3,4].map(s => (
          <React.Fragment key={s}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: s === 1 ? '#6366f1' : 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', fontWeight: 800, color: s === 1 ? '#fff' : 'rgba(255,255,255,.3)' }}>{s}</div>
            {s < 4 && <div style={{ flex:1, height: 1, background: 'rgba(255,255,255,.1)' }} />}
          </React.Fragment>
        ))}
      </div>
      {/* Form fields */}
      {['Ad Soyad','Telefon','Sınıf','Ücret (₺/ders)'].map(f => (
        <div key={f} style={{ background: '#1e1b4b', borderRadius: 5, padding: '4px 7px' }}>
          <div style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,.35)', marginBottom: 1 }}>{f}</div>
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.12)', width: f === 'Ad Soyad' ? '70%' : '50%' }} />
        </div>
      ))}
      <div style={{ background: '#6366f1', borderRadius: 6, padding: '5px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.52rem', fontWeight: 800, color: '#fff' }}>Devam →</div>
      </div>
    </div>
  ),

  ai: (
    <div style={{ width: '100%', height: '100%', background: '#0f0e1a', padding: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>🤖</div>
        <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#fff' }}>EduTakip Asistan</div>
      </div>
      <div style={{ background: '#1e1b4b', borderRadius: '8px 8px 8px 2px', padding: '5px 7px', maxWidth: '85%' }}>
        <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,.8)', lineHeight: 1.5 }}>Merhaba! Öğrencileriniz hakkında ne sormak istersiniz?</div>
      </div>
      <div style={{ background: '#312e81', borderRadius: '8px 8px 2px 8px', padding: '5px 7px', maxWidth: '80%', marginLeft: 'auto' }}>
        <div style={{ fontSize: '0.48rem', color: '#fff', lineHeight: 1.5 }}>Bu ay en çok gelişen öğrencim kim?</div>
      </div>
      <div style={{ background: '#1e1b4b', borderRadius: '8px 8px 8px 2px', padding: '5px 7px', maxWidth: '90%' }}>
        <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,.8)', lineHeight: 1.5 }}>📊 Ahmet Kaya bu ay %23 gelişim gösterdi! Matematik konularında...</div>
      </div>
      <div style={{ marginTop: 'auto', background: '#1e1b4b', borderRadius: 6, padding: '4px 7px', display: 'flex', alignItems: 'center', gap: 4, border: '1px solid rgba(99,102,241,.3)' }}>
        <div style={{ flex:1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.08)' }} />
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
      </div>
    </div>
  ),
};

const mockupMap = ['dashboard','students','lessons','calendar','finance','reports','addStudent','ai'];

export default function ScreenshotMockup({ index, visible }) {
  const key = mockupMap[index] || 'dashboard';
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.25s ease',
      pointerEvents: 'none',
      overflow: 'hidden',
      borderRadius: 16,
    }}>
      {mockups[key]}
    </div>
  );
}