import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaMoon, FaSun, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuToggle, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive current page name from path
  const getPageName = () => {
    const path = location.pathname.replace(/^\//, '');
    if (!path) return '';
    const segment = path.split('/')[0];
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  const pageName = getPageName();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Apply theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 md:px-6">
      {/* Left side: Hamburger and title */}
      <div className="flex items-center gap-4">
       
        <div className="hidden items-center gap-2 md:flex">
       
          <span className="text-sm text-gray-400 dark:text-gray-600">|</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Workspace
          </span>
          {pageName && (
            <>
              <span className="text-sm text-gray-300 dark:text-gray-600">/</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {pageName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side: Utilities */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <FaSun className="h-5 w-5 text-amber-500" /> : <FaMoon className="h-5 w-5 text-indigo-600" />}
        </button>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>

        {/* User Dropdown / Profile info */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${user.avatar.replace(/\\/g, '/')}`}
                  alt={user.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <FaUser className="h-4 w-4" />
              )}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {user?.name}
              </p>
              <p className="text-[10px] text-gray-500 capitalize dark:text-gray-400">
                {user?.role}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
            title="Log Out"
          >
            <FaSignOutAlt className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
