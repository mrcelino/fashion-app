export const Spinner = () => (
  <div className="flex flex-col justify-center items-center w-full h-64">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
    </div>
    <p className="mt-4 text-gray-600 animate-pulse">Memuat produk...</p>
  </div>
);