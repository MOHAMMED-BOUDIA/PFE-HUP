import { useState } from 'react';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import { FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-medium text-gray-900 dark:text-white">{q}</span>
        <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();

  const categories = [
    {
      name: t('static.faq.general'),
      items: [
        { q: t('static.faq.q0'), a: t('static.faq.a0') },
        { q: t('static.faq.q1'), a: t('static.faq.a1') },
        { q: t('static.faq.q2'), a: t('static.faq.a2') },
      ],
    },
    {
      name: t('static.faq.students'),
      items: [
        { q: t('static.faq.q3'), a: t('static.faq.a3') },
        { q: t('static.faq.q4'), a: t('static.faq.a4') },
        { q: t('static.faq.q5'), a: t('static.faq.a5') },
      ],
    },
    {
      name: t('static.faq.instructors'),
      items: [
        { q: t('static.faq.q6'), a: t('static.faq.a6') },
        { q: t('static.faq.q7'), a: t('static.faq.a7') },
        { q: t('static.faq.q8'), a: t('static.faq.a8') },
      ],
    },
    {
      name: t('static.faq.billing'),
      items: [
        { q: t('static.faq.q9'), a: t('static.faq.a9') },
        { q: t('static.faq.q10'), a: t('static.faq.a10') },
        { q: t('static.faq.q11'), a: t('static.faq.a11') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
      <HomeNavbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-[1.6] py-4 mb-4">
              {t('static.faq.title')}{' '}
              <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
                {t('static.faq.titleAccent')}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
              {t('static.faq.subtitle')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-12">
            {categories.map((cat, index) => (
              <div key={index}>
                <h2 className="text-lg font-bold text-[#0084D1] mb-2">{cat.name}</h2>
                <div className="border-t border-gray-200 dark:border-gray-800">
                  {cat.items.map((item) => (
                    <Accordion key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
