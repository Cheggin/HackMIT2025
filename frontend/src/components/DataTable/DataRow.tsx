import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { FinancialEvent } from '../../types';

interface DataRowProps {
  event: FinancialEvent;
  isNew?: boolean;
  animationDelay?: number;
}

export default function DataRow({ event, isNew = false, animationDelay = 0 }: DataRowProps) {
  const [isVisible, setIsVisible] = useState(!isNew);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isNew) {
      // Wait for the animation delay, then show the row
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
        setIsHighlighted(true);

        // Stop the entry animation after it completes
        setTimeout(() => {
          setIsAnimating(false);
        }, 400);
      }, animationDelay);

      // Keep the highlight for 1.5 seconds after the row appears
      // Completes well before next batch
      const highlightTimer = setTimeout(() => {
        setIsHighlighted(false);
      }, animationDelay + 1500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(highlightTimer);
      };
    } else {
      // Not new - ensure clean state
      setIsVisible(true);
      setIsAnimating(false);
      setIsHighlighted(false);
    }
  }, [isNew, animationDelay, event.id]);

  const statusColors: Record<string, string> = {
    success: 'text-posthog-success',
    pending: 'text-posthog-warning',
    failed: 'text-posthog-error'
  };

  const statusBgColors: Record<string, string> = {
    success: 'bg-posthog-success/10',
    pending: 'bg-posthog-warning/10',
    failed: 'bg-posthog-error/10'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: amount < 100 ? 2 : 0
    }).format(amount);
  };

  const truncateAccount = (account: string | undefined) => {
    if (!account) return '-';
    if (account.length > 12) {
      return account.substring(0, 6) + '...' + account.substring(account.length - 4);
    }
    return account;
  };

  // Don't render at all until visible to prevent any flashing
  if (!isVisible) {
    return null;
  }

  return (
    <tr
      className={clsx(
        'table-row border-b border-posthog-border',
        // Base transition for all state changes - smooth
        'transition-all duration-300 ease-out',
        // Entry animation
        isAnimating && 'animate-smoothSlideIn',
        // Highlight state with long fade transition
        isHighlighted ? [
          'bg-gradient-to-r from-posthog-accent/20 via-posthog-accent/10 to-transparent',
          'border-l-4 border-l-posthog-accent',
          'shadow-[inset_0_0_30px_rgba(245,78,0,0.1)]'
        ] : [
          'border-l-4 border-l-transparent',
          'hover:bg-posthog-bg-tertiary/50'
        ]
      )}
      style={{
        // Fast transition for snappy feel
        transition: isHighlighted
          ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' // Quick fade out
      }}
    >
      <td className="px-3 py-2 text-xs text-posthog-text-secondary whitespace-nowrap">
        {format(new Date(event.timestamp), 'HH:mm:ss')}
      </td>
      <td className="px-3 py-2 text-xs text-posthog-text-primary whitespace-nowrap">
        {event.transactionType}
      </td>
      <td className="px-3 py-2 text-sm text-posthog-text-primary font-medium whitespace-nowrap">
        {formatCurrency(event.amount)}
      </td>
      <td className="px-3 py-2 text-xs text-posthog-text-secondary font-mono whitespace-nowrap" title={event.sourceAccount}>
        {truncateAccount(event.sourceAccount)}
      </td>
      <td className="px-3 py-2 text-xs text-posthog-text-secondary font-mono whitespace-nowrap" title={event.destAccount}>
        {truncateAccount(event.destAccount)}
      </td>
      <td className="px-3 py-2 text-xs text-posthog-text-secondary whitespace-nowrap">
        {formatCurrency(event.sourceBalanceBefore || 0)}
      </td>
      <td className="px-3 py-2 text-xs text-posthog-text-secondary whitespace-nowrap">
        {formatCurrency(event.sourceBalanceAfter || 0)}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <span
          className={clsx(
            'px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center space-x-1',
            statusColors[event.status],
            statusBgColors[event.status]
          )}
        >
          {event.status === 'success' && <CheckCircle className="w-3 h-3" />}
          {event.status === 'pending' && <AlertTriangle className="w-3 h-3" />}
          {event.status === 'failed' && <XCircle className="w-3 h-3" />}
          <span>{event.status}</span>
        </span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        {event.isFraud ? (
          <span className="text-posthog-error text-xs font-bold">FRAUD</span>
        ) : event.isFlaggedFraud ? (
          <span className="text-posthog-warning text-xs">Flagged</span>
        ) : (
          <span className="text-posthog-text-secondary text-xs">Clean</span>
        )}
      </td>
    </tr>
  );
}