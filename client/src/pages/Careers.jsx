import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import { FiMapPin, FiClock, FiBriefcase } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function Careers() {
  const { t } = useTranslation();

  const positions = [
    { title: t('static.careers.position0Title'), dept: t('static.careers.position0Dept'), location: t('static.careers.remote'), type: t('static.careers.fullTime'), desc: t('static.careers.position0Desc') },
    { title: t('static.careers.position1Title'), dept: t('static.careers.position1Dept'), location: 'Casablanca', type: t('static.careers.fullTime'), desc: t('static.careers.position1Desc') },
    { title: t('static.careers.position2Title'), dept: t('static.careers.position2Dept'), location: t('static.careers.remote'), type: t('static.careers.partTime'), desc: t('static.careers.position2Desc') },
    { title: t('static.careers.position3Title'), dept: t('static.careers.position3Dept'), location: t('static.careers.remote'), type: t('static.careers.fullTime'), desc: t('static.careers.position3Desc') },
    { title: t('static.careers.position4Title'), dept: t('static.careers.position4Dept'), location: 'Casablanca', type: t('static.careers.fullTime'), desc: t('static.careers.position4Desc') },
    { title: t('static.careers.position5Title'), dept: t('static.careers.position5Dept'), location: t('static.careers.remote'), type: t('static.careers.internship'), desc: t('static.careers.position5Desc') },
  ];

  const perks = t('static.careers.perks', { returnObjects: true });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
      <HomeNavbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-[1.6] py-4 mb-4">
              {t('static.careers.title')}{' '}
              <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
                {t('static.careers.titleAccent')}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-8">
              {t('static.careers.subtitle')}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0084D1]/10 border border-[#0084D1]/30 text-sm font-medium text-[#0084D1] mx-auto block w-fit mb-10 sm:mb-16">
            <span className="w-2 h-2 rounded-full bg-[#0084D1] animate-pulse" />
            {t('static.careers.hiring')}
          </div>

          {/* Culture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 items-center mb-16 sm:mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-4">{t('static.careers.ourCulture')}</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                {t('static.careers.cultureText')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {perks.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0084D1]" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-[4/3] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
                alt="Modern office team"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0084D1]/20 to-[#0084D1]/20" />
            </div>
          </div>

          {/* Open Positions */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">{t('static.careers.openPositions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map((pos) => (
                <div key={pos.title} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="mb-4">
                    <FiBriefcase className="w-10 h-10 text-[#FFB900]" />
                  </div>
                  <h3 className="font-bold mb-1 group-hover:text-[#0084D1] transition-colors">{pos.title}</h3>
                  <p className="text-xs text-[#0084D1] font-medium mb-3">{pos.dept}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{pos.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{pos.location}</span>
                    <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{pos.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
