import 'react';
import {
  Activity,
  Bell,
  ChevronDown,
  Search,
  Settings,
  TrendingUp,
  User
} from 'lucide-react';

interface TopBarProps {
  onSettingsClick: () => void;
}

export default function TopBar({ onSettingsClick }: TopBarProps) {
  return (
    <div className="h-16 bg-posthog-bg-secondary border-b border-posthog-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-posthog-accent to-orange-600 rounded flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-posthog-text-primary font-semibold text-lg">
            FinanceHog AI
          </span>
        </div>

        <nav className="flex items-center space-x-6">
          <a href="#" className="text-posthog-text-primary hover:text-posthog-accent transition-colors flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="text-posthog-text-secondary hover:text-posthog-text-primary transition-colors">
            Analytics
          </a>
          <a href="#" className="text-posthog-text-secondary hover:text-posthog-text-primary transition-colors">
            Reports
          </a>
          <a href="#" className="text-posthog-text-secondary hover:text-posthog-text-primary transition-colors">
            Insights
          </a>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-4 h-4 text-posthog-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-64 bg-posthog-bg-primary border border-posthog-border rounded-lg pl-10 pr-4 py-2 text-sm text-posthog-text-primary placeholder-posthog-text-secondary focus:outline-none focus:border-posthog-accent transition-colors"
          />
        </div>


        <button className="relative p-2 hover:bg-posthog-bg-tertiary rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-posthog-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-posthog-accent rounded-full"></span>
        </button>

        <button
          onClick={onSettingsClick}
          className="p-2 hover:bg-posthog-bg-tertiary rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-posthog-text-secondary" />
        </button>

        <div className="flex items-center space-x-2 px-3 py-1.5 hover:bg-posthog-bg-tertiary rounded-lg cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-posthog-bg-tertiary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-posthog-text-secondary" />
          </div>
          <ChevronDown className="w-4 h-4 text-posthog-text-secondary" />
        </div>
      </div>
    </div>
  );
}