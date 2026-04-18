import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, FileDown, ChevronDown, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

const avatarColors = ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

function fixTR(str) {
  if (!str) return '';
  return str
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
}

const STATUS_LABELS = {
  verildi: 'Bekliyor',
  goruldu: 'Goruldu',
  tamamlandı: 'Tamamlandi',
  degerlendirildi: 'Degerlendirildi',
  gecikmiş: 'Gecikmis',
};

function generatePDF(student, homeworks) {
  const sHws = homeworks.filter(h => h.studentId === student.id).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const completed = sHws.filter(h => h.status === 'tamamlandı' || h.status === 'degerlendirildi').length;
  const late = sHws.filter(h => h.status === 'gecikmiş').length;
  const pending = sHws.filter(h => h.status === 'verildi' || h.status === 'goruldu').length;
  const rate = sHws.length > 0 ? Math.round((completed / sHws.length) * 100) : 0;
  const withScore = sHws.filter(h => h.gameResult?.percentage != null);
  const avgScore = withScore.length > 0
    ? Math.round(withScore.reduce((acc, h) => acc + h.gameResult.percentage, 0) / withScore.length)
    : null;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 18;
  const usableW = pageW - margin * 2;
  let y = 0;

  // ── Header banner ──
  doc.setFillColor(30, 27, 75);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 30, 210, 8, 'F');

  doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text('EduTakip', margin, 14);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 180, 220);
  doc.text(fixTR('Odev Performans Raporu'), margin, 22);

  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 180, 220);
  doc.text(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), pageW - margin, 14, { align: 'right' });

  y = 50;

  // ── Student info ──
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y - 4, usableW, 28, 3, 3, 'F');
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 24, 39);
  doc.text(fixTR(student.name), margin + 6, y + 5);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(107, 114, 128);
  if (student.grade) doc.text(fixTR(`Sinif: ${student.grade}`), margin + 6, y + 13);
  if (student.subject) doc.text(fixTR(`Ders: ${student.subject}`), margin + 6, y + 19);
  y += 36;

  // ── Summary boxes ──
  const boxW = (usableW - 9) / 4;
  const boxes = [
    { label: 'Toplam Odev', value: String(sHws.length), color: [99, 102, 241] },
    { label: 'Tamamlandi', value: String(completed), color: [16, 185, 129] },
    { label: 'Gecikmis', value: String(late), color: [239, 68, 68] },
    { label: 'Basari Orani', value: `${rate}%`, color: rate >= 70 ? [16, 185, 129] : rate >= 40 ? [245, 158, 11] : [239, 68, 68] },
  ];
  boxes.forEach((b, i) => {
    const x = margin + i * (boxW + 3);
    doc.setFillColor(...b.color);
    doc.roundedRect(x, y, boxW, 22, 2, 2, 'F');
    doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text(b.value, x + boxW / 2, y + 12, { align: 'center' });
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 255, 255);
    doc.text(b.label, x + boxW / 2, y + 19, { align: 'center' });
  });
  y += 30;

  // ── Quiz avg ──
  if (avgScore != null) {
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(margin, y, usableW, 14, 2, 2, 'F');
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(109, 40, 217);
    doc.text(fixTR(`Quiz/Oyun Ortalama Puani: %${avgScore}  (${withScore.length} quiz tamamlandi)`), margin + 5, y + 9);
    y += 20;
  }

  // ── Section: Incomplete ──
  const incomplete = sHws.filter(h => h.status !== 'tamamlandı' && h.status !== 'degerlendirildi');
  if (incomplete.length > 0) {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin, y - 3, usableW, 11, 2, 2, 'F');
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(185, 28, 28);
    doc.text(fixTR(`Tamamlanmayan Odevler (${incomplete.length})`), margin + 4, y + 5);
    y += 14;

    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
    incomplete.forEach((hw, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const isLate = hw.status === 'gecikmiş';
      const statusLabel = fixTR(STATUS_LABELS[hw.status] || hw.status);
      doc.setFillColor(i % 2 === 0 ? 255 : 252, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 250);
      doc.rect(margin, y - 2, usableW, 11, 'F');
      doc.setTextColor(isLate ? 185 : 55, isLate ? 28 : 65, isLate ? 28 : 81);
      doc.setFont('helvetica', isLate ? 'bold' : 'normal');
      const titleLines = doc.splitTextToSize(fixTR(`${i + 1}. ${hw.title}`), usableW - 40);
      doc.text(titleLines[0], margin + 3, y + 5);
      doc.setTextColor(150, 150, 150); doc.setFont('helvetica', 'normal');
      doc.text(statusLabel, pageW - margin - 3, y + 5, { align: 'right' });
      if (hw.dueDate) {
        const dateStr = new Date(hw.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        doc.text(dateStr, pageW - margin - 28, y + 5, { align: 'right' });
      }
      doc.setDrawColor(241, 245, 249); doc.line(margin, y + 9, pageW - margin, y + 9);
      y += 11;
    });
    y += 6;
  }

  // ── Section: Completed ──
  const completedHws = sHws.filter(h => h.status === 'tamamlandı' || h.status === 'degerlendirildi');
  if (completedHws.length > 0) {
    if (y > 255) { doc.addPage(); y = 20; }
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y - 3, usableW, 11, 2, 2, 'F');
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(5, 150, 105);
    doc.text(fixTR(`Tamamlanan Odevler (${completedHws.length})`), margin + 4, y + 5);
    y += 14;

    doc.setFontSize(8.5);
    completedHws.forEach((hw, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFillColor(i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 253, i % 2 === 0 ? 255 : 250);
      doc.rect(margin, y - 2, usableW, 11, 'F');
      doc.setTextColor(55, 65, 81); doc.setFont('helvetica', 'normal');
      doc.text(fixTR(`${i + 1}. ${hw.title}`), margin + 3, y + 5);
      if (hw.gameResult?.percentage != null) {
        const pct = hw.gameResult.percentage;
        const [r, g, b] = pct >= 80 ? [5, 150, 105] : pct >= 50 ? [217, 119, 6] : [220, 38, 38];
        doc.setTextColor(r, g, b); doc.setFont('helvetica', 'bold');
        doc.text(`%${pct}`, pageW - margin - 3, y + 5, { align: 'right' });
      } else {
        doc.setTextColor(16, 185, 129); doc.setFont('helvetica', 'bold');
        doc.text('✓', pageW - margin - 3, y + 5, { align: 'right' });
      }
      doc.setDrawColor(241, 245, 249); doc.line(margin, y + 9, pageW - margin, y + 9);
      y += 11;
    });
  }

  // ── Footer ──
  doc.setFillColor(30, 27, 75);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(180, 180, 220);
  doc.text('EduTakip – Yapay Zeka Destekli Ogretmen Platformu', pageW / 2, 292, { align: 'center' });

  doc.save(fixTR(`${student.name}_odev_raporu.pdf`));
}

