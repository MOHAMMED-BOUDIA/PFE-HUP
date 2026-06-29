import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaPhone,
  FaSpinner,
  FaCamera,
} from 'react-icons/fa';
import {
  FiChevronRight,
  FiSave,
  FiShield,
  FiUser,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
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

  if (score <= 1) return { label: 'weak', color: 'bg-red-500', width: '20%' };
  if (score <= 2) return { label: 'fair', color: 'bg-orange-500', width: '40%' };
  if (score <= 3) return { label: 'good', color: 'bg-yellow-500', width: '60%' };
  if (score <= 4) return { label: 'strong', color: 'bg-emerald-500', width: '80%' };
  return { label: 'veryStrong', color: 'bg-emerald-400', width: '100%' };
};

const Profile = () => {
  const { t } = useTranslation();

  // ─── Tab definitions ──────────────────────────────────────────────────────
  const tabItems = [
    { key: 'profile', label: t('profile.profileSettings'), icon: FiUser },
    { key: 'security', label: t('profile.security'), icon: FiShield },
  ];
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
  const [, setStats] = useState({ projects: 0, tasks: 0, teams: 0 });
  const [avatarError, setAvatarError] = useState(false);

  // ─── Active tab ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('profile');

  // ─── Avatar upload state ────────────────────────────────────────────────
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const SERVER_ORIGIN = (import.meta.env.VITE_API_URL).replace('/api', '');

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) return avatarPath;
    if (avatarPath.startsWith('uploads/')) return null;
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // ─── Fetch departments ─────────────────────────────────────────────────
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    axiosInstance.get('/departments').then(res => setDepartments(res.data || [])).catch(() => {});
  }, []);

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
          const myProjectIds = projectsRes.data.data
            .filter(p => (p.supervisor?._id || p.supervisor)?.toString() === uid)
            .map(p => p._id?.toString());
          projectsCount = myProjectIds.length;
          tasksCount = tasksRes.data.data.filter(t =>
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
          tasksCount = tasksRes.data.data.filter(t =>
            (t.assignedTo?._id || t.assignedTo)?.toString() === uid
          ).length;
          teamsCount = groupsRes.data.filter(g =>
            g.members?.some(m => (m._id || m)?.toString() === uid)
          ).length;
          const userTeamIds = teamsRes.data
            .filter(t => t.members?.some(m => (m._id || m)?.toString() === uid))
            .map(t => t._id?.toString());
          projectsCount = projectsRes.data.data.filter(p =>
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
    if (user.role === 'instructor' && (!formData.department.trim() || !formData.phone.trim())) {
      toast.error('All profile fields are required.');
      return;
    }
    if (user.role === 'student' && !formData.phone.trim()) {
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
    'block w-full rounded-lg border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-xs outline-none transition-all duration-200 focus:border-[#0084D1] focus:bg-white focus:ring-2 focus:ring-[#0084D1]/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <Link
          to="/"
          className="hover:text-[#0084D1] transition-colors"
        >
          {t('profile.home')}
        </Link>
        <FiChevronRight className="h-3 w-3" />
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {t('profile.accountProfile')}
        </span>
      </nav>

      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          {t('profile.accountProfile')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('profile.manageDetails')}
        </p>
      </div>
      <hr className="border-gray-200 dark:border-gray-800" />

      {/* ─── Grid: Left card + Right tabs panel ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* ═══ LEFT PROFILE CARD ═══════════════════════════════════════════ */}
        <div className="self-start rounded-2xl border border-gray-150 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 space-y-5 text-center">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-[#0084D1] relative">
              {(() => {
                const avatarUrl = getAvatarUrl(user?.avatar);
                const showImg = avatarUrl && !avatarError;
                return (
                  <>
                    {showImg && (
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        onError={() => setAvatarError(true)}
                      />
                    )}
                    {!showImg && (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFB900] to-[#0084D1] text-3xl font-bold text-white">
                        {initials}
                      </div>
                    )}
                  </>
                );
              })()}
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
              {uploadingAvatar ? t('profile.uploading') : t('profile.changePhoto')}
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

        

          {/* Role & Department */}
          <div className="space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span>{t('profile.accountRole')}</span>
              <span className="rounded-full bg-[#0084D1]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0084D1]">
                {user.role}
              </span>
            </div>
            {user.role !== 'admin' && (
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>{t('profile.department')}</span>
                <span className={`max-w-[140px] truncate ${user.department ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 italic'}`} title={user.department || (user.role === 'student' ? t('profile.notAssigned') : t('profile.na'))}>
                  {user.department || (user.role === 'student' ? t('profile.notAssigned') : t('profile.na'))}
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
                      {t('profile.fullName')}
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
                      {t('profile.email')}
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

                {user.role === 'instructor' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Department */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {t('profile.department')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                          <FaBuilding className="h-3.5 w-3.5" />
                        </span>
                        <select
                          name="department"
                          disabled
                          value={formData.department}
                          className="block w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-xs opacity-60 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">{t('profile.selectDepartment')}</option>
                          {departments.map(d => (
                            <option key={d._id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <p className="mt-1 text-[10px] text-gray-400 italic">{t('profile.deptChangeHint')}</p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {t('profile.phone')}
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

                {user.role === 'student' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {t('profile.phone')}
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
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0084D1] px-5 py-3 text-xs font-semibold text-white shadow-md shadow-[#0084D1]/20 transition-all duration-200 hover:bg-[#0084D1] hover:scale-[1.02] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {submitting ? (
                      <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FiSave className="h-3.5 w-3.5" />
                    )}
                    {t('profile.saveChanges')}
                  </button>
                </div>
              </form>
            )}

            {/* ── Tab 2: Security ─────────────────────────────────────── */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {t('profile.changePassword')}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {t('profile.securityDesc')}
                  </p>
                </div>

                <div className="space-y-4">
                  <PasswordInput
                    label={t('profile.currentPassword')}
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    placeholder={t('profile.currentPasswordPlaceholder')}
                    required
                  />

                  <div>
                    <PasswordInput
                      label={t('profile.newPassword')}
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      placeholder={t('profile.newPasswordPlaceholder')}
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
                          {t('profile.strength')}{' '}
                          <span className="text-gray-700 dark:text-gray-300">
                            {strength.label ? t(`profile.${strength.label}`) : ''}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <PasswordInput
                    label={t('profile.confirmPassword')}
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    placeholder={t('profile.confirmPasswordPlaceholder')}
                    required
                  />
                </div>

                <div className="flex items-center justify-end border-t border-gray-100 pt-5 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={securitySubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0084D1] px-5 py-3 text-xs font-semibold text-white shadow-md shadow-[#0084D1]/20 transition-all duration-200 hover:bg-[#0277BD] hover:scale-[1.02] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {securitySubmitting ? (
                      <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FiShield className="h-3.5 w-3.5" />
                    )}
                    {t('profile.updatePassword')}
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
