import { useParams, Link } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import { FiArrowLeft, FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const postMeta = [
  { id: 'future-online-learning', key: 'futureOnlineLearning', date: '2026-06-22', color: 'from-[#FFB900] to-[#0084D1]' },
  { id: '5-tips-succeed-formation', key: 'tipsSucceedFormation', date: '2026-06-18', color: 'from-[#FFB900] to-[#0084D1]' },
  { id: 'choose-right-instructor', key: 'chooseRightInstructor', date: '2026-06-14', color: 'from-cyan-500 to-blue-600' },
  { id: 'top-instructors-month', key: 'topInstructorsMonth', date: '2026-06-10', color: 'from-emerald-500 to-teal-600' },
  { id: 'group-learning-vs-self-study', key: 'groupLearningVsSelfStudy', date: '2026-06-06', color: 'from-amber-500 to-orange-600' },
  { id: 'career-tech-without-degree', key: 'careerTechWithoutDegree', date: '2026-06-02', color: 'from-rose-500 to-pink-600' },
];

export default function BlogDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const meta = postMeta.find((p) => p.id === id);

  if (!meta) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
        <HomeNavbar />
        <section className="pt-32 pb-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">{t('static.blog.notFound')}</h1>
            <Link to="/blog" className="text-[#0084D1] hover:underline">{t('static.blog.backToBlog')}</Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const prefix = `static.blog.${meta.key}`;
  const title = t(`${prefix}.title`);
  const categoryKey = t(`${prefix}.category`);
  const category = t(`static.blog.${categoryKey}`);
  const readTime = t(`${prefix}.readTime`);
  const author = t(`${prefix}.author`);
  const content = t(`${prefix}.content`, { returnObjects: true });

  const formattedDate = new Date(meta.date).toLocaleDateString(
    i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
      <HomeNavbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0084D1] transition-colors mb-8">
            <FiArrowLeft className="w-4 h-4" />
            {t('static.blog.backToBlog')}
          </Link>

          <div className={`inline-flex px-3 py-1 rounded-full bg-gradient-to-r ${meta.color} text-white text-xs font-medium mb-4`}>
            {category}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">{title}</h1>

          <div className="flex items-center gap-6 text-sm text-gray-400 mb-10 pb-8 border-b border-gray-200 dark:border-gray-800">
            <span className="flex items-center gap-1.5"><FiUser className="w-4 h-4" />{author}</span>
            <span className="flex items-center gap-1.5"><FiCalendar className="w-4 h-4" />{formattedDate}</span>
            <span className="flex items-center gap-1.5"><FiClock className="w-4 h-4" />{readTime}</span>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {Array.isArray(content) && content.map((paragraph, i) => (
              <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
