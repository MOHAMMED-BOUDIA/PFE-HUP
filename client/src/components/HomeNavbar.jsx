import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaMoon, FaSun } from 'react-icons/fa';

const scrollLinks = [
  { label: 'Formations', id: 'formations' },
  { label: 'Instructors', id: 'instructors' },
  { label: 'How It Works', id: 'how-it-works' },
];

export default function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const navigate = useNavigate();
  const location = useLocation();

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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScroll = (id) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-800/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/img/najah-circle-removebg-preview.png" alt="najah" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
              Najah
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {scrollLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleScroll(link.id)}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0084D1] dark:hover:text-[#0084D1] transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0084D1] dark:hover:text-[#0084D1] transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <FaSun className="h-4 w-4 text-amber-500" /> : <FaMoon className="h-4 w-4 text-[#0084D1]" />}
            </button>
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FFB900] to-[#0084D1] rounded-xl hover:from-[#e6a000] hover:to-[#0277BD] shadow-lg shadow-[#FFB900]/25 hover:shadow-[#FFB900]/40 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-[#0084D1] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {scrollLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleScroll(link.id)}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0084D1] dark:hover:text-[#0084D1] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0084D1] dark:hover:text-[#0084D1] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                Contact
              </Link>
              <button
                onClick={() => { setDarkMode(!darkMode); setMobileOpen(false); }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                {darkMode ? <><FaSun className="text-amber-500" /> Light Mode</> : <><FaMoon className="text-[#0084D1]" /> Dark Mode</>}
              </button>
              <hr className="border-gray-200 dark:border-gray-700" />
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#FFB900] to-[#0084D1] rounded-xl hover:from-[#e6a000] hover:to-[#0277BD] transition-all"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
