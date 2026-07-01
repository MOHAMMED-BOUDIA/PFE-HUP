import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFB900] to-[#0084D1] p-6 sm:p-10 md:p-16 lg:p-20 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.15),transparent_60%)]" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {t('home.ctaTitle')}
            </h2>

            <p className="text-white/80 max-w-xl mx-auto mb-8 sm:mb-10 text-base sm:text-lg">
              {t('home.ctaSubtitle')}
            </p>

            <Link
              to="/register"
              className="relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 sm:px-10 py-4 min-h-[44px] bg-white text-[#0084D1] font-bold rounded-xl shadow-xl hover:shadow-2xl hover:bg-gray-100 transition-all text-base sm:text-lg group"
            >
              <span>{t('home.ctaButton')}</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
