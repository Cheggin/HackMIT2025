import { useState } from 'react';
import { X, Zap, Clock, Bell, Download } from 'lucide-react';
import { clsx } from 'clsx';

export default function SettingsPanel({ isOpen, onClose, updateFrequency, onUpdateFrequency }) {
  const [frequency, setFrequency] = useState(updateFrequency / 1000);
  const [notifications, setNotifications] = useState(true);
  const [autoExport, setAutoExport] = useState(false);

  const handleFrequencyChange = (value) => {
    setFrequency(value);
    onUpdateFrequency(value * 1000);
  };

  const handleGenerateReport = () => {
    console.log('Generating report via MCP email...');
    // This would trigger the MCP email integration
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-posthog-bg-secondary border border-posthog-border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-posthog-border">
          <h2 className="text-lg font-semibold text-posthog-text-primary">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-posthog-bg-tertiary rounded transition-colors"
          >
            <X className="w-5 h-5 text-posthog-text-secondary" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <label className="flex items-center space-x-2 text-sm text-posthog-text-primary mb-2">
              <Clock className="w-4 h-4" />
              <span>Update Frequency</span>
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={frequency}
                onChange={(e) => handleFrequencyChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-posthog-text-secondary">
                <span>Fast (0.5s)</span>
                <span className="text-posthog-accent font-medium">{frequency}s</span>
                <span>Slow (10s)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-posthog-text-primary" />
                <span className="text-sm text-posthog-text-primary">Anomaly Notifications</span>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={clsx(
                  'relative w-12 h-6 rounded-full transition-colors',
                  notifications ? 'bg-posthog-accent' : 'bg-posthog-bg-tertiary'
                )}
              >
                <div
                  className={clsx(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                    notifications ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </button>
            </label>
            <p className="text-xs text-posthog-text-secondary mt-1">
              Show toast notifications when anomalies are detected
            </p>
          </div>

          <div>
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-posthog-text-primary" />
                <span className="text-sm text-posthog-text-primary">Auto Export</span>
              </div>
              <button
                onClick={() => setAutoExport(!autoExport)}
                className={clsx(
                  'relative w-12 h-6 rounded-full transition-colors',
                  autoExport ? 'bg-posthog-accent' : 'bg-posthog-bg-tertiary'
                )}
              >
                <div
                  className={clsx(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                    autoExport ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </button>
            </label>
            <p className="text-xs text-posthog-text-secondary mt-1">
              Automatically export data every hour
            </p>
          </div>

          <div>
            <button
              onClick={handleGenerateReport}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-posthog-accent hover:bg-posthog-accent-hover text-white rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Generate AI Report</span>
            </button>
            <p className="text-xs text-posthog-text-secondary mt-2 text-center">
              Triggers MCP email with insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}