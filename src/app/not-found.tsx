'use client';

import { useRouter } from 'next/navigation';

export default function Error() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-gray-100 to-blue-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/90 p-8 rounded-2xl shadow-2xl border border-red-300 flex flex-col items-center">
        {/* Animated SVG illustration */}
        <svg className="w-24 h-24 mb-4 animate-bounce" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" fill="#fee2e2"/>
          <path d="M32 40v-8" stroke="#f87171" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="32" cy="32" r="4" fill="#f87171"/>
          <path d="M23 25c1-3 6-3 7 0" stroke="#f87171" strokeWidth="2"/>
          <path d="M41 25c-1-3-6-3-7 0" stroke="#f87171" strokeWidth="2"/>
        </svg>
        <h2 className="text-3xl font-bold text-center text-red-700 mb-3 tracking-tight">
          Oops! Something went wrong.
        </h2>
        <p className="text-gray-700 text-center mb-2">
          Our team is working to fix the issue.
        </p>
        <p className="text-gray-600 text-center mb-6">
          {'An unexpected error occurred.'}
        </p>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={()=>router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Home
          </button>
          <button
            onClick={()=>window.location.reload()}
            className="bg-red-50 hover:bg-red-100 text-red-500 font-medium py-1 px-4 rounded transition duration-300 border border-red-200"
          >
            Try Again
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          If this happens repeatedly, please contact support.
        </p>
      </div>
    </div>
  );
}
