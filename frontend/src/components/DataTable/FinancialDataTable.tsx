import { useState, useRef, useEffect } from 'react';
import { Search, Filter, Download, ChevronDown, Pause, Play } from 'lucide-react';
import DataRow from './DataRow';
import { clsx } from 'clsx';
import type { FinancialEvent, DatasetInfo } from '../../types';

interface FinancialDataTableProps {
  events: FinancialEvent[];
  datasetInfo: DatasetInfo | null;
}

export default function FinancialDataTable({ events, datasetInfo }: FinancialDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [highlightedEventIds, setHighlightedEventIds] = useState<Set<string>>(new Set());
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevEventCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Skip tracking on initial load
    if (isInitialLoadRef.current) {
      prevEventCountRef.current = events.length;
      isInitialLoadRef.current = false;
      return;
    }

    // Track new events only after initial load
    if (events.length > prevEventCountRef.current) {
      const newEventsCount = events.length - prevEventCountRef.current;
      const newEvents = events.slice(-newEventsCount);


      // Add new event IDs to highlighted set
      const newHighlightedIds = new Set(highlightedEventIds);
      newEvents.forEach(event => {
        newHighlightedIds.add(event.id);
      });
      setHighlightedEventIds(newHighlightedIds);

      // Smooth scroll after a short delay
      if (autoScroll && scrollContainerRef.current) {
        setTimeout(() => {
          scrollContainerRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 100);
      }

      // Remove from highlighted set after 2 seconds
      setTimeout(() => {
        setHighlightedEventIds(prev => {
          const updated = new Set(prev);
          newEvents.forEach(event => {
            updated.delete(event.id);
          });
          return updated;
        });
      }, 2000);
    }
    prevEventCountRef.current = events.length;
  }, [events, autoScroll]);

  const filteredEvents = events.filter((event: FinancialEvent) => {
    const matchesSearch = searchTerm === '' ||
      event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.transactionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.sourceAccount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.destAccount?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(event.transactionType);

    return matchesSearch && matchesType;
  });

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const exportData = () => {
    const csv = [
      ['Timestamp', 'Type', 'Amount', 'Source Account', 'Dest Account', 'Source Balance Before', 'Source Balance After', 'Status', 'Is Fraud', 'Transaction ID'],
      ...filteredEvents.map(e => [
        e.timestamp,
        e.transactionType,
        e.amount,
        e.sourceAccount,
        e.destAccount,
        e.sourceBalanceBefore,
        e.sourceBalanceAfter,
        e.status,
        e.isFraud,
        e.id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-data-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="h-full flex flex-col bg-posthog-bg-secondary rounded-lg border border-posthog-border">
      <div className="p-4 border-b border-posthog-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-posthog-text-primary">
            Fraud Transaction Events
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                autoScroll
                  ? 'bg-posthog-accent text-white'
                  : 'bg-posthog-bg-tertiary text-posthog-text-secondary hover:text-posthog-text-primary'
              )}
              title={autoScroll ? 'Pause auto-scroll' : 'Resume auto-scroll'}
            >
              {autoScroll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={exportData}
              className="p-2 bg-posthog-bg-tertiary rounded-lg text-posthog-text-secondary hover:text-posthog-text-primary transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-posthog-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search accounts or transaction IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-posthog-bg-primary border border-posthog-border rounded-lg pl-10 pr-4 py-2 text-sm text-posthog-text-primary placeholder-posthog-text-secondary focus:outline-none focus:border-posthog-accent transition-colors"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-posthog-bg-tertiary rounded-lg text-sm text-posthog-text-secondary hover:text-posthog-text-primary transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className={clsx('w-4 h-4 transition-transform', filterOpen && 'rotate-180')} />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-posthog-bg-secondary border border-posthog-border rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs text-posthog-text-secondary mb-2">Transaction Types</div>
                  {['PAYMENT', 'TRANSFER', 'CASH_OUT', 'CASH_IN', 'DEBIT'].map(type => (
                    <label
                      key={type}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-posthog-bg-tertiary rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                        className="rounded border-posthog-border"
                      />
                      <span className="text-sm text-posthog-text-primary">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-posthog-text-secondary">
          <span>Showing {filteredEvents.length} of {events.length} events</span>
          {datasetInfo && (
            <div className="flex items-center space-x-4">
              <span>Dataset: {datasetInfo.percentageProcessed?.toFixed(1)}% processed</span>
              <span className="text-posthog-accent">Charts: {datasetInfo.currentChartDataSize || 0}/{datasetInfo.chartWindowSize || 1000}</span>
              <span className="text-posthog-error">Fraud: {datasetInfo.fraudCount || 0}</span>
              <span className="text-posthog-warning">Flagged: {datasetInfo.flaggedCount || 0}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden" ref={tableContainerRef}>
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-auto h-full scrollbar-thin"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          <table className="w-full">
            <thead className="bg-posthog-bg-primary border-b border-posthog-border sticky top-0 z-10">
              <tr className="table-row">
                <th className="px-3 py-3 text-left text-xs font-medium text-posthog-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Time
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-posthog-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-posthog-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Amount
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-posthog-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Source Acc
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-posthog-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Dest Acc
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-posthog-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Balance Before
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-posthog-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Balance After
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-posthog-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-posthog-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Fraud
                </th>
              </tr>
            </thead>
            <tbody
              ref={tableBodyRef}
              className="bg-posthog-bg-secondary"
            >
              {/* Render all rows without spacers */}
              {filteredEvents.slice(-100).reverse().map((event) => {
                const isHighlighted = highlightedEventIds.has(event.id);

                return (
                  <DataRow
                    key={event.id}
                    event={event}
                    isHighlighted={isHighlighted}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}