export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-blue-600">
        <div className="flex flex-col items-center">
          <svg className="w-16 h-16 text-blue-700 animate-bounce mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-70" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M8 12h4v4" />
          </svg>
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-3 tracking-tight">
            Processing your request
          </h2>
          <div className="w-full mb-4">
            {/* Example skeleton progress bar */}
            <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-blue-500 animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-700 text-center mt-2">
            Sit tight — amazing things are on their way.
          </p>
        </div>
      </div>
    </div>
  );
}
