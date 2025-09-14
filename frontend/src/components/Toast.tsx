import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Anomaly } from '../types';

interface ToastProps {
  anomaly: Anomaly | null;
  onClose: () => void;
}

export default function Toast({ anomaly, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!anomaly) return null;

  const severityColors: Record<string, string> = {
    high: 'border-posthog-error bg-posthog-error/10',
    medium: 'border-posthog-warning bg-posthog-warning/10',
    low: 'border-yellow-500 bg-yellow-500/10'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, x: 50 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className={`fixed top-20 right-4 z-50 max-w-sm rounded-lg border p-4 ${
          severityColors[anomaly.severity] || severityColors.medium
        }`}
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-posthog-accent flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-posthog-text-primary">
              Anomaly Detected
            </h4>
            <p className="text-xs text-posthog-text-secondary mt-1">
              {anomaly.message}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                anomaly.severity === 'high'
                  ? 'bg-posthog-error text-white'
                  : anomaly.severity === 'medium'
                  ? 'bg-posthog-warning text-white'
                  : 'bg-yellow-500 text-white'
              }`}>
                {anomaly.severity}
              </span>
              <span className="text-xs text-posthog-text-secondary">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-posthog-bg-tertiary rounded transition-colors"
          >
            <X className="w-4 h-4 text-posthog-text-secondary" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}