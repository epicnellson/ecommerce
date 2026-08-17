import { motion } from 'framer-motion';

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between pt-2">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function SearchBarSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-3">
        <div className="h-12 bg-gray-200 rounded-xl flex-1" />
        <div className="h-12 bg-gray-200 rounded-xl w-32" />
        <div className="h-12 bg-gray-200 rounded-xl w-24" />
        <div className="h-12 bg-gray-200 rounded-xl w-24" />
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-gray-500">Loading...</p>
    </motion.div>
  );
}

export { ProductCardSkeleton, ProductGridSkeleton, SearchBarSkeleton, PageLoader };
