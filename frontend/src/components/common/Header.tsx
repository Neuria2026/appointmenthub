import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/store';
import { getInitials } from '@/utils/formatters';
import { DEFAULT_AVATAR, APP_NAME } from '@/utils/constants';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/appointments', label: 'Citas', icon: ClipboardList },
  { to: '/calendar', label: 'Calendario', icon: Calendar },
  { to: '/chat', label: 'Chat IA', icon: MessageSquare },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarUrl = user?.profile_picture_url
    ? user.profile_picture_url
    : `${DEFAULT_AVATAR}${encodeURIComponent(user?.full_name || 'U')}`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            {user?.logo_url ? (
              <img
                src={user.logo_url}
                alt={APP_NAME}
                className="h-8 max-w-[140px] object-contain"
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">
                  {APP_NAME}
                </span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  location.pathname === to
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
              >
                <img
                  src={avatarUrl}
                  alt={user?.full_name || 'Avatar'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `${DEFAULT_AVATAR}${encodeURIComponent(user?.full_name || 'U')}`;
                  }}
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user?.full_name?.split(' ')[0] || 'Usuario'}
                </span>
                <ChevronDown
                  className={clsx(
                    'w-4 h-4 text-gray-400 transition-transform duration-150',
                    userMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                        {user?.role === 'provider' ? 'Proveedor' : 'Cliente'}
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Mi Perfil
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Configuración
                    </Link>
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-slide-down">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  location.pathname === to
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-3 border-t border-gray-100 mt-1 pt-3 flex items-center gap-3">
            <img
              src={avatarUrl}
              alt={user?.full_name || ''}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-error-500 hover:bg-error-50 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// Fallback initials avatar (used inline)
export function AvatarFallback({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
      {getInitials(name)}
    </div>
  );
}
