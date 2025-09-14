import { X, Info } from 'lucide-react';

interface JustificationPopupProps {
  title: string;
  justification: string;
  onClose: () => void;
}

export default function JustificationPopup({ title, justification, onClose }: JustificationPopupProps) {
  const formatJustification = (text: string) => {
    // Split by newline and bullet points
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    return lines.map((line, index) => {
      // Check if it's a header (ends with colon and no dash)
      if (line.endsWith(':') && !line.startsWith('-')) {
        return (
          <div key={index} className="font-semibold text-posthog-text-primary mb-2 mt-4 first:mt-0">
            {line}
          </div>
        );
      }

      // Check if it's a bullet point
      if (line.startsWith('-')) {
        // Clean the line and format special content
        const cleanLine = line.substring(1).trim();

        // Highlight numbers and statistical values
        const formattedLine = cleanLine.replace(
          /([$\d,.]+ ?%?|R²=[\d.]+|r=[\d.]+|p[-\s]?value=[\d.]+|p=[\d.]+|CV=[\d.]+%?|std=[\d.$,]+|mean=[\d.$,]+|entropy=[\d.]+)/g,
          '<span class="text-posthog-accent font-mono">$1</span>'
        );

        // Highlight important keywords
        const finalLine = formattedLine.replace(
          /(High|Critical|significant|outliers?|anomal\w+)/gi,
          '<span class="text-posthog-warning">$1</span>'
        );

        return (
          <div key={index} className="flex items-start space-x-2 mb-2 ml-2">
            <span className="text-posthog-accent mt-0.5">•</span>
            <span
              className="text-sm text-posthog-text-secondary flex-1"
              dangerouslySetInnerHTML={{ __html: finalLine }}
            />
          </div>
        );
      }

      // Regular text
      return (
        <div key={index} className="text-sm text-posthog-text-secondary mb-2">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-posthog-bg-secondary rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-posthog-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5 text-posthog-accent" />
            <div>
              <h2 className="text-lg font-semibold text-posthog-text-primary">Chart Justification</h2>
              <p className="text-sm text-posthog-text-secondary mt-1">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-posthog-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-posthog-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-posthog-bg-primary rounded-lg p-5 border border-posthog-border">
            {formatJustification(justification)}
          </div>
        </div>

        <div className="p-4 border-t border-posthog-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-posthog-bg-tertiary text-posthog-text-primary rounded-lg hover:bg-posthog-bg-primary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}