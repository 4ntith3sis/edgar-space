'use client';

import React from 'react';
import { cn } from '@/libs/utils';
import useReveal from '@/hooks/useReveal';

/**
 * Reveal — wrapper scroll-reveal sekali-jalan.
 * Variants: up (default) | left | right | zoom | none.
 * `delay`: 0..7 → delay 0..~560ms (kelipatan 80ms).
 */
const variants = {
  up: 'reveal-up',
  left: 'reveal-left',
  right: 'reveal-right',
  zoom: 'reveal-zoom',
  none: '',
};

export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
  as: Tag = 'div',
  ...props
}) {
  const { ref, visible } = useReveal();
  const step = Math.min(Math.max(delay, 0), 7);
  return (
    <Tag
      ref={ref}
      className={cn(
        'reveal',
        variants[variant] || variants.up,
        visible && 'is-visible',
        step > 0 && `reveal-delay-${step}`,
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
