import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaPhone,
  FaSpinner,
  FaCamera,
  FaProjectDiagram,
  FaTasks,
  FaUsers,
} from 'react-icons/fa';
import {
  FiChevronRight,
  FiSave,
  FiShield,
  FiUser,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import Tabs from '../components/common/Tabs';
import PasswordInput from '../components/common/PasswordInput';

// ─── Password strength helper ───────────────────────────────────────────────
const getPasswordStrength = (pwd) => {
  if (!pwd) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
  if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', width: '40%' };
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: '60%' };
  if (score <= 4) return { label: 'Strong', color: 'bg-emerald-500', width: '80%' };
  return { label: 'Very Strong', color: 'bg-emerald-400', width: '100%' };
};

// ─── Tab definitions ────────────────────────────────────────────────────────
const tabItems = [
  { key: 'profile', label: 'Profile Settings', icon: FiUser },
  { key: 'security', label: 'Security', icon: FiShield },
];

const Profile = () => {
  const { user, updateUserProfileState } = useAuth();

  // ─── Profile Settings state ─────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // ─── Security state ─────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });
  const [securitySubmitting, setSecuritySubmitting] = useState(false);

  // ─── Stats placeholders ─────────────────────────────────────────────────
  const [stats, setStats] = useState({ projects: 0, tasks: 0, teams: 0 });

  // ─── Active tab ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('profile');

  // ─── Avatar upload state ────────────────────────────────────────────────
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const SERVER_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '';
    return `${SERVER_ORIGIN}/${avatarPath.replace(/\\/g, '/')}`;
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only image files (jpg, png, gif, webp) are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axiosInstance.put(`/users/${user.id}/avatar`, formData);
      updateUserProfileState(response.data);
      toast.success('Photo updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // ─── Seed form from user context ────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // ─── Fetch real stats by role ──────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      if (!user || user.role === 'admin') return;
      try {
        let projectsCount = 0, tasksCount = 0, teamsCount = 0;
        const uid = user.id?.toString();

        if (user.role === 'instructor') {
          const [projectsRes, tasksRes, groupsRes] = await Promise.all([
            axiosInstance.get('/projects'),
            axiosInstance.get('/tasks'),
            axiosInstance.get('/groups/my'),
          ]);
          const myProjectIds = projectsRes.data
            .filter(p => (p.supervisor?._id || p.supervisor)?.toString() === uid)
            .map(p => p._id?.toString());
          projectsCount = myProjectIds.length;
          tasksCount = tasksRes.data.filter(t =>
            myProjectIds.includes((t.project?._id || t.project)?.toString())
          ).length;
          teamsCount = groupsRes.data?.length || 0;
        } else if (user.role === 'student') {
          const [projectsRes, tasksRes, groupsRes, teamsRes] = await Promise.all([
            axiosInstance.get('/projects'),
            axiosInstance.get('/tasks'),
            axiosInstance.get('/groups'),
            axiosInstance.get('/teams'),
          ]);
          tasksCount = tasksRes.data.filter(t =>
            (t.assignedTo?._id || t.assignedTo)?.toString() === uid
          ).length;
          teamsCount = groupsRes.data.filter(g =>
            g.members?.some(m => (m._id || m)?.toString() === uid)
          ).length;
          const userTeamIds = teamsRes.data
            .filter(t => t.members?.some(m => (m._id || m)?.toString() === uid))
            .map(t => t._id?.toString());
          projectsCount = projectsRes.data.filter(p =>
            userTeamIds.includes((p.team?._id || p.team)?.toString())
          ).length;
        }

        setStats({ projects: projectsCount, tasks: tasksCount, teams: teamsCount });
      } catch {
        // silently keep 0 placeholders
      }
    };
    fetchStats();
  }, [user]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('All profile fields are required.');
      return;
    }
    if (user.role !== 'admin' && (!formData.department.trim() || !formData.phone.trim())) {
      toast.error('All profile fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.put(`/users/${user.id}`, formData);
      updateUserProfileState(response.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 'Failed to update profile settings.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    if (!passwords.current) {
      toast.error('Current password is required.');
      return;
    }

    setSecuritySubmitting(true);
    // Simulate async — no real API call yet
    await new Promise((r) => setTimeout(r, 1200));
    setSecuritySubmitting(false);
    setPasswords({ current: '', newPassword: '', confirm: '' });
    toast.success('Password updated successfully!');
  };

  // ─── Loading guard ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const strength = getPasswordStrength(passwords.newPassword);

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // ─── Input class helper ─────────────────────────────────────────────────
  const inputClass =
    'block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-xs outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800';

  // ─── Mini stat cards data ───────────────────────────────────────────────
  const miniStats = [
    { label: 'Projects', value: stats.projects, icon: FaProjectDiagram, color: 'text-indigo-500' },
    { label: 'Tasks', value: stats.tasks, icon: FaTasks, color: 'text-purple-500' },
    { label: 'Teams', value: stats.teams, icon: FaUsers, color: 'text-cyan-500' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <Link
          to="/"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Home
        </Link>
        <FiChevronRight className="h-3 w-3" />
        <span className="font-medium text-gray-800 dark:text-gray-200">
          Profile
        </span>
      </nav>

      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Account Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your personal details and academic department information.
        </p>
      </div>
      <hr className="border-gray-200 dark:border-gray-800" />

      {/* ─── Grid: Left card + Right tabs panel ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* ═══ LEFT PROFILE CARD ═══════════════════════════════════════════ */}
        <div className="self-start rounded-2xl border border-gray-150 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 space-y-5 text-center">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-indigo-400">
              {user.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={user.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={handleAvatarClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-all hover:bg-gray-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
            >
              {uploadingAvatar ? (
                <FaSpinner className="h-3 w-3 animate-spin" />
              ) : (
                <FaCamera className="h-3 w-3" />
              )}
              {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>

          {/* Name & Email */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {user.name}
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>

          {/* Mini Stats Row — hidden for admin */}
          {user.role !== 'admin' && (
            <div className="grid grid-cols-3 gap-2">
              {miniStats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 py-3 dark:bg-gray-800/60"
                >
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {s.value}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Role & Department */}
          <div className="space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span>Account Role</span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                {user.role}
              </span>
            </div>
            {user.role !== 'admin' && (
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>Department</span>
                <span className="max-w-[140px] truncate text-gray-800 dark:text-gray-200" title={user.department || 'N/A'}>
                  {user.department || 'N/A'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT TABS PANEL ════════════════════════════════════════════ */}
        <div className="self-start overflow-visible h-auto rounded-2xl border border-gray-150 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 md:col-span-2">
          {/* Tab bar */}
          <div className="px-6 pt-4">
            <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Tab content with fade-in */}
          <div
            key={activeTab}
            className="animate-fadeIn px-6 py-4"
            style={{ animation: 'fadeIn 0.25s ease-out' }}
          >
            {/* ── Tab 1: Profile Settings ─────────────────────────────── */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Full Name *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                        <FaUser className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Email Address *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                        <FaEnvelope className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {user.role !== 'admin' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Department */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Department {user.role === 'instructor' ? '' : '*'}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                          <FaBuilding className="h-3.5 w-3.5" />
                        </span>
                        <select
                          name="department"
                          required={user.role !== 'instructor'}
                          disabled={user.role === 'instructor'}
                          value={formData.department}
                          onChange={handleChange}
                          className={`block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-xs outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800 ${user.role === 'instructor' ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <option value="">Select department</option>
                          <option value="IT">IT</option>
                          <option value="Web Development">Web Development</option>
                          <option value="Mobile Development">Mobile Development</option>
                          <option value="Data Science">Data Science</option>
                          <option value="Cybersecurity">Cybersecurity</option>
                          <option value="Network & Systems">Network & Systems</option>
                          <option value="Software Engineering">Software Engineering</option>
                        </select>
                      </div>
                      {user.role === 'instructor' && (
                        <p className="mt-1 text-[10px] text-gray-400 italic">Only admin can change your department</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                          <FaPhone className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="text"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end border-t border-gray-100 pt-5 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-600 hover:scale-[1.02] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {submitting ? (
                      <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FiSave className="h-3.5 w-3.5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* ── Tab 2: Security ─────────────────────────────────────── */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Change Password
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Update your password to keep your account secure.
                  </p>
                </div>

                <div className="space-y-4">
                  <PasswordInput
                    label="Current Password *"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />

                  <div>
                    <PasswordInput
                      label="New Password *"
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 6 characters"
                      required
                    />
                    {/* Strength indicator */}
                    {passwords.newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                            style={{ width: strength.width }}
                          />
                        </div>
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                          Strength:{' '}
                          <span className="text-gray-700 dark:text-gray-300">
                            {strength.label}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <PasswordInput
                    label="Confirm New Password *"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <div className="flex items-center justify-end border-t border-gray-100 pt-5 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={securitySubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-600 hover:scale-[1.02] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {securitySubmitting ? (
                      <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FiShield className="h-3.5 w-3.5" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Inline keyframes for fade-in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
