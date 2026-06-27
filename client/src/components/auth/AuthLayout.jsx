import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const features = [
  { text: 'Learn from industry experts' },
  { text: 'Join interactive study groups' },
  { text: 'Track your progress in real-time' },
];

const quotes = [
  { text: '"NAJAH transformed the way I learn — the structured guidance and community support are unmatched."', author: '— Sara A., CS Student' },
  { text: '"The hands-on projects and expert mentorship helped me land my dream internship."', author: '— Ahmed K., Engineering' },
  { text: '"I love how NAJAH makes complex topics easy to understand. Highly recommended!"', author: '— Mariam B., Data Science' },
];

const shapes = [
  { size: 280, top: '-10%', right: '-15%', delay: 0 },
  { size: 160, bottom: '15%', left: '-8%', delay: 0.3 },
  { size: 100, top: '40%', right: '10%', delay: 0.6 },
  { size: 60, bottom: '35%', right: '25%', delay: 0.9 },
  { size: 40, top: '20%', left: '20%', delay: 1.2 },
];

const NajahLogo = ({ className = '', white = false }) => (
  <svg viewBox="0 0 160 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="32" fontWeight="900" fontSize="28" fontFamily="system-ui, sans-serif" letterSpacing="1" fill={white ? '#fff' : '#0084D1'}>NAJAH</text>
    <circle cx="130" cy="10" r="4" fill="#FFB900" />
    <circle cx="142" cy="10" r="4" fill="#0084D1" />
  </svg>
);

const AuthLayout = ({ children, title, subtitle }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* ─── LEFT: Branding Panel ─────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 hidden md:block">
        <div className="relative h-full w-full bg-gradient-to-br from-[#FFB900] to-[#0084D1]">
          {/* Decorative shapes */}
          {shapes.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5 animate-float"
              style={{
                width: s.size,
                height: s.size,
                top: s.top,
                bottom: s.bottom,
                left: s.left,
                right: s.right,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${s.delay}s`,
                animationDuration: '8s',
              }}
            />
          ))}
          {/* Grid dots pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex w-full">
        {/* Left panel content */}
        <div
          className={`hidden md:flex md:w-1/2 flex-col justify-between p-12 text-white transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Logo */}
          <div>
            <NajahLogo className="h-10 w-auto" white />
          </div>

          {/* Center content */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-black leading-tight">
                Welcome to NAJAH 🎓
              </h1>
              <p className="text-lg text-white/80 font-medium">
                Your gateway to expert-led online learning
              </p>
            </div>

            {/* Feature bullets */}
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm font-medium text-white/90"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs">
                    ✓
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonial */}
          <div className="relative">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/10">
              <p className="text-sm leading-relaxed text-white/90 transition-opacity duration-500">
                {quotes[quoteIndex].text}
              </p>
              <p className="mt-2 text-xs font-semibold text-white/70">
                {quotes[quoteIndex].author}
              </p>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Form Panel ─────────────────────────────────────────── */}
        <div
          className={`flex w-full md:w-1/2 min-h-screen items-center justify-center bg-white dark:bg-gray-950 p-6 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Mobile logo */}
          <div className="md:hidden fixed top-6 left-1/2 -translate-x-1/2 z-20">
            <NajahLogo className="h-8 w-auto" />
          </div>

          {/* Back to Home */}
          <Link
            to="/"
            className="fixed top-5 left-5 z-20 flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm border border-white/20 hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-[1.02]"
          >
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          <div className="w-full max-w-[420px]">
            {/* Mobile tagline */}
            <div className="md:hidden text-center pt-14 pb-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your gateway to expert-led online learning
              </p>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            </div>

            {/* Divider line */}
            <div className="h-px bg-gradient-to-r from-[#FFB900]/30 via-[#0084D1]/30 to-transparent mb-8" />

            {children}
          </div>
        </div>
      </div>

      {/* Entrance animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
          33% { transform: translate(-50%, -50%) translateY(-20px) rotate(1deg); }
          66% { transform: translate(-50%, -50%) translateY(10px) rotate(-1deg); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export { NajahLogo };
export default AuthLayout;
