import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaProjectDiagram, 
  FaTasks, 
  FaUsers, 
  FaFileAlt, 
  FaCalendarAlt, 
  FaUser, 
  FaSignOutAlt, 
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaBookOpen,
  FaChalkboardTeacher,
  FaGraduationCap
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '';
    return `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${avatarPath.replace(/\\/g, '/')}`;
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Define navigation items based on roles
  const allLinks = [
    // STUDENT links
    { name: 'Instructors', path: '/instructors', icon: FaChalkboardTeacher, roles: ['student'] },
    { name: 'Projects', path: '/projects', icon: FaProjectDiagram, roles: ['student'] },
    { name: 'Tasks', path: '/tasks', icon: FaTasks, roles: ['student'] },
    { name: 'Teams', path: '/teams', icon: FaUsers, roles: ['student'] },
    { name: 'Documents', path: '/documents', icon: FaFileAlt, roles: ['student'] },
    { name: 'Meetings', path: '/meetings', icon: FaCalendarAlt, roles: ['student'] },
    { name: 'Resources', path: '/resources', icon: FaBookOpen, roles: ['student'] },
    { name: 'Profile', path: '/profile', icon: FaUser, roles: ['student'] },

    // INSTRUCTOR links
    { name: 'Dashboard', path: '/instructor/dashboard', icon: FaTachometerAlt, roles: ['instructor'] },
    { name: 'My Groups', path: '/my-groups', icon: FaUsers, roles: ['instructor'] },
    { name: 'Projects', path: '/projects', icon: FaProjectDiagram, roles: ['instructor'] },
    { name: 'Tasks', path: '/tasks', icon: FaTasks, roles: ['instructor'] },
    { name: 'Teams', path: '/teams', icon: FaUsers, roles: ['instructor'] },
    { name: 'Documents', path: '/documents', icon: FaFileAlt, roles: ['instructor'] },
    { name: 'Meetings', path: '/meetings', icon: FaCalendarAlt, roles: ['instructor'] },
    { name: 'Resources', path: '/resources', icon: FaBookOpen, roles: ['instructor'] },
    { name: 'Profile', path: '/profile', icon: FaUser, roles: ['instructor'] },

    // ADMIN links
    { name: 'Dashboard', path: '/admin/dashboard', icon: FaTachometerAlt, roles: ['admin'] },
    { name: 'Instructors', path: '/admin/instructors', icon: FaChalkboardTeacher, roles: ['admin'] },
    { name: 'Students', path: '/admin/students', icon: FaGraduationCap, roles: ['admin'] },
    { name: 'Profile', path: '/profile', icon: FaUser, roles: ['admin'] },
  ];

  // Filter by user role, then deduplicate by label keeping first occurrence
  const menuItems = allLinks
    .filter(link => link.roles.includes(user?.role))
    .filter((link, i, arr) => arr.findIndex(l => l.name === link.name) === i);

  const activeLinkClass = 'flex items-center gap-3 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-sky-600 transition-all dark:bg-amber-500/20 dark:text-sky-400';
  const normalLinkClass = 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200';

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 md:sticky md:translate-x-0 ${
          collapsed ? 'w-16' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className={`flex h-16 items-center border-b border-gray-100 dark:border-gray-800 ${collapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <FaProjectDiagram className="h-5 w-5" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                PFE Hub
              </span>
            )}
          </div>
          {!collapsed && (
            <button 
              onClick={onClose}
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
              aria-label="Close menu"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* User Card (Static in Sidebar) */}
        <div className={`border-b border-gray-100 dark:border-gray-800 ${collapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 ${collapsed ? 'justify-center p-2' : 'gap-3 p-3'}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={user.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
              )}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {user?.name}
                </h4>
                <p className="truncate text-xs text-gray-500 capitalize dark:text-gray-400">
                  {user?.role}
                </p>
                <p
                  className="truncate text-[10px] text-gray-400 dark:text-gray-500"
                  title={user?.department || 'N/A'}
                >
                  {user?.department || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className={`flex-1 space-y-1 overflow-visible ${collapsed ? 'p-2' : 'p-4'}`}>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => {
                const base = isActive ? activeLinkClass : normalLinkClass;
                return collapsed
                  ? `${base} justify-center px-0 py-3`
                  : base;
              }}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className={`border-t border-gray-200 dark:border-gray-700 ${collapsed ? 'p-2' : 'p-4'}`}>
          <button
            onClick={handleLogout}
            type="button"
            className={`flex items-center rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all ${
              collapsed ? 'justify-center px-0 py-3 w-full' : 'w-full gap-3 px-4 py-3'
            }`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <FaSignOutAlt className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle button (desktop only) */}
        <button
          onClick={onToggleCollapse}
          type="button"
          className="absolute -right-3 top-1/2 z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-md transition-all hover:text-gray-600 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300 md:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <FaChevronRight className="h-3 w-3" />
          ) : (
            <FaChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
