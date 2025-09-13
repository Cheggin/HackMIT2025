import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  FileText,
  Home,
  Layers,
  PieChart,
  Settings,
  TrendingUp,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';

interface SideBarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function SideBar({ collapsed, onToggle }: SideBarProps) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: CreditCard, label: 'Transactions', active: false },
    { icon: PieChart, label: 'Reports', active: false },
    { icon: TrendingUp, label: 'Insights', active: false },
    { icon: Database, label: 'Data Sources', active: false },
    { icon: Layers, label: 'Integrations', active: false },
    { icon: FileText, label: 'Documentation', active: false },
  ];

  const bottomItems = [
    { icon: Zap, label: 'AI Settings', active: false },
    { icon: Settings, label: 'Preferences', active: false },
  ];

  return (
    <div
      className={clsx(
        'bg-posthog-bg-secondary border-r border-posthog-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex-1 py-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={clsx(
                'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all',
                item.active
                  ? 'bg-posthog-bg-tertiary text-posthog-text-primary'
                  : 'text-posthog-text-secondary hover:bg-posthog-bg-tertiary hover:text-posthog-text-primary'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-posthog-border py-4">
        <div className="space-y-1 px-3">
          {bottomItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-posthog-text-secondary hover:bg-posthog-bg-tertiary hover:text-posthog-text-primary transition-all"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onToggle}
        className="border-t border-posthog-border p-4 flex items-center justify-center text-posthog-text-secondary hover:text-posthog-text-primary transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}