export default function ReportDownloadModal({ students, homeworks, onClose }) {
  const [selected, setSelected] = useState('all');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      if (selected === 'all') {
        students.forEach(s => generatePDF(s, homeworks));
      } else {
        const s = students.find(s => s.id === selected);
        if (s) generatePDF(s, homeworks);
      }
      setDownloading(false);
      onClose();
    }, 100);
  };

  const modal = (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 99998, backdropFilter: 'blur(4px)' }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: 'white', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 460,
        zIndex: 99999, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111827', margin: 0 }}>📄 Rapor İndir</h2>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0.2rem 0 0' }}>Öğrenciye özel PDF ödev raporu</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: '0.45rem', cursor: 'pointer', display: 'flex' }}>
            <X size={17} color='#6b7280' />
          </button>
        </div>

        {/* Student selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
            Öğrenci Seçin
          </label>

          {/* All option */}
          <div onClick={() => setSelected('all')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 12, border: `1.5px solid ${selected === 'all' ? '#6366f1' : '#e5e7eb'}`, background: selected === 'all' ? '#eef2ff' : 'white', cursor: 'pointer', marginBottom: '0.5rem', transition: 'all 0.15s' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'white' }}>TM</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', margin: 0 }}>Tüm Öğrenciler</p>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>{students.length} öğrenci için ayrı PDF</p>
            </div>
            {selected === 'all' && <CheckCircle size={16} color='#6366f1' />}
          </div>

          {/* Individual students */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 240, overflowY: 'auto' }}>
            {students.map(s => {
              const ac = getAvatarColor(s.name);
              const isSelected = selected === s.id;
              return (
                <div key={s.id} onClick={() => setSelected(s.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', borderRadius: 12, border: `1.5px solid ${isSelected ? '#6366f1' : '#f1f5f9'}`, background: isSelected ? '#eef2ff' : '#fafafa', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white' }}>{getInitials(s.name)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', margin: 0 }}>{s.name}</p>
                    {s.grade && <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>{s.grade}</p>}
                  </div>
                  {isSelected && <CheckCircle size={16} color='#6366f1' />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Download button */}
        <button onClick={handleDownload} disabled={downloading}
          style={{ width: '100%', padding: '0.9rem', borderRadius: 14, border: 'none', background: downloading ? '#e5e7eb' : 'linear-gradient(135deg,#6366f1,#7c3aed)', color: downloading ? '#9ca3af' : 'white', fontWeight: 800, fontSize: '0.95rem', cursor: downloading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: downloading ? 'none' : '0 6px 20px rgba(99,102,241,0.4)' }}>
          <FileDown size={18} />
          {downloading ? 'Hazırlanıyor...' : selected === 'all' ? `${students.length} Öğrenci İçin Rapor İndir` : 'Rapor PDF İndir'}
        </button>
      </div>
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
}