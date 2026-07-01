import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { t } = useTranslation();
  const sections = t('static.terms.sections', { returnObjects: true });
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
      <HomeNavbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-[1.6] py-4 mb-4">
              {t('static.terms.title')}{' '}
              <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
                {t('static.terms.titleAccent')}
              </span>
            </h1>
            <p className="text-sm text-gray-400">{t('static.terms.lastUpdated')}</p>
          </div>

          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-xl font-bold mb-3">{s.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
