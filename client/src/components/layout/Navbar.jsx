import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaMoon, FaSun, FaSignOutAlt, FaBell, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [processing, setProcessing] = useState(null);

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (user?.role !== 'instructor') return;
    const fetchPending = async () => {
      try {
        const res = await axiosInstance.get('/groups/pending-requests');
        setPendingRequests(res.data.requests || []);
      } catch {
        // ignore
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowDropdown(false);
  }, [location.pathname]);

  const handleApprove = async (groupId, userId) => {
    setProcessing(`approve-${groupId}-${userId}`);
    try {
      await axiosInstance.post(`/groups/${groupId}/approve/${userId}`);
      setPendingRequests(prev => prev.filter(r => !(r.groupId === groupId && r.student.id === userId)));
      toast.success('Student approved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (groupId, userId) => {
    setProcessing(`reject-${groupId}-${userId}`);
    try {
      await axiosInstance.post(`/groups/${groupId}/reject/${userId}`);
      setPendingRequests(prev => prev.filter(r => !(r.groupId === groupId && r.student.id === userId)));
      toast.success('Request rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const count = pendingRequests.length;

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '';
    return `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${avatarPath.replace(/\\/g, '/')}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 md:px-6">
      {/* Left side: Hamburger and title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
          aria-label="Toggle sidebar"
        >
          <FaBars className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <span className="text-sm font-bold text-[#FFB900]">
            NAJAH
          </span>
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
          {darkMode ? <FaSun className="h-5 w-5 text-amber-500" /> : <FaMoon className="h-5 w-5 text-[#0084D1]" />}
        </button>

        {/* Bell Notification — only for instructor */}
        {user?.role === 'instructor' && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              title="Pending Requests"
            >
              <FaBell className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 origin-top-right animate-fadeIn rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Pending Requests
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {count} {count === 1 ? 'student' : 'students'} waiting
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {count === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                      No pending requests
                    </div>
                  ) : (
                    pendingRequests.map((req) => (
                      <div key={`${req.groupId}-${req.student.id}`} className="border-b border-gray-50 px-4 py-3 last:border-0 dark:border-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                            {req.student.avatar ? (
                              <img src={getAvatarUrl(req.student.avatar)} alt={req.student.name} className="h-full w-full object-cover object-top" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFB900] to-[#0084D1] text-xs font-bold text-white">
                                {req.student.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {req.student.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              Wants to join: <span className="font-medium text-gray-700 dark:text-gray-300">{req.groupName}</span>
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleApprove(req.groupId, req.student.id)}
                            disabled={processing === `approve-${req.groupId}-${req.student.id}`}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/20 dark:text-emerald-400"
                          >
                            <FaCheckCircle className="h-3 w-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.groupId, req.student.id)}
                            disabled={processing === `reject-${req.groupId}-${req.student.id}`}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-400"
                          >
                            <FaTimesCircle className="h-3 w-3" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>

        {/* User Dropdown / Profile info */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
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
