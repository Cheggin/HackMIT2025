import { useState, useMemo } from 'react';
import type { ChartData } from '../../../types';

interface CohortHeatmapProps {
  data: ChartData[];
}

interface CohortCell {
  cohort: string;
  period: number;
  value: number;
  percentage: number;
  count: number;
  label: string;
}

interface CohortRow {
  cohort: string;
  totalUsers: number;
  cells: CohortCell[];
}

// PostHog color scheme for heatmap
const getHeatmapColor = (percentage: number): string => {
  // Scale from light to dark PostHog orange
  if (percentage === 0) return '#1C1C1C'; // Empty cell
  if (percentage < 10) return '#3D2929';
  if (percentage < 20) return '#4D3229';
  if (percentage < 30) return '#5D3B29';
  if (percentage < 40) return '#6D4429';
  if (percentage < 50) return '#8D5529';
  if (percentage < 60) return '#AD6629';
  if (percentage < 70) return '#CD7729';
  if (percentage < 80) return '#ED8829';
  if (percentage < 90) return '#F59E0B';
  return '#F54E00'; // PostHog accent orange for highest retention
};

export default function CohortHeatmap({ data }: CohortHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ cohort: string; period: number } | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'retention' | 'volume' | 'fraud'>('retention');

  const cohortData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by transaction count cohorts
    // Each cohort is a group of N transactions
    const COHORT_SIZE = 5; // 5 transactions per cohort
    const MAX_COHORTS = 10; // Show last 10 cohorts
    const PERIODS = 12; // Track 12 periods (each period = next N transactions)

    const cohortRows: CohortRow[] = [];

    // Calculate total number of cohorts we can create
    const totalCohorts = Math.floor(data.length / COHORT_SIZE);
    const startCohort = Math.max(0, totalCohorts - MAX_COHORTS);

    // Create cohorts based on transaction groups
    for (let cohortIndex = startCohort; cohortIndex < totalCohorts && cohortIndex < startCohort + MAX_COHORTS; cohortIndex++) {
      const cohortStartIdx = cohortIndex * COHORT_SIZE;
      const cohortEndIdx = cohortStartIdx + COHORT_SIZE;

      // Get the base cohort transactions (period 0)
      const baseCohortData = data.slice(cohortStartIdx, cohortEndIdx);
      if (baseCohortData.length === 0) continue;

      // Calculate base metrics for this cohort
      const baseCount = baseCohortData.reduce((sum, item) => sum + (item.volume || item.count || 1), 0);
      const baseValue = baseCohortData.reduce((sum, item) => sum + (item.amount || item.value || 0), 0);
      const baseFraudCount = baseCohortData.reduce((sum, item) => sum + (item.fraudCount || 0), 0);

      const cells: CohortCell[] = [];

      // Calculate metrics for each period
      for (let period = 0; period < PERIODS; period++) {
        const periodStartIdx = cohortStartIdx + (period * COHORT_SIZE);
        const periodEndIdx = periodStartIdx + COHORT_SIZE;

        // Get transactions for this period
        const periodData = data.slice(periodStartIdx, periodEndIdx);

        if (periodData.length === 0) {
          // No data for this period
          cells.push({
            cohort: `Txn ${cohortStartIdx + 1}-${cohortEndIdx}`,
            period,
            value: 0,
            percentage: 0,
            count: 0,
            label: period === 0 ? 'Base' : `+${period * COHORT_SIZE}`
          });
        } else {
          // Calculate metrics for this period
          const periodCount = periodData.reduce((sum, item) => sum + (item.volume || item.count || 1), 0);
          const periodValue = periodData.reduce((sum, item) => sum + (item.amount || item.value || 0), 0);
          const periodFraudCount = periodData.reduce((sum, item) => sum + (item.fraudCount || 0), 0);

          let value = 0;
          let percentage = 0;

          switch (selectedMetric) {
            case 'retention':
              // For transaction cohorts, retention = % of transactions still active
              value = periodCount;
              percentage = baseCount > 0 ? (periodCount / baseCount) * 100 : 0;
              break;
            case 'volume':
              value = periodValue;
              // Compare to base period volume
              percentage = baseValue > 0 ? Math.min((periodValue / baseValue) * 100, 100) : 0;
              break;
            case 'fraud':
              value = periodFraudCount;
              percentage = periodCount > 0 ? (periodFraudCount / periodCount) * 100 : 0;
              break;
          }

          cells.push({
            cohort: `Txn ${cohortStartIdx + 1}-${cohortEndIdx}`,
            period,
            value,
            percentage,
            count: periodCount,
            label: period === 0 ? 'Base' : `+${period * COHORT_SIZE}`
          });
        }
      }

      cohortRows.push({
        cohort: `Txn ${cohortStartIdx + 1}-${cohortEndIdx}`,
        totalUsers: baseCount,
        cells
      });
    }

    return cohortRows;
  }, [data, selectedMetric]);

  if (cohortData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-posthog-bg-primary">
        <p className="text-posthog-text-secondary">Collecting transaction cohort data...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-posthog-bg-primary">
      {/* Metric Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-posthog-text-secondary whitespace-nowrap">Metric:</span>
          <div className="flex bg-posthog-bg-secondary rounded p-0.5">
            {(['retention', 'volume', 'fraud'] as const).map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-2 py-0.5 text-[10px] rounded transition-colors whitespace-nowrap ${
                  selectedMetric === metric
                    ? 'bg-posthog-accent text-white'
                    : 'text-posthog-text-secondary hover:text-posthog-text-primary'
                }`}
              >
                {metric === 'retention' && 'Activity'}
                {metric === 'volume' && 'Volume'}
                {metric === 'fraud' && 'Fraud'}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-posthog-text-secondary">Scale:</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#1C1C1C] border border-posthog-border"></div>
            <span className="text-[10px] text-posthog-text-secondary">0%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#8D5529]"></div>
            <span className="text-[10px] text-posthog-text-secondary">50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#F54E00]"></div>
            <span className="text-[10px] text-posthog-text-secondary">100%</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex-1 overflow-auto rounded border border-posthog-border">
        <table className="w-full">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 bg-posthog-bg-secondary px-1 py-1 text-left text-[10px] font-medium text-posthog-text-secondary border-b border-r border-posthog-border whitespace-nowrap min-w-[70px]">
                Cohort
              </th>
              <th className="sticky left-[70px] z-30 bg-posthog-bg-secondary px-1 py-1 text-center text-[10px] font-medium text-posthog-text-secondary border-b border-r border-posthog-border min-w-[40px]">
                Count
              </th>
              {Array.from({ length: 12 }, (_, i) => (
                <th
                  key={i}
                  className="bg-posthog-bg-secondary px-1 py-1 text-center text-[10px] font-medium text-posthog-text-secondary border-b border-r border-posthog-border min-w-[45px]"
                >
                  {i === 0 ? 'Base' : `+${i * 5}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohortData.map((row, rowIndex) => (
              <tr key={row.cohort} className="group">
                <td className="sticky left-0 z-10 bg-posthog-bg-secondary px-1 py-1 text-[10px] text-posthog-text-primary font-medium border-r border-b border-posthog-border group-hover:bg-posthog-bg-tertiary whitespace-nowrap min-w-[70px]">
                  {row.cohort}
                </td>
                <td className="sticky left-[70px] z-10 bg-posthog-bg-secondary px-1 py-1 text-center text-[10px] text-posthog-text-primary border-r border-b border-posthog-border group-hover:bg-posthog-bg-tertiary min-w-[40px]">
                  {row.totalUsers}
                </td>
                {row.cells.map((cell, cellIndex) => {
                  const isHovered = hoveredCell?.cohort === row.cohort && hoveredCell?.period === cell.period;
                  const color = getHeatmapColor(cell.percentage);
                  const shouldAnimate = cell.percentage > 0;

                  return (
                    <td
                      key={cellIndex}
                      className="relative border-b border-r border-posthog-border cursor-pointer transition-all min-w-[45px]"
                      style={{
                        backgroundColor: color,
                        opacity: shouldAnimate ? 1 : 0.3,
                        animation: shouldAnimate ? `fadeIn 0.5s ease-in-out ${(rowIndex * 0.05 + cellIndex * 0.02)}s both` : 'none'
                      }}
                      onMouseEnter={() => setHoveredCell({ cohort: row.cohort, period: cell.period })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className="px-1 py-1 text-center">
                        <div className={`text-[10px] font-medium ${cell.percentage > 50 ? 'text-white' : 'text-posthog-text-secondary'}`}>
                          {selectedMetric === 'volume'
                            ? cell.value >= 1000 ? `${(cell.value / 1000).toFixed(0)}k` : `${cell.value.toFixed(0)}`
                            : `${cell.percentage.toFixed(0)}%`
                          }
                        </div>
                        {cell.count > 0 && selectedMetric === 'retention' && (
                          <div className={`text-[9px] leading-tight ${cell.percentage > 50 ? 'text-white/50' : 'text-posthog-text-secondary/50'}`}>
                            ({cell.count})
                          </div>
                        )}
                      </div>

                      {/* Hover tooltip */}
                      {isHovered && (
                        <div className="absolute z-40 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-posthog-bg-secondary border border-posthog-border rounded shadow-lg whitespace-nowrap pointer-events-none">
                          <div className="text-[10px] text-posthog-text-primary font-medium">
                            {row.cohort} → {cell.label} txns
                          </div>
                          <div className="text-[9px] text-posthog-text-secondary mt-0.5">
                            {selectedMetric === 'retention' && `Activity: ${cell.percentage.toFixed(1)}% (${cell.count}/${row.totalUsers})`}
                            {selectedMetric === 'volume' && `Volume: $${cell.value.toFixed(2)}`}
                            {selectedMetric === 'fraud' && `Fraud Rate: ${cell.percentage.toFixed(1)}%`}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analysis Summary */}
      <div className="mt-2 px-2">
        <div className="p-1.5 bg-posthog-bg-secondary rounded border border-posthog-border">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="text-[10px] text-posthog-text-secondary">
              <span className="text-posthog-text-primary font-medium">Analysis:</span>
              {' '}{cohortData.length} cohorts (5 txns each)
            </div>
            <div className="text-[10px] text-posthog-accent">
              {selectedMetric === 'retention' && 'Transaction activity by cohort'}
              {selectedMetric === 'volume' && 'Volume trends across cohorts'}
              {selectedMetric === 'fraud' && 'Fraud patterns by transaction group'}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}