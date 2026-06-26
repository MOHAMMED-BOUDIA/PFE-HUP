import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaProjectDiagram, FaSpinner } from 'react-icons/fa';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getRoleHome = (role) => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'instructor': return '/dashboard';
      default: return '/instructors';
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (token && user) {
      const from = location.state?.from?.pathname;
      navigate(from || getRoleHome(user.role), { replace: true });
    }
  }, [token, user, location.state?.from?.pathname, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Logged in successfully!');
      const roleHome = getRoleHome(result.user.role);
      navigate(roleHome, { replace: true });
    } else {
      toast.error(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-4 transition-colors duration-200">
      <Link
        to="/"
        className="fixed top-5 left-5 flex items-center gap-2 text-white/70 hover:text-white transition text-sm z-10"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-900 border border-indigo-100/10">
        
        {/* Brand Logo */}
        <Link to="/" className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm">
            <FaProjectDiagram className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-gray-900 dark:text-white">
            Welcome back to NAJAH
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sign in to access your project dashboard
          </p>
          <p className="mt-3 text-xs text-indigo-500 dark:text-indigo-400 font-medium">
            Your path to graduation success 🎓
          </p>
        </Link>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <FaEnvelope className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-800/40 dark:text-white dark:focus:bg-gray-800"
                placeholder="you@university.edu"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Password
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
                className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-800/40 dark:text-white dark:focus:bg-gray-800"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-indigo-500 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end -mt-4">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 transition-all"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:bg-indigo-400 focus:outline-none transition dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {loading && <FaSpinner className="animate-spin" />}
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-150 pt-5 text-center dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign up now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
