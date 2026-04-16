import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, Briefcase, GitCompareArrows, Eye, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/search', icon: Search, label: 'Buscar Ativo' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/compare', icon: GitCompareArrows, label: 'Comparador' },
  { to: '/watchlist', icon: Eye, label: 'Watchlist' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col min-h-screen">
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-xl font-bold text-white tracking-tight">
          InvestAnalytics
        </h1>
        <p className="text-xs text-dark-muted mt-1">Análise Fundamentalista</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 font-medium'
                  : 'text-dark-muted hover:bg-dark-border/50 hover:text-dark-text'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border">
        {user && (
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{user.name || user.email}</p>
              <p className="text-xs text-dark-muted truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded hover:bg-dark-border/50 transition-colors" title="Sair">
              <LogOut size={16} className="text-dark-muted hover:text-danger" />
            </button>
          </div>
        )}
        <div className="text-xs text-dark-muted">
          <p>Corretora: XP Investimentos</p>
        </div>
      </div>
    </aside>
  );
}
