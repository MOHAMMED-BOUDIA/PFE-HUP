import { useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { HiOutlineBookOpen, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineCalendar, HiOutlineChatAlt2, HiOutlineChartBar } from 'react-icons/hi';
import { HiCheck } from 'react-icons/hi';

const colors = {
  formations: 'from-[#FFB900] to-[#0084D1]',
  instructors: 'from-[#0084D1] to-[#FFB900]',
  group: 'from-[#FFB900] to-[#e6a000]',
  meetings: 'from-[#0084D1] to-[#0277BD]',
  chat: 'from-[#FFB900] to-[#CC9400]',
  progress: 'from-[#0084D1] to-[#01579B]',
};

function MiniStat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
    </div>
  );
}

const BentoCard = memo(function BentoCard({ icon: Icon, title, desc, color, size, i, children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const spanClass = size === 'large'
    ? 'sm:col-span-2 sm:row-span-2'
    : size === 'wide'
      ? 'sm:col-span-2 sm:row-span-1'
      : 'sm:col-span-1 sm:row-span-1';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-3xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 p-6 sm:p-7 flex flex-col transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#0084D1]/10 ${spanClass}`}
      style={{ willChange: 'transform' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl transition-opacity duration-300`} />

      <div className="mb-4 flex-shrink-0">
        <Icon className="w-10 h-10 text-[#FFB900]" />
      </div>

      <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{desc}</p>

      {children}
    </motion.div>
  );
});

function FeaturesBento() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const sectionInView = useInView(ref, { once: true, margin: '-60px' });

  const checkItems = [
    t('home.featuresCheck1'),
    t('home.featuresCheck2'),
    t('home.featuresCheck3'),
  ];

  return (
    <section id="formations" className="py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
            <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
              {t('home.featuresTitle')}
            </span>{' '}
            {t('home.featuresTitleSuffix')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
            {t('home.featuresSubtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto sm:auto-rows-[200px]">
          <BentoCard
            icon={HiOutlineBookOpen}
            title={t('home.featuresFormations')}
            desc={t('home.featuresFormationsDesc')}
            color={colors.formations}
            size="large"
            i={0}
          >
            <div className="mt-3 space-y-2 flex-1">
              {checkItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-4 h-4 rounded-full bg-[#0084D1]/10 flex items-center justify-center flex-shrink-0">
                    <HiCheck className="w-2.5 h-2.5 text-[#0084D1]" />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-t border-gray-100 dark:border-gray-800">
              <MiniStat value="50+" label={t('home.featuresFormationsCount')} />
              <MiniStat value="25+" label={t('home.featuresInstructorsCount')} />
              <MiniStat value="4.9" label={t('home.featuresAvgRating')} />
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                <span>{t('home.featuresCompletionRate')}</span>
                <span>78%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={sectionInView ? { width: '78%' } : {}}
                  transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#FFB900] to-[#0084D1]"
                />
              </div>
            </div>
          </BentoCard>

          <BentoCard
            icon={HiOutlineUserGroup}
            title={t('home.featuresInstructors')}
            desc={t('home.featuresInstructorsDesc')}
            color={colors.instructors}
            size="small"
            i={1}
          />

          <BentoCard
            icon={HiOutlineClipboardList}
            title={t('home.featuresGroupLearning')}
            desc={t('home.featuresGroupLearningDesc')}
            color={colors.group}
            size="small"
            i={2}
          />

          <BentoCard
            icon={HiOutlineCalendar}
            title={t('home.featuresLiveMeetings')}
            desc={t('home.featuresLiveMeetingsDesc')}
            color={colors.meetings}
            size="wide"
            i={3}
          >
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {t('home.featuresLiveNow')}
              </span>
              <span>12 {t('home.featuresSessionsThisWeek')}</span>
            </div>
          </BentoCard>

          <BentoCard
            icon={HiOutlineChatAlt2}
            title={t('home.featuresGroupChat')}
            desc={t('home.featuresGroupChatDesc')}
            color={colors.chat}
            size="small"
            i={4}
          />

          <BentoCard
            icon={HiOutlineChartBar}
            title={t('home.featuresProgress')}
            desc={t('home.featuresProgressDesc')}
            color={colors.progress}
            size="small"
            i={5}
          />
        </div>
      </div>
    </section>
  );
}

export default memo(FeaturesBento);
