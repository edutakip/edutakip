import { useState, useRef, useEffect } from 'react';

/**
 * usePullToRefresh
 * @param {Function} onRefresh - async function called when user pulls down
 * @param {Object} options
 * @param {number} options.threshold - px to pull before triggering (default 70)
 */
export default function usePullToRefresh(onRefresh, { threshold = 70 } = {}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && el.scrollTop === 0) {
        e.preventDefault();
        setPullDistance(Math.min(delta * 0.5, threshold + 20));
      }
    };

    const onTouchEnd = async () => {
      if (pullDistance >= threshold) {
        setRefreshing(true);
        setPullDistance(0);
        await onRefresh();
        setRefreshing(false);
      } else {
        setPullDistance(0);
      }
      startY.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, pullDistance, threshold]);

  const indicatorHeight = refreshing ? 48 : pullDistance;

  return { containerRef, indicatorHeight, refreshing, pullDistance };
}