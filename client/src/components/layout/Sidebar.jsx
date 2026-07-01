import { useState, useEffect, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  FaGraduationCap,
  FaCommentAlt,
  FaLayerGroup
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isApproved, setIsApproved] = useState(false);
  const [assignedInstructorId, setAssignedInstructorId] = useState(null);

  useEffect(() => {
    if (user?.role !== 'student') return;
    axiosInstance.get('/groups/my-membership').then(res => {
      const approved = res.data.status === 'approved';
      setIsApproved(approved);
      if (approved && res.data.group?.instructor) {
        const id = res.data.group.instructor._id || res.data.group.instructor;
        setAssignedInstructorId(id);
      }
    }).catch(() => {
      setIsApproved(false);
      setAssignedInstructorId(null);
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const studentLinks = [
    { nameKey: 'nav.instructors', path: '/instructors', icon: FaChalkboardTeacher },
    { nameKey: 'nav.profile', path: '/profile', icon: FaUser },
  ];

  const approvedStudentLinks = [
    { nameKey: 'nav.myInstructor', path: assignedInstructorId ? `/instructors/${assignedInstructorId}/groups` : '/instructors', icon: FaChalkboardTeacher },
    { nameKey: 'nav.groupChat', path: '/chat', icon: FaCommentAlt },
    { nameKey: 'nav.projects', path: '/projects', icon: FaProjectDiagram },
    { nameKey: 'nav.tasks', path: '/tasks', icon: FaTasks },
    { nameKey: 'nav.teams', path: '/teams', icon: FaUsers },
    { nameKey: 'nav.documents', path: '/documents', icon: FaFileAlt },
    { nameKey: 'nav.meetings', path: '/meetings', icon: FaCalendarAlt },
    { nameKey: 'nav.resources', path: '/resources', icon: FaBookOpen },
    { nameKey: 'nav.profile', path: '/profile', icon: FaUser },
  ];

  const instructorLinks = [
    { nameKey: 'nav.dashboard', path: '/dashboard', icon: FaTachometerAlt },
    { nameKey: 'nav.myGroups', path: '/my-groups', icon: FaUsers },
    { nameKey: 'nav.groupChat', path: '/chat', icon: FaCommentAlt },
    { nameKey: 'nav.projects', path: '/projects', icon: FaProjectDiagram },
    { nameKey: 'nav.tasks', path: '/tasks', icon: FaTasks },
    { nameKey: 'nav.teams', path: '/teams', icon: FaUsers },
    { nameKey: 'nav.documents', path: '/documents', icon: FaFileAlt },
    { nameKey: 'nav.meetings', path: '/meetings', icon: FaCalendarAlt },
    { nameKey: 'nav.resources', path: '/resources', icon: FaBookOpen },
    { nameKey: 'nav.profile', path: '/profile', icon: FaUser },
  ];

  const adminLinks = [
    { nameKey: 'nav.dashboard', path: '/admin/dashboard', icon: FaTachometerAlt },
    { nameKey: 'nav.instructors', path: '/admin/instructors', icon: FaChalkboardTeacher },
    { nameKey: 'nav.students', path: '/admin/students', icon: FaGraduationCap },
    { nameKey: 'nav.departments', path: '/admin/departments', icon: FaLayerGroup },
    { nameKey: 'nav.profile', path: '/profile', icon: FaUser },
  ];

  let menuItems = [];
  if (user?.role === 'student') {
    menuItems = isApproved ? approvedStudentLinks : studentLinks;
  } else if (user?.role === 'instructor') {
    menuItems = instructorLinks;
  } else if (user?.role === 'admin') {
    menuItems = adminLinks;
  }

  const activeLinkClass = 'flex items-center gap-3 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-sky-600 transition-all dark:bg-amber-500/20 dark:text-sky-400 min-h-[44px]';
  const normalLinkClass = 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 min-h-[44px]';

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      <aside dir="ltr"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col h-screen overflow-hidden border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 md:sticky md:translate-x-0 ${
          collapsed ? 'w-16' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`flex h-16 shrink-0 items-center border-b border-gray-100 dark:border-gray-800 ${collapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
            <img src="/img/najah-circle-removebg-preview.png" alt="Najah" className="w-10 h-10 object-contain" />
            {!collapsed && (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Najah
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

        <div className={`shrink-0 border-b border-gray-100 dark:border-gray-800 ${collapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 ${collapsed ? 'justify-center p-2' : 'gap-3 p-3'}`}>
            <div className="w-10 h-10 rounded-full flex-shrink-0">
              {(() => {
                const avatarUrl = user?.avatar
                  ? (user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? user.avatar : `https://back-njah.vercel.app/${user.avatar.replace(/^\//, '')}`)
                  : null;
                const initials = user?.name
                  ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'U';
                return (
                  <div className="relative w-full h-full">
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="absolute inset-0 w-full h-full rounded-full object-cover object-top"
                        onError={(e) => { e.target.remove(); }}
                      />
                    )}
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFB900] to-[#0084D1] flex items-center justify-center text-white font-bold text-sm">
                      {initials}
                    </div>
                  </div>
                );
              })()}
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

        <nav className={`flex-1 overflow-y-auto no-scrollbar ${collapsed ? 'space-y-1 p-2' : 'space-y-1 p-4'}`}>
          {menuItems.map((item) => (
            <NavLink
              key={item.nameKey}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => {
                const base = isActive ? activeLinkClass : normalLinkClass;
                return collapsed
                  ? `${base} justify-center px-0 py-3`
                  : base;
              }}
              title={collapsed ? t(item.nameKey) : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{t(item.nameKey)}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`mt-auto shrink-0 border-t border-gray-200 dark:border-gray-700 ${collapsed ? 'p-2' : 'p-4'}`}>
          <button
            onClick={handleLogout}
            type="button"
            className={`flex items-center rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all ${
              collapsed ? 'justify-center px-0 py-3 w-full' : 'w-full gap-3 px-4 py-3'
            }`}
            title={collapsed ? t('nav.logOut') : undefined}
          >
            <FaSignOutAlt className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{t('nav.logOut')}</span>}
          </button>
        </div>

        <button
          onClick={onToggleCollapse}
          type="button"
          className="absolute -right-3 top-1/2 z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-md transition-all hover:text-gray-600 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300 md:flex"
          aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
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

export default memo(Sidebar);
