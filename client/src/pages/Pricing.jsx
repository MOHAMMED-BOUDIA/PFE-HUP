import { Link } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import { HiCheck } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';

export default function Pricing() {
  const { t } = useTranslation();

  const plans = [
    {
      name: t('static.pricing.free'),
      price: '0',
      desc: t('static.pricing.freeDesc'),
      features: t('static.pricing.freeFeatures', { returnObjects: true }),
      cta: t('static.pricing.freeCta'),
      to: '/register',
      highlight: false,
    },
    {
      name: t('static.pricing.pro'),
      price: '199',
      desc: t('static.pricing.proDesc'),
      features: t('static.pricing.proFeatures', { returnObjects: true }),
      cta: t('static.pricing.proCta'),
      to: '/register',
      highlight: true,
    },
    {
      name: t('static.pricing.enterprise'),
      price: '999',
      desc: t('static.pricing.enterpriseDesc'),
      features: t('static.pricing.enterpriseFeatures', { returnObjects: true }),
      cta: t('static.pricing.enterpriseCta'),
      to: '/contact',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
      <HomeNavbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-[1.6] py-4 mb-4">
              {t('static.pricing.title')}{' '}
              <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
                {t('static.pricing.titleAccent')}
              </span>{' '}
              {t('static.pricing.titleSuffix')}
            </h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
              {t('static.pricing.subtitle')}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-800/50 text-sm font-medium text-emerald-600 dark:text-emerald-400 mx-auto block w-fit mb-10 sm:mb-14">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('static.pricing.freeForStudents')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-3xl border transition-shadow hover:shadow-xl flex flex-col h-full ${
                  plan.highlight
                    ? 'border-[#0084D1]/50 bg-gradient-to-b from-[#0084D1]/10 to-white shadow-lg shadow-[#0084D1]/10'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FFB900] to-[#0084D1] text-white text-xs font-semibold">
                    {t('static.pricing.mostPopular')}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.name === t('static.pricing.enterprise') ? t('static.pricing.enterprisePriceSuffix') : t('static.pricing.priceSuffix')}</span>
                  </div>
                  <p className="text-sm text-gray-400">{plan.desc}</p>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <HiCheck className="w-4 h-4 text-[#0084D1] mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.to}
                  className={`mt-auto block w-full text-center py-3 min-h-[44px] rounded-xl font-semibold text-sm transition-all flex items-center justify-center ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-[#FFB900] to-[#0084D1] text-white shadow-lg shadow-[#0084D1]/25 hover:from-[#FFB900] hover:to-[#0277BD]'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
