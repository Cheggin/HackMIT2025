import 'react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { FinancialEvent } from '../../types';

interface DataRowProps {
  event: FinancialEvent;
  isNew?: boolean;
}

export default function DataRow({ event, isNew = false }: DataRowProps) {
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

  return (
    <tr
      className={clsx(
        'border-b border-posthog-border hover:bg-posthog-bg-tertiary/50 transition-colors',
        isNew && 'animate-pulse bg-posthog-accent/5'
      )}
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