'use client';

import { useRouter } from 'next/navigation';

export default function Error() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-red-700 mb-6">
          Oops! Something went wrong.
        </h2>
        <p className="text-gray-700 text-center mb-4">
          We encountered an error and are working to fix it.
        </p>
        <p className="text-gray-600 text-center mb-6">
          {'An unexpected error occurred.'}
        </p>
        <div className="text-center">
          <button
            onClick={()=>router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
