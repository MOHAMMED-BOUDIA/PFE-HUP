import { useState } from 'react';
import { Link } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import { FiClock, FiUser } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const postMeta = [
  { id: 'future-online-learning', key: 'futureOnlineLearning', date: '2026-06-22', color: 'from-[#FFB900] to-[#0084D1]' },
  { id: '5-tips-succeed-formation', key: 'tipsSucceedFormation', date: '2026-06-18', color: 'from-[#FFB900] to-[#0084D1]' },
  { id: 'choose-right-instructor', key: 'chooseRightInstructor', date: '2026-06-14', color: 'from-cyan-500 to-blue-600' },
  { id: 'top-instructors-month', key: 'topInstructorsMonth', date: '2026-06-10', color: 'from-emerald-500 to-teal-600' },
  { id: 'group-learning-vs-self-study', key: 'groupLearningVsSelfStudy', date: '2026-06-06', color: 'from-amber-500 to-orange-600' },
  { id: 'career-tech-without-degree', key: 'careerTechWithoutDegree', date: '2026-06-02', color: 'from-rose-500 to-pink-600' },
];

const categoryKeys = ['All', 'education', 'studentTips', 'guidance', 'community', 'career'];

export default function Blog() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('All');

  const categoryLabels = {
    All: t('static.blog.all'),
    education: t('static.blog.education'),
    studentTips: t('static.blog.studentTips'),
    guidance: t('static.blog.guidance'),
    community: t('static.blog.community'),
    career: t('static.blog.career'),
  };

  const filteredPosts = activeCategory === 'All'
    ? postMeta
    : postMeta.filter((p) => {
        const prefix = `static.blog.${p.key}`;
        return t(`${prefix}.category`) === activeCategory;
      });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
      <HomeNavbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-[1.6] py-4 mb-4">
              {t('static.blog.title')}{' '}
              <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
                {t('static.blog.titleAccent')}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-8">
              {t('static.blog.subtitle')}
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-14">
            {categoryKeys.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#FFB900] to-[#0084D1] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const prefix = `static.blog.${post.key}`;
              const title = t(`${prefix}.title`);
              const excerpt = t(`${prefix}.excerpt`);
              const postCategory = t(`${prefix}.category`);
              const author = t(`${prefix}.author`);
              const readTime = t(`${prefix}.readTime`);
              const formattedDate = new Date(post.date).toLocaleDateString(
                i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US',
                { year: 'numeric', month: 'short', day: 'numeric' }
              );
              const catLabel = categoryLabels[postCategory];

              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all block"
                >
                  <div className={`h-44 bg-gradient-to-br ${post.color} flex items-center justify-center`}>
                    <span className="text-4xl font-bold text-white/30">{catLabel}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${post.color} text-white`}>{catLabel}</span>
                      <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{readTime}</span>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-[#0084D1] transition-colors">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">{excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><FiUser className="w-3 h-3" />{author}</span>
                      <span className="text-xs text-gray-400">{formattedDate}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <p className="text-center text-gray-400 mt-12">{t('static.blog.noArticles')}</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
