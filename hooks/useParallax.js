'use client';

import { useEffect, useRef } from 'react';

/**
 * useParallax — parallax ringan (rAF, transform-only).
 * Menggeser target maksimal `amount` px mengikuti scroll.
 * Nonaktif otomatis di mobile kecil & prefers-reduced-motion.
 */
export default function useParallax(amount = 18) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 640px)').matches) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = el.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const viewportH = window.innerHeight || 1;
      // progress 0..1 selama parent melintasi viewport
      const progress = Math.min(
        1,
        Math.max(0, (viewportH - rect.top) / (viewportH + rect.height))
      );
      const offset = (progress - 0.5) * 2 * amount;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.08)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [amount]);

  return ref;
}
