import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import AuthLayout from '../components/auth/AuthLayout';

const VerifyEmail = () => {
  return (
    <AuthLayout title="Verify your email" subtitle="Almost there! Check your inbox.">
      <div className="space-y-6">
        {/* Success message */}
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-6 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <FaEnvelope className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              Check your Gmail inbox
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">
              We've sent you a confirmation email.
              <br />
              Click the link in the email to activate your account.
            </p>
          </div>
        </div>

        {/* Didnt receive help */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Didn't receive the email?{' '}
            <span className="font-semibold text-[#0084D1] hover:text-[#0277BD] cursor-pointer">
              Resend
            </span>
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/login"
          className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFB900] to-[#0084D1] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0084D1]/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#0084D1]/30"
        >
          Go to Login
          <FaArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
