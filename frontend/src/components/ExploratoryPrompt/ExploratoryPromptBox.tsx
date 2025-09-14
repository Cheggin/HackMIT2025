import { useState, type KeyboardEvent } from 'react';

interface ExploratoryPromptBoxProps {
  onSubmit?: (prompt: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export default function ExploratoryPromptBox({
  onSubmit,
  placeholder = 'Try: "Show monthly net payouts by location" or "Find anomalies in employer tax spend"',
  isLoading = false
}: ExploratoryPromptBoxProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      // Call the callback if provided
      if (onSubmit) {
        onSubmit(prompt);
      }

      // Clear the input
      setPrompt('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full">
      <div className="bg-posthog-bg-elevated rounded-lg border border-posthog-border">
        {/* Input Area - Compact */}
        <div className="p-3">
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                autoComplete="off"
                className="flex-1 px-4 py-2 bg-posthog-bg-default border border-posthog-border rounded-lg
                         text-white placeholder-posthog-text-tertiary
                         focus:outline-none focus:ring-2 focus:ring-posthog-brand focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-sm"
                style={{ backgroundColor: '#1C1C1C', color: '#FFFFFF' }}
              />
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
                className="px-4 py-2 bg-posthog-brand text-white rounded-lg font-medium text-sm
                         hover:bg-posthog-brand-hover transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}