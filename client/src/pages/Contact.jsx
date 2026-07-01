import { useState } from 'react';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
      <HomeNavbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-[1.6] py-4 mb-6">
              {t('static.contact.title')}{' '}
              <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
                {t('static.contact.titleAccent')}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
              {t('static.contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div className="p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('static.contact.name')}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0084D1] focus:border-transparent outline-none transition"
                    placeholder={t('static.contact.namePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('static.contact.email')}</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0084D1] focus:border-transparent outline-none transition"
                    placeholder={t('static.contact.emailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('static.contact.message')}</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0084D1] focus:border-transparent outline-none transition resize-none"
                    placeholder={t('static.contact.messagePlaceholder')}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFB900] to-[#0084D1] text-white font-semibold hover:from-[#FFB900] hover:to-[#0277BD] transition-all shadow-lg shadow-[#0084D1]/25"
                >
                  {sent ? t('static.contact.messageSent') : t('static.contact.send')}
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0084D1]/10 flex items-center justify-center text-[#0084D1]">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('static.contact.email')}</p>
                  <p className="text-sm text-gray-400">{t('static.contact.emailContact')}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0084D1]/10 flex items-center justify-center text-[#0084D1]">
                  <FiPhone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('static.contact.phone')}</p>
                  <p className="text-sm text-gray-400">{t('static.contact.phone')}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('static.contact.address')}</p>
                  <p className="text-sm text-gray-400">{t('static.contact.address')}</p>
                </div>
              </div>

              <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center h-40">
                <p className="text-sm text-gray-400">{t('static.contact.mapPlaceholder')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
