import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '../../routes';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { to: ROUTES.DASHBOARD, label: 'Home', icon: '🏠' },
  { to: ROUTES.WORKOUT, label: 'Workout', icon: '💪' },
  { to: ROUTES.ANALYSIS, label: 'Analysis', icon: '📊' },
  { to: ROUTES.PROGRESS, label: 'Progress', icon: '📈' },
  { to: ROUTES.NUTRITION, label: 'Nutrition', icon: '🥗' },
  { to: ROUTES.CHAT, label: 'Chat', icon: '💬' },
  { to: ROUTES.PROFILE, label: 'Profile', icon: '👤' },
  { to: ROUTES.SOCIAL, label: 'Social', icon: '👥' }
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Hide navbar on auth pages
  const hideNavbarRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.TEST];
  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    // Already using semantic nav element
    <nav className="fixed top-0 left-0 right-0 bg-navy-950/90 backdrop-blur-lg z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <NavLink to={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <span className="text-teal-300 font-bold text-xl hidden sm:block">NEXTLIFT AI</span>
        </NavLink>

        {/* Navigation Links - already using semantic list */}
        <div className="flex-1 flex items-center justify-center overflow-x-auto hide-scrollbar">
          <ul className="flex space-x-1 bg-white/5 rounded-lg p-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'gradient-bg text-white shadow-lg shadow-teal-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User Section */}
        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
              <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm text-gray-300 max-w-[100px] truncate">
                {user?.name || 'User'}
              </span>
            </div>

            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all border border-red-500/20"
            >
              Logout
            </button>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
