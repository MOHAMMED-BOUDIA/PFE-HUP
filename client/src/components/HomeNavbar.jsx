import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaMoon, FaSun } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import LanguageSwitcher from './LanguageSwitcher';

const scrollLinks = [
  { labelKey: 'nav.formations', id: 'formations' },
  { labelKey: 'nav.instructors', id: 'instructors' },
  { labelKey: 'nav.howItWorks', id: 'how-it-works' },
];

export default function HomeNavbar() {
  const { t } = useTranslation();
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

  const mobileDrawer = mobileOpen && createPortal(
    <>
      <div
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm md:hidden"
      />
      <div className="fixed top-0 right-0 z-[9999] h-120 rounded-bl-2xl w-[280px] bg-white dark:bg-gray-950 shadow-2xl md:hidden overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
            <img src="/img/najah-circle-removebg-preview.png" alt="najah" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
              Najah
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close menu"
          >
            <HiX size={24} />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {scrollLinks.map((link) => (
            <button
              key={link.labelKey}
              onClick={() => handleScroll(link.id)}
              className="block w-full text-start px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0084D1] dark:hover:text-[#0084D1] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all min-h-[44px]"
            >
              {t(link.labelKey)}
            </button>
          ))}
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-start px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0084D1] dark:hover:text-[#0084D1] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all min-h-[44px]"
          >
            {t('nav.contact')}
          </Link>
        </div>

        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all min-h-[44px] flex items-center justify-center"
          >
            {t('nav.login')}
          </Link>
          <Link
            to="/register"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-[#FFB900] rounded-xl hover:bg-[#0084D1] transition-all min-h-[44px] flex items-center justify-center"
          >
            {t('nav.getStarted')}
          </Link>
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <>
    <motion.nav
      dir="ltr"
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
                key={link.labelKey}
                onClick={() => handleScroll(link.id)}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0084D1] dark:hover:text-[#0084D1] transition-colors"
              >
                {t(link.labelKey)}
              </button>
            ))}
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0084D1] dark:hover:text-[#0084D1] transition-colors"
            >
              {t('nav.contact')}
            </Link>
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
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
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#FFB900] rounded-xl hover:bg-[#0084D1] shadow-lg shadow-[#FFB900]/25 hover:shadow-[#0084D1]/40 transition-all"
            >
              {t('nav.getStarted')}
            </Link>
          </div>

          {/* Mobile right side: lang switcher + dark mode toggle + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <FaSun className="h-4 w-4 text-amber-500" /> : <FaMoon className="h-4 w-4 text-[#0084D1]" />}
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#0084D1] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

    </motion.nav>

      {mobileDrawer}
    </>
  );
}
