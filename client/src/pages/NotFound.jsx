import { Link } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import { FiHome } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <HomeNavbar />
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black bg-gradient-to-r from-[#FFB900] to-[#0084D1] bg-clip-text text-transparent leading-[1.2] py-4">
            404
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mt-4 mb-8">
            Page not found
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#FFB900] to-[#0084D1] px-6 py-3 min-h-[44px] text-sm font-bold text-white shadow-lg shadow-[#0084D1]/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#0084D1]/30"
          >
            <FiHome className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
