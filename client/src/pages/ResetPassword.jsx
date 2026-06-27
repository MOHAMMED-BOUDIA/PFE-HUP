import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaLock } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import AuthLayout from '../components/auth/AuthLayout';

const getPasswordStrength = (pwd) => {
  if (!pwd) return { label: '', color: '#d1d5db', width: '0%' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*]/.test(pwd)) score++;
  const levels = [
    { label: 'Weak', color: '#ef4444', width: '20%' },
    { label: 'Fair', color: '#f59e0b', width: '40%' },
    { label: 'Good', color: '#0084D1', width: '60%' },
    { label: 'Strong', color: '#8b5cf6', width: '80%' },
    { label: 'Very Strong', color: '#10b981', width: '100%' },
  ];
  return levels[Math.min(score, 4)];
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 py-3.5 pl-11 pr-12 text-sm outline-none transition-all duration-200 focus:border-[#0084D1] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#0084D1]/20 dark:text-white placeholder:text-gray-400';

  return (
    <AuthLayout title="Set new password" subtitle="Must be at least 8 characters with uppercase, lowercase, number & special character">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaLock className="h-4 w-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#0084D1] transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, backgroundColor: strength.color }} />
              </div>
              <p className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaLock className="h-4 w-4" />
            </span>
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
              placeholder="Re-enter new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#0084D1] transition-colors"
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
          {confirm && password !== confirm && (
            <p className="text-[11px] font-medium text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FFB900] to-[#0084D1] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0084D1]/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#0084D1]/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p className="mt-8 text-center">
        <Link
          to="/login"
          className="text-sm font-semibold text-[#0084D1] hover:text-[#0277BD] transition-colors"
        >
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
