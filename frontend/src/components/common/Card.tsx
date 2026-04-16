import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`bg-dark-card border border-dark-border rounded-xl p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-white font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-dark-muted mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
