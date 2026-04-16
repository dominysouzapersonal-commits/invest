import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/search', label: 'Buscar' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/compare', label: 'Comparador' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/settings', label: 'Config' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border backdrop-blur-xl bg-bg/80">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <NavLink to="/" className="text-[15px] font-semibold text-white tracking-tight">
            InvestAnalytics
          </NavLink>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-[13px] transition-all ${
                    isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-text-muted hidden sm:block">{user.name || user.email}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/[0.06] transition-all"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
