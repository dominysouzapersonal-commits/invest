import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/report', label: 'Relatório' },
  { to: '/search', label: 'Buscar' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/compare', label: 'Comparador' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/settings', label: 'Config' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="text-sm font-semibold text-text-primary">
            InvestAnalytics
          </NavLink>
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded-md text-[13px] transition-colors ${
                    isActive ? 'text-text-primary bg-white/[0.07]' : 'text-text-muted hover:text-text-secondary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-text-muted hidden sm:block">{user.name || user.email}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="p-1 text-text-muted hover:text-text-primary transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
