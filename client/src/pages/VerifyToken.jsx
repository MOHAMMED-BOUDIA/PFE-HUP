import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaProjectDiagram } from 'react-icons/fa';
import axiosInstance from '../api/axios';

const VerifyToken = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await axiosInstance.get(`/auth/verify/${token}`);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-4 transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-900 border border-indigo-100/10 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <FaSpinner className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your account...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                <FaCheckCircle className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-black text-gray-900 dark:text-white">
                Account confirmed!
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your email has been verified successfully. You can now log in.
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
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <FaTimesCircle className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-black text-gray-900 dark:text-white">
                Invalid link
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This verification link is invalid or has expired. Please try registering again.
              </p>
            </div>
            <div className="mt-8 border-t border-gray-150 pt-6 dark:border-gray-800">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <FaProjectDiagram className="h-4 w-4" />
                Go to Register
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyToken;
