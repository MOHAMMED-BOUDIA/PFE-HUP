import { memo } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';



function Stars() {
  return (
    <div className="flex gap-0.5 mb-3">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ quote, name, role, avatar, i }) {
  const borders = [
    'border-[#FFB900]/30',
    'border-[#0084D1]/30',
    'border-[#FFB900]/30',
    'border-[#0084D1]/30',
    'border-[#FFB900]/30',
    'border-[#0084D1]/30',
  ];

  return (
    <div
      className={`flex-shrink-0 w-[280px] sm:w-[340px] rounded-2xl border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg transition-shadow ${borders[i % borders.length]}`}
    >
      <Stars />
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFB900] to-[#0084D1] flex items-center justify-center text-xs font-bold text-white">
          {avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse }) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="overflow-hidden mb-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-5"
        style={{
          animation: `marquee-${reverse ? 'rev' : 'fwd'} 10s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {items.map((t, i) => (
          <TestimonialCard key={`${reverse ? 'r' : 'f'}-${i}`} {...t} i={i} />
        ))}
      </div>
    </div>
  );
}

const TestimonialsMarquee = memo(function TestimonialsMarquee() {
  const { t } = useTranslation();

  const testimonials = [
    { quote: t('home.testimonialQ0'), name: 'Sara M.', role: t('home.testimonialRole0'), avatar: 'SM' },
    { quote: t('home.testimonialQ1'), name: 'Ahmed K.', role: t('home.testimonialRole1'), avatar: 'AK' },
    { quote: t('home.testimonialQ2'), name: 'Yasmine B.', role: t('home.testimonialRole2'), avatar: 'YB' },
    { quote: t('home.testimonialQ3'), name: 'Omar R.', role: t('home.testimonialRole3'), avatar: 'OR' },
    { quote: t('home.testimonialQ4'), name: 'Lina K.', role: t('home.testimonialRole4'), avatar: 'LK' },
    { quote: t('home.testimonialQ5'), name: 'Rayan M.', role: t('home.testimonialRole5'), avatar: 'RM' },
  ];

  const doubled = [...testimonials, ...testimonials];
  const doubledRev = [...testimonials, ...testimonials].reverse();

  return (
    <section className="py-16 sm:py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-[#FFB900]/5 via-[#0084D1]/5 to-[#FFB900]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
            <span className="bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent">
              {t('home.testimonialsTitle')}
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
            {t('home.testimonialsSubtitle')}
          </p>
        </div>
      </div>

      <MarqueeRow items={doubled} reverse={false} />
      <MarqueeRow items={doubledRev} reverse={true} />
    </section>
  );
});

export default TestimonialsMarquee;
