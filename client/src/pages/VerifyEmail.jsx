import { Link } from 'react-router-dom';
import { FaEnvelope, FaProjectDiagram } from 'react-icons/fa';

const VerifyEmail = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-4 transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-900 border border-indigo-100/10 text-center">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <FaEnvelope className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-black text-gray-900 dark:text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Please check your Gmail to confirm your account
          </p>
        </div>

        <div className="mt-8 border-t border-gray-150 pt-6 dark:border-gray-800">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
          >
            <FaProjectDiagram className="h-4 w-4" />
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
