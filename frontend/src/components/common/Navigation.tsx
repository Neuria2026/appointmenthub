import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  MessageSquare,
  Settings,
  User,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calendar', label: 'Calendario', icon: Calendar },
  { path: '/appointments', label: 'Citas', icon: ClipboardList },
  { path: '/chat', label: 'Chat IA', icon: MessageSquare },
  { path: '/settings', label: 'Config', icon: Settings },
  { path: '/profile', label: 'Perfil', icon: User },
];

/** Bottom navigation for mobile */
export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-30 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 5).map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[3rem] transition-all',
                isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive && 'text-primary-600')} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Breadcrumb navigation */
export function Breadcrumb({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-300">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-gray-700 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
