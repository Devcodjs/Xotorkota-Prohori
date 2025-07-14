// src/app/loading.tsx

export default function Loading() {
  // You can add any UI inside Loading, including a skeleton.
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Loading...
        </h2>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
        </div>
        <p className="text-gray-600 text-center mt-6">
          Please wait, loading may take a moment.
        </p>
      </div>
    </div>
  );
}
