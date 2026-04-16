import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`bg-bg-card border border-border rounded-2xl p-6 ${className}`}>
      {title && (
        <div className="mb-5">
          <h3 className="text-[13px] font-medium text-text-muted uppercase tracking-widest">{title}</h3>
          {subtitle && <p className="text-[13px] text-text-muted mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
