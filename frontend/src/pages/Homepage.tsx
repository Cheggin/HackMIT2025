import React, { useEffect } from 'react';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { productService, threadService } from '../services/api';
import Header from '../components/Header';
import WelcomeBanner from '../components/WelcomeBanner';
import ProductCard from '../components/ProductCard';
import ThreadCard from '../components/ThreadCard';
import EmptyState from '../components/EmptyState';
import { ProductCardSkeleton, ThreadCardSkeleton } from '../components/LoadingSkeleton';

const Homepage: React.FC = () => {
  const {
    products,
    threads,
    productsLoading,
    threadsLoading,
    setProducts,
    setThreads,
    setProductsLoading,
    setThreadsLoading,
    setProductsError,
    setThreadsError,
  } = useStore();

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const data = await productService.fetchProducts();
        // Add AI analyses to each product
        const productsWithAnalyses = await Promise.all(
          data.map(async (product) => {
            try {
              const analyses = await productService.fetchAIAnalysis(product.id);
              return { ...product, aiAnalyses: analyses };
            } catch {
              return product;
            }
          })
        );
        setProducts(productsWithAnalyses);
      } catch (error) {
        setProductsError('Failed to load products');
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [setProducts, setProductsLoading, setProductsError]);

  // Fetch threads on mount
  useEffect(() => {
    const fetchThreads = async () => {
      setThreadsLoading(true);
      try {
        const data = await threadService.fetchThreads();
        setThreads(data);
      } catch (error) {
        setThreadsError('Failed to load threads');
        console.error('Error fetching threads:', error);
      } finally {
        setThreadsLoading(false);
      }
    };

    fetchThreads();
  }, [setThreads, setThreadsLoading, setThreadsError]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <WelcomeBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-ph-orange/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-ph-orange" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Top Products Launching Today
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Analyzed by 5 specialized AI agents for unbiased ratings
                  </p>
                </div>
              </div>
              <button className="text-sm font-medium text-ph-orange hover:text-ph-orange-dark transition-colors flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Products List */}
            <div className="space-y-4">
              {productsLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              ) : products.length > 0 ? (
                // Product cards
                products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={{ ...product, rank: index + 1 }}
                    isRanked={true}
                  />
                ))
              ) : (
                // Empty state
                <EmptyState
                  type="products"
                  onAction={() => console.log('Submit product')}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Trending Threads Section */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-ph-orange" />
                    <h2 className="font-semibold text-gray-900">
                      Trending Forum Threads
                    </h2>
                  </div>
                  <button className="text-xs font-medium text-ph-orange hover:text-ph-orange-dark transition-colors">
                    View All
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {threadsLoading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <ThreadCardSkeleton key={index} />
                  ))
                ) : threads.length > 0 ? (
                  // Thread cards
                  threads.slice(0, 5).map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} compact={true} />
                  ))
                ) : (
                  // Empty state
                  <div className="p-4">
                    <EmptyState
                      type="threads"
                      message="No active discussions"
                      actionLabel="Start Discussion"
                      onAction={() => console.log('Start thread')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-6 bg-gradient-to-br from-ph-orange to-ph-orange-dark rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Submit Your Product
              </h3>
              <p className="text-sm text-white/90 mb-4">
                Get your product analyzed by our AI agents and receive comprehensive feedback
              </p>
              <button className="w-full bg-white text-ph-orange font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                Submit Product
              </button>
            </div>

            {/* AI Agents Info */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Our AI Agents
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-600">Market Analyst</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">Tech Reviewer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-600">UX Expert</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-gray-600">Security Auditor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-gray-600">Business Strategist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;