import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiMail, HiSearch, HiPlay } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';

const StepItem = memo(function StepItem({ step, i }) {
  const ref = useRef(null);
  const cardInView = useInView(ref, { once: true, margin: '-40px' });
  const StepIcon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={cardInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay: i * 0.15, ease: 'easeOut' }}
      className="relative flex items-start gap-6 md:gap-10"
    >
      <div className="relative z-10 flex-shrink-0">
        <div className="flex-shrink-0">
          <StepIcon className="w-10 h-10 text-[#FFB900]" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-950 border-2 border-[#0084D1] flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#0084D1]">{i + 1}</span>
        </div>
      </div>

      <div className="flex-1 pt-1">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
});

function HowItWorksTimeline() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const steps = [
    { icon: HiMail, title: t('home.step1Title'), desc: t('home.step1Desc') },
    { icon: HiSearch, title: t('home.step2Title'), desc: t('home.step2Desc') },
    { icon: HiPlay, title: t('home.step3Title'), desc: t('home.step3Desc') },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
            {t('home.stepsTitle')}{' '}
            <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
              {t('home.stepsTitleAccent')}
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
            {t('home.stepsSubtitle')}
          </p>
        </motion.div>

        <div ref={ref} className="max-w-3xl mx-auto relative">
          <div className="absolute left-6 top-14 bottom-0 w-0.5 hidden md:block">
            <motion.div
              initial={{ height: 0 }}
              animate={isInView ? { height: '100%' } : {}}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="w-full bg-gradient-to-b from-[#FFB900] to-[#0084D1]"
            />
          </div>

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, i) => (
              <StepItem key={step.title} step={step} i={i} active={isInView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(HowItWorksTimeline);
