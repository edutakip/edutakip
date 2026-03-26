import React from 'react';

export default function PullToRefresh({ indicatorHeight, refreshing }) {
  if (indicatorHeight <= 0) return null;
  return (
    <div className="ptr-indicator" style={{ height: `${indicatorHeight}px` }}>
      <div className="ptr-spinner" />
      {refreshing ? 'Yenileniyor...' : indicatorHeight > 55 ? 'Bırak ve yenile' : 'Aşağı çek'}
    </div>
  );
}