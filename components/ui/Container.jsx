import React from 'react';
import { cn } from '@/libs/utils';

export default function Container({ children, className = '' }) {
  return (
    <div className={cn("max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
