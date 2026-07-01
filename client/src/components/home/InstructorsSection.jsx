import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const InstructorCard = memo(function InstructorCard({ name, specialty, formations, img, color, i }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
      className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 hover:shadow-lg transition-all group"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div>
          <h3 className="font-semibold text-sm group-hover:text-[#0084D1] transition-colors">{name}</h3>
          <p className="text-xs text-gray-400">{specialty}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{t('home.formationsCount', { count: formations })}</span>
        <span className="flex items-center gap-1 text-[#0084D1] opacity-0 group-hover:opacity-100 transition-opacity">
          {t('home.viewProfile')} <FiArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
});

function InstructorsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const instructors = [
    { name: 'Dr. Ahmed Benali', specialty: t('home.specialtyFullstack'), formations: 12, img: 'https://i.pravatar.cc/80?img=11', color: 'from-[#FFB900] to-[#0084D1]' },
    { name: 'Sara Amrani', specialty: t('home.specialtyDataScience'), formations: 8, img: 'https://i.pravatar.cc/80?img=5', color: 'from-[#0084D1] to-[#FFB900]' },
    { name: 'Youssef Karim', specialty: t('home.specialtyMobile'), formations: 10, img: 'https://i.pravatar.cc/80?img=12', color: 'from-[#FFB900] to-[#e6a000]' },
    { name: 'Nadia Tazi', specialty: t('home.specialtyUIUX'), formations: 6, img: 'https://i.pravatar.cc/80?img=9', color: 'from-[#0084D1] to-[#0277BD]' },
    { name: 'Omar Razi', specialty: t('home.specialtyCloud'), formations: 7, img: 'https://i.pravatar.cc/80?img=13', color: 'from-[#FFB900] to-[#CC9400]' },
    { name: 'Lina Kadiri', specialty: t('home.specialtyCybersecurity'), formations: 5, img: 'https://i.pravatar.cc/80?img=10', color: 'from-[#0084D1] to-[#01579B]' },
  ];

  return (
    <section id="instructors" className="py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
            {t('home.instructorsTitle')}{' '}
            <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
              {t('home.instructorsTitleAccent')}
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
            {t('home.instructorsSubtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {instructors.map((inst, i) => (
            <InstructorCard key={inst.name} {...inst} i={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="text-center mt-10"
        >
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            {t('home.viewAllInstructors')}
            <FiArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default memo(InstructorsSection);
