import { create } from 'zustand';

export interface AIAgent {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
}

export interface AIAnalysis {
  agentId: string;
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  logo?: string;
  website?: string;
  categories: string[];
  aiScore: number;
  aiAnalyses: AIAnalysis[];
  commentCount: number;
  rank?: number;
  submittedBy?: string;
  submittedAt: string;
}

export interface Thread {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  replies: number;
  views: number;
  lastActivity: string;
  category: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AppState {
  // Products
  products: Product[];
  selectedProduct: Product | null;
  productsLoading: boolean;
  productsError: string | null;
  
  // Threads
  threads: Thread[];
  threadsLoading: boolean;
  threadsError: string | null;
  
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  
  // UI
  searchQuery: string;
  isSearchOpen: boolean;
  welcomeBannerDismissed: boolean;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setProductsLoading: (loading: boolean) => void;
  setProductsError: (error: string | null) => void;
  
  setThreads: (threads: Thread[]) => void;
  setThreadsLoading: (loading: boolean) => void;
  setThreadsError: (error: string | null) => void;
  
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  dismissWelcomeBanner: () => void;
  
  // Computed
  getProductById: (id: string) => Product | undefined;
  getFilteredProducts: () => Product[];
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  productsLoading: false,
  productsError: null,
  
  threads: [],
  threadsLoading: false,
  threadsError: null,
  
  user: null,
  isAuthenticated: false,
  authLoading: false,
  
  searchQuery: '',
  isSearchOpen: false,
  welcomeBannerDismissed: false,
  
  // Actions
  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setProductsLoading: (loading) => set({ productsLoading: loading }),
  setProductsError: (error) => set({ productsError: error }),
  
  setThreads: (threads) => set({ threads }),
  setThreadsLoading: (loading) => set({ threadsLoading: loading }),
  setThreadsError: (error) => set({ threadsError: error }),
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  dismissWelcomeBanner: () => set({ welcomeBannerDismissed: true }),
  
  // Computed
  getProductById: (id) => {
    return get().products.find(p => p.id === id);
  },
  
  getFilteredProducts: () => {
    const { products, searchQuery } = get();
    if (!searchQuery) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.tagline.toLowerCase().includes(query) ||
      p.categories.some(c => c.toLowerCase().includes(query))
    );
  }
}));