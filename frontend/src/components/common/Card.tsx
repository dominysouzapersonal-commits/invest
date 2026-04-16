import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`bg-bg-card border border-border rounded-lg p-5 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
