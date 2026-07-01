import { useState } from 'react';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import { FiSearch, FiBookOpen, FiUserCheck, FiSettings, FiShield, FiLayers, FiTool, FiX, FiClock, FiArrowRight, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Help() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const articlesData = t('static.help.articles', { returnObjects: true });
  const articles = articlesData.map((a, i) => ({ ...a, id: i + 1 }));

  const categoryOptions = [
    { key: 'Getting Started', label: t('static.help.gettingStarted'), icon: FiBookOpen, desc: t('static.help.gettingStartedDesc') },
    { key: 'Account', label: t('static.help.account'), icon: FiUserCheck, desc: t('static.help.accountDesc') },
    { key: 'Formations', label: t('static.help.formations'), icon: FiLayers, desc: t('static.help.formationsDesc') },
    { key: 'Instructors', label: t('static.help.instructors'), icon: FiTool, desc: t('static.help.instructorsDesc') },
    { key: 'Billing', label: t('static.help.billing'), icon: FiSettings, desc: t('static.help.billingDesc') },
    { key: 'Security', label: t('static.help.security'), icon: FiShield, desc: t('static.help.securityDesc') },
  ];

  const categoryLabels = {
    'Getting Started': t('static.help.gettingStarted'),
    'Account': t('static.help.account'),
    'Formations': t('static.help.formations'),
    'Instructors': t('static.help.instructors'),
    'Billing': t('static.help.billing'),
    'Security': t('static.help.security'),
  };

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || a.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
      <HomeNavbar />

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-16 overflow-y-auto bg-black/50 backdrop-blur-sm" onClick={() => setSelectedArticle(null)}>
          <div className="relative w-full max-w-3xl mx-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0084D1] transition-colors">
                <FiX className="w-4 h-4" />
                {t('static.help.close')}
              </button>
              <span className="text-xs text-gray-400">{t('static.help.lastUpdated')}</span>
            </div>
            <div className="px-6 py-8">
              <span className="inline-flex px-3 py-1 rounded-full bg-[#0084D1]/10 text-[#0084D1] text-xs font-medium mb-4">
                {categoryLabels[selectedArticle.category] || selectedArticle.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">{selectedArticle.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <FiClock className="w-3 h-3" />
                {selectedArticle.readTime}
              </div>
              <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedArticle.content}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold mb-3">{t('static.help.relatedArticles')}</h3>
                <div className="space-y-2">
                  {articles.filter((a) => a.category === selectedArticle.category && a.id !== selectedArticle.id).slice(0, 3).map((rel) => (
                    <button key={rel.id} onClick={() => setSelectedArticle(rel)} className="block text-sm text-[#0084D1] hover:underline text-left">
                      {rel.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-[1.6] py-4 mb-4">
              {t('static.help.title')}{' '}
              <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
                {t('static.help.titleAccent')}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-8">
              {t('static.help.subtitle')}
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('static.help.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0084D1] focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 sm:mb-12">
            <button
              onClick={() => setCategory('All')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                category === 'All'
                  ? 'border-[#0084D1] bg-[#0084D1]/10 shadow-md'
                  : 'border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <h3 className="font-semibold">{t('static.help.allArticles')}</h3>
              <p className="text-sm text-gray-400 mt-1">{articles.length} {t('static.help.articlesLabel')}</p>
            </button>
            {categoryOptions.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  category === cat.key
                    ? 'border-[#0084D1] bg-[#0084D1]/10 shadow-md'
                    : 'border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="mb-3">
                  <cat.icon className="w-9 h-9 text-[#FFB900]" />
                </div>
                <h3 className="font-semibold text-sm">{cat.label}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.desc}</p>
              </button>
            ))}
          </div>

          {/* Results Header */}
          <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {search || category !== 'All' ? t('static.help.searchResults') : t('static.help.popularArticles')}
            </h2>
            <span className="text-xs text-gray-400">{filtered.length} {t('static.help.articlesLabel')}</span>
          </div>

          {/* Articles List */}
          <div className="max-w-3xl mx-auto space-y-3 mb-16">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{t('static.help.noResults')}</p>
                <button onClick={() => { setSearch(''); setCategory('All'); }} className="text-sm text-[#0084D1] hover:underline mt-2">
                  {t('static.help.clearFilters')}
                </button>
              </div>
            ) : (
              filtered.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition flex items-start justify-between gap-4 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[#0084D1]">{categoryLabels[article.category] || article.category}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><FiClock className="w-3 h-3" />{article.readTime}</span>
                    </div>
                    <h3 className="font-semibold text-sm">{article.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{article.description}</p>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0084D1] transition-colors flex-shrink-0 mt-1" />
                </button>
              ))
            )}
          </div>

          {/* Contact Support */}
          <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0084D1]/10 to-[#FFB900]/10 border border-[#0084D1]/30 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('static.help.stillNeedHelp')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {t('static.help.supportDesc')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#FFB900] text-white font-semibold text-sm hover:bg-[#0084D1] transition-all shadow-lg shadow-[#0084D1]/25">
                {t('static.help.contactSupport')}
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <a href="mailto:support@najah.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <FiMail className="w-4 h-4" />
                support@najah.com
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
