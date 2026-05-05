import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  MessageSquare,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calendar', label: 'Calendario', icon: Calendar },
  { path: '/appointments', label: 'Citas', icon: ClipboardList },
  { path: '/chat', label: 'Chat IA', icon: MessageSquare },
  { path: '/settings', label: 'Configuración', icon: Settings },
  { path: '/profile', label: 'Perfil', icon: User },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon
                className={clsx(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            'w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-all',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
