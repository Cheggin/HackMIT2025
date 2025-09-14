# FinHog <img src="frontend/public/favicon.svg" alt="FinanceHog Logo" width="32" height="32" style="vertical-align: middle; margin-left: 8px;">

FinHog is an **agent-driven analytics platform** that automatically **generates** and **adapts** visualizations to help users understand **thousands** of rows of financial transaction data without manual configuration. Unlike traditional dashboards that require pre-defined queries and static charts, FinHog uses an **AI agent** that continuously analyzes incoming data streams, identifies statistically significant patterns, and creates the most appropriate visualizations in real-time.

## Technical Implementation

- **Real-time Data Pipeline:** Built a streaming ingestion system using Supabase PostgreSQL with pagination and time-based filtering to handle continuous transaction events from multiple financial institutions
- **AI-Powered Visualizations:** Integrated Anthropic's Claude API to transform natural language queries into optimized SQL, with automatic chart type selection across 8 visualization types (line, bar, pie, scatter, 3D network, Sankey, funnel, cohort heatmaps)
- **Microservices Architecture:** FastAPI backend with Python 3.11, deployed using Vercel (frontend) and localtunnel/ngrok for API tunneling, with full CORS configuration for production
- **Advanced Features:** PNG export functionality using html-to-image, dynamic SQL query generation with CTE wrapping for time filtering, real-time chart updates with WebSocket-ready architecture, and justification tooltips for AI-recommended visualizations


## Stack

- **Frontend:** React + TypeScript (Vite), Recharts/D3.js for 2D visualizations, React Three Fiber for 3D graphs, Tailwind CSS with PostHog-inspired design system, html-to-image for chart exports
- **Backend:** FastAPI (Python 3.11), Anthropic Claude API for natural language to SQL, localtunnel/ngrok for public API exposure, CORS-enabled for production deployment
- **Database:** Supabase for real-time event streaming, custom RPC functions for dynamic SQL execution, paginated data fetching with time-based cursors

