import 'react';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

export default function ConstitutionToggle({ enabled, onToggle }) {
  return (
    <div className="bg-posthog-bg-secondary border border-posthog-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-posthog-accent" />
          <h3 className="text-sm font-semibold text-posthog-text-primary">
            AI Constitution Mode
          </h3>
        </div>
        <button
          onClick={onToggle}
          className={clsx(
            'relative w-12 h-6 rounded-full transition-colors',
            enabled ? 'bg-posthog-accent' : 'bg-posthog-bg-tertiary'
          )}
        >
          <div
            className={clsx(
              'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
              enabled ? 'translate-x-6' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>

      <p className="text-xs text-posthog-text-secondary mb-3">
        {enabled
          ? 'AI decision-making rules and justifications are visible'
          : 'Enable to see why AI chooses specific visualizations'}
      </p>

      <div className="flex items-center space-x-2 text-xs">
        {enabled ? (
          <>
            <Eye className="w-4 h-4 text-posthog-success" />
            <span className="text-posthog-success">Transparency enabled</span>
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4 text-posthog-text-secondary" />
            <span className="text-posthog-text-secondary">Standard mode</span>
          </>
        )}
      </div>
    </div>
  );
}