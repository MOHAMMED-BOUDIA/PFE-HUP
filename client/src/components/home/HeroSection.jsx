import { useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HiArrowRight, HiStar } from 'react-icons/hi';

const avatars = [
  'https://i.pravatar.cc/40?img=1',
  'https://i.pravatar.cc/40?img=2',
  'https://i.pravatar.cc/40?img=3',
  'https://i.pravatar.cc/40?img=4',
  'https://i.pravatar.cc/40?img=5',
];

const CTAButton = memo(function CTAButton({ children, to, primary }) {
  const isHash = to.startsWith('#');
  if (isHash) {
    const handleClick = (e) => {
      e.preventDefault();
      const target = document.getElementById(to.replace('#', ''));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };
    return (
      <a
        href={`/${to}`}
        onClick={handleClick}
        className={`relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 w-full md:w-auto min-h-[44px] ${
          primary
            ? 'bg-[#FFB900] text-white shadow-xl shadow-[#FFB900]/25 hover:bg-[#0084D1] hover:shadow-[#0084D1]/40 hover:scale-[1.03]'
            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        {children}
        {primary && <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
      </a>
    );
  }
  return (
    <Link
      to={to}
      className={`relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 w-full md:w-auto min-h-[44px] ${
        primary
          ? 'bg-[#FFB900] text-white shadow-xl shadow-[#FFB900]/25 hover:bg-[#0084D1] hover:shadow-[#0084D1]/40 hover:scale-[1.03]'
          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
      {primary && <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
    </Link>
  );
});

const DashboardMockup = memo(function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-br from-[#0084D1]/20 via-[#FFB900]/10 to-transparent rounded-3xl blur-3xl" />

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-[#0084D1]/10 border border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="flex-1 mx-4">
            <div className="mx-auto max-w-[200px] h-5 rounded-md bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 font-medium">
              najah-platform.study
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">My Courses</p>
            <span className="text-xs text-[#0084D1] font-medium">View all</span>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Advanced React Development', progress: 75, color: 'bg-[#0084D1]', abbr: 'RE' },
              { title: 'Machine Learning with Python', progress: 42, color: 'bg-[#FFB900]', abbr: 'ML' },
              { title: 'Cloud Architecture', progress: 90, color: 'bg-emerald-500', abbr: 'CA' },
            ].map((course) => (
              <div key={course.title} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className={`w-10 h-10 rounded-lg ${course.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {course.abbr}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${course.color}`}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex-shrink-0">{course.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="absolute -right-6 -bottom-6 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3"
      >
        <div className="flex-shrink-0">
          <HiStar className="w-10 h-10 text-[#FFB900]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">New Certificate</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">React Advanced</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="absolute -left-4 top-12 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3"
      >
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Live Session</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Starts in 15 min</p>
        </div>
      </motion.div>
    </div>
  );
});

const ScrollIndicator = memo(function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
     
    </motion.div>
  );
});

function HeroSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-transparent to-transparent dark:from-secondary/10 dark:via-transparent" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FFB900]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#0084D1]/10 rounded-full blur-[120px]" />

      <motion.div style={{ y, opacity }} className="relative w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 lg:space-y-7 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB900]/10 border border-[#FFB900]/30 text-sm font-medium text-[#FFB900]"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {t('home.heroBadge')}
              </motion.div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-[1.1]">
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="block"
                >
                  {t('home.heroTitle')}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="block mt-1"
                >
                  <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
                    {t('home.heroTitleAccent')}
                  </span>
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed"
              >
                {t('home.heroSubtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <CTAButton to="/register" primary>{t('home.startLearning')}</CTAButton>
                <CTAButton to="#formations">{t('home.browseFormations')}</CTAButton>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-2"
              >
                <div className="flex -space-x-2 justify-center">
                  {avatars.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      loading="lazy"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[#FFB900]">
                    {[...Array(5)].map((_, i) => (
                      <HiStar key={i} className="w-6 h-6" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('home.joinedBy')} <span className="font-semibold text-gray-900 dark:text-white">500+</span> {t('home.studentsAndRating')}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="hidden lg:block">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </motion.div>

      <ScrollIndicator />
    </section>
  );
}

export default memo(HeroSection);
