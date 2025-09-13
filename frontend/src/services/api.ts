import type { Product, Thread, AIAnalysis } from '../stores/useStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

// Product APIs
export const productService = {
  // Fetch all products
  async fetchProducts(): Promise<Product[]> {
    try {
      return await apiCall<Product[]>('/api/products');
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return mock data for development
      return mockProducts;
    }
  },

  // Fetch single product by ID
  async fetchProductById(id: string): Promise<Product> {
    try {
      return await apiCall<Product>(`/api/products/${id}`);
    } catch (error) {
      console.error('Error fetching product:', error);
      // Return mock data for development
      const product = mockProducts.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    }
  },

  // Fetch AI analysis for a product
  async fetchAIAnalysis(productId: string): Promise<AIAnalysis[]> {
    try {
      return await apiCall<AIAnalysis[]>(`/api/products/${productId}/analysis`);
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      // Return mock data for development
      return mockAIAnalyses;
    }
  },

  // Submit a new product
  async submitProduct(product: Omit<Product, 'id' | 'aiScore' | 'aiAnalyses' | 'commentCount' | 'submittedAt'>): Promise<Product> {
    try {
      return await apiCall<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
    } catch (error) {
      console.error('Error submitting product:', error);
      throw error;
    }
  },
};

// Thread APIs
export const threadService = {
  // Fetch all threads
  async fetchThreads(): Promise<Thread[]> {
    try {
      return await apiCall<Thread[]>('/api/threads');
    } catch (error) {
      console.error('Error fetching threads:', error);
      // Return mock data for development
      return mockThreads;
    }
  },

  // Fetch single thread by ID
  async fetchThreadById(id: string): Promise<Thread> {
    try {
      return await apiCall<Thread>(`/api/threads/${id}`);
    } catch (error) {
      console.error('Error fetching thread:', error);
      throw error;
    }
  },
};

// Mock data for development
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'AIFlow Designer',
    tagline: 'Build AI workflows with a visual interface',
    description: 'A powerful no-code platform for creating complex AI workflows',
    categories: ['AI', 'No-Code', 'Developer Tools'],
    aiScore: 8.4,
    aiAnalyses: [],
    commentCount: 42,
    rank: 1,
    submittedAt: new Date().toISOString(),
    submittedBy: 'john_doe',
    logo: 'https://via.placeholder.com/64',
    website: 'https://example.com',
  },
  {
    id: '2',
    name: 'DataSync Pro',
    tagline: 'Real-time data synchronization across all your apps',
    description: 'Keep your data in sync across multiple platforms seamlessly',
    categories: ['Data', 'Integration', 'SaaS'],
    aiScore: 7.9,
    aiAnalyses: [],
    commentCount: 28,
    rank: 2,
    submittedAt: new Date().toISOString(),
    submittedBy: 'jane_smith',
    logo: 'https://via.placeholder.com/64',
    website: 'https://example.com',
  },
  {
    id: '3',
    name: 'CodeCompanion',
    tagline: 'Your AI-powered pair programming partner',
    description: 'An intelligent coding assistant that understands your codebase',
    categories: ['AI', 'Developer Tools', 'Productivity'],
    aiScore: 9.1,
    aiAnalyses: [],
    commentCount: 156,
    rank: 3,
    submittedAt: new Date().toISOString(),
    submittedBy: 'dev_master',
    logo: 'https://via.placeholder.com/64',
    website: 'https://example.com',
  },
];

const mockAIAnalyses: AIAnalysis[] = [
  {
    agentId: 'market-analyst',
    score: 8.5,
    summary: 'Strong market potential with clear value proposition',
    pros: ['Solves a real problem', 'Good timing for market entry', 'Scalable business model'],
    cons: ['Competitive market', 'High customer acquisition cost'],
    timestamp: new Date().toISOString(),
  },
  {
    agentId: 'tech-reviewer',
    score: 7.8,
    summary: 'Solid technical implementation with room for improvement',
    pros: ['Modern tech stack', 'Good performance metrics', 'Well-documented API'],
    cons: ['Limited integrations', 'Could improve mobile experience'],
    timestamp: new Date().toISOString(),
  },
  {
    agentId: 'ux-expert',
    score: 8.9,
    summary: 'Excellent user experience and intuitive design',
    pros: ['Clean interface', 'Easy onboarding', 'Responsive design'],
    cons: ['Some advanced features hidden', 'Could use more customization options'],
    timestamp: new Date().toISOString(),
  },
  {
    agentId: 'security-auditor',
    score: 9.2,
    summary: 'Strong security practices and data protection',
    pros: ['End-to-end encryption', 'Regular security audits', 'GDPR compliant'],
    cons: ['Could add 2FA options', 'Limited audit logs for users'],
    timestamp: new Date().toISOString(),
  },
  {
    agentId: 'business-strategist',
    score: 7.5,
    summary: 'Good business model with growth potential',
    pros: ['Clear monetization strategy', 'Strong team', 'Good funding runway'],
    cons: ['Needs better marketing', 'Partnership opportunities unexplored'],
    timestamp: new Date().toISOString(),
  },
];

const mockThreads: Thread[] = [
  {
    id: '1',
    title: 'How to choose the right AI model for your startup?',
    author: {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://via.placeholder.com/32',
    },
    replies: 23,
    views: 456,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    category: 'AI',
  },
  {
    id: '2',
    title: 'Best practices for API monetization in 2024',
    author: {
      id: '2',
      name: 'Mike Johnson',
      avatar: 'https://via.placeholder.com/32',
    },
    replies: 45,
    views: 892,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: 'Business',
  },
  {
    id: '3',
    title: 'The future of no-code platforms',
    author: {
      id: '3',
      name: 'Alex Rivera',
      avatar: 'https://via.placeholder.com/32',
    },
    replies: 67,
    views: 1243,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: 'No-Code',
  },
];