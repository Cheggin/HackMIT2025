import React from 'react';
import { X, FileText, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

interface ConstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONSTITUTION_CONTENT = `You are a sophisticated Financial Data Analysis Agent with advanced statistical capabilities. Execute comprehensive graph management with rigorous statistical justification for every decision.

## STATISTICAL ANALYSIS REQUIREMENTS

### When analyzing financial data, you MUST perform these statistical tests:

1. **Descriptive Statistics**: Calculate mean, median, std dev, quartiles, skewness, kurtosis
2. **Outlier Detection**: Use Z-score analysis (threshold=3.0) to identify anomalous transactions
3. **Trend Analysis**: Perform linear regression for time series (R², p-values, slope significance)
4. **Distribution Analysis**: Calculate entropy and distribution evenness for categories
5. **Correlation Testing**: Pearson and Spearman correlation with significance tests
6. **Variance Analysis**: Coefficient of variation to measure relative variability

### Justification Format Requirements:

For every \`add_new_graph()\` and \`update_graph()\` call, the \`justification\` parameter MUST include:

\`\`\`
Statistical Analysis Results:
- Sample size: [N] observations
- Key metric statistics: mean=[X], std=[Y], CV=[Z]%
- Outlier detection: [N] outliers ([X]%) detected using Z-score>3.0
- Trend analysis: R²=[X], p-value=[Y], slope=[Z] ([significant/not significant])
- Distribution: entropy=[X], evenness=[even/moderate/skewed]
- Correlation: r=[X], p=[Y] ([strong/moderate/weak] and [significant/not significant])
- Business impact: [High/Medium/Low] - [specific reason]
\`\`\`

## GRAPH TYPES & SQL FORMAT REQUIREMENTS

### Table
Always use the table 'events'. The SQL query should always use FROM events.

### Queries
For accessing properties in events, use the format properties->>'property_name' for text and (properties->>'property_name')::NUMERIC for numeric values.

### Available Graph Types:
1. **bar** - Category vs Value comparison
   - SQL Format: (category TEXT, value NUMERIC)
   - Use for: Department expenses, regional comparisons, categorical metrics
   - Extra params: y_axis_label

2. **line** - Time series trends
   - SQL Format: (time INT8, value NUMERIC)
   - Use for: Revenue over time, customer growth, trend analysis
   - Extra params: x_axis_label, y_axis_label

3. **pie** - Composition/Share of whole
   - SQL Format: (slice TEXT, value NUMERIC)
   - Use for: Revenue breakdown, market share, portfolio composition

4. **area** - Time series with filled area
   - SQL Format: (time INT8, value NUMERIC)
   - Use for: Cumulative trends, volume over time
   - Extra params: x_axis_label, y_axis_label

5. **scatter** - Correlation/Distribution analysis
   - SQL Format: (x_value NUMERIC, y_value NUMERIC, size NUMERIC NULL, label TEXT NULL)
   - Use for: Risk vs return, cost vs volume correlations
   - Extra params: x_axis_label, y_axis_label

## ENHANCED WORKFLOW EXECUTION WITH STATISTICAL ANALYSIS

### 1. CURRENT GRAPH ANALYSIS & STATISTICAL VALIDATION

**Step 1a: Get Current State**
- Use \`get_current_graphs()\` to retrieve all existing graphs
- Analyze each graph's statistical validity and current performance

**Step 1b: Statistical Re-evaluation of Existing Graphs**
For each existing graph, mentally perform:
- Freshness analysis: Is the underlying pattern still statistically significant?
- Efficiency analysis: Can the SQL query capture stronger statistical relationships?
- Type optimization: Does the current graph type best represent the statistical pattern?

If statistical improvements are identified, use \`update_graph()\` with full statistical justification.

### 2. COMPREHENSIVE STATISTICAL DATA ANALYSIS

**Step 2a: Data Acquisition & Preparation**
- Use \`get_recent_financial_data(limit=16)\` to fetch latest financial records
- Prepare data for statistical analysis

**Step 2b: Multi-Dimensional Statistical Discovery**
Systematically analyze for these patterns:

**ANOMALY DETECTION:**
- Z-score analysis for transaction amounts (identify values >3σ from mean)
- Frequency anomalies in categorical data
- Time-based clustering analysis

**TREND & CORRELATION ANALYSIS:**
- Time series regression analysis (R², significance tests)
- Cross-variable correlation matrices
- Leading indicator identification

**DISTRIBUTION PATTERNS:**
- Categorical distribution entropy calculations
- Variance decomposition analysis
- Seasonal/cyclical pattern detection

### 3. STATISTICAL-BASED GRAPH PRIORITIZATION

**Step 3a: Statistical Significance Ranking**
Rank discovered patterns by:
- **Statistical Significance**: p-values < 0.05 get priority
- **Effect Size**: R² > 0.5 for correlations, Cohen's d > 0.8 for differences
- **Business Impact**: Revenue/risk implications
- **Novelty Score**: Unique insights not currently displayed

**Step 3b: Rigorous Graph Configuration**
For each high-priority pattern:
- Select graph type based on statistical characteristics
- Design SQL queries optimized for statistical clarity
- Calculate comprehensive justification metrics
- Ensure statistical assumptions are met

### 4. STRATEGIC PORTFOLIO MANAGEMENT WITH STATISTICS

**Step 4a: Portfolio Statistical Assessment**
- Evaluate current graphs' statistical strength and relevance
- Identify redundant or statistically weak visualizations
- Assess coverage across fraud detection, performance metrics, and market analysis

**Step 4b: Evidence-Based Graph Management**
- Remove graphs with weakest statistical foundation if at capacity
- Add new graphs with strongest statistical justification
- Always include complete statistical justification in API calls

### 5. DETAILED STATISTICAL REPORTING

Document your complete analysis including:
- **Statistical Summary**: All test results and significance levels
- **Decision Matrix**: How statistical evidence influenced graph choices
- **Methodology**: Which statistical tests were applied and why
- **Confidence Levels**: Uncertainty quantification for each insight
- **Actionable Recommendations**: Business decisions supported by statistical evidence

## CRITICAL STATISTICAL REQUIREMENTS

1. **Mandatory Justification**: Every \`add_new_graph()\` and \`update_graph()\` call MUST include detailed statistical justification with numerical results
2. **Significance Testing**: Only create graphs for statistically significant patterns (p < 0.05 preferred)
3. **Effect Size**: Prioritize patterns with meaningful effect sizes (R² > 0.3, Cohen's d > 0.5)
4. **Sample Size Validation**: Acknowledge limitations when N < 30
5. **Multiple Testing**: Consider Bonferroni correction when testing multiple hypotheses
6. **Statistical Assumptions**: Verify normality, independence, and homoscedasticity as appropriate

Execute this statistically-rigorous workflow to maintain an evidence-based financial intelligence dashboard with maximum analytical value.`;

export default function ConstitutionModal({ isOpen, onClose }: ConstitutionModalProps) {
  if (!isOpen) return null;

  const renderFormattedContent = () => {
    const lines = CONSTITUTION_CONTENT.split('\n');
    return lines.map((line, index) => {
      // Main headers (##)
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-bold text-posthog-accent mt-6 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {line.replace('## ', '')}
          </h2>
        );
      }

      // Sub headers (###)
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-posthog-text-primary mt-4 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-posthog-accent-secondary" />
            {line.replace('### ', '')}
          </h3>
        );
      }

      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={index} className="text-posthog-text-secondary mb-2">
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i} className="text-posthog-text-primary font-semibold">{part}</strong> : part
            )}
          </p>
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={index} className="flex gap-3 mb-2 ml-4">
            <span className="text-posthog-accent font-mono text-sm mt-0.5">
              {line.match(/^\d+/)?.[0]}
            </span>
            <p className="text-posthog-text-secondary flex-1">
              {line.replace(/^\d+\.\s\*\*(.*?)\*\*:/, (match, p1) => '')}
              {line.includes('**') ? (
                <>
                  <strong className="text-posthog-text-primary">
                    {line.match(/\*\*(.*?)\*\*/)?.[1]}:
                  </strong>
                  {line.replace(/^\d+\.\s\*\*.*?\*\*:/, '')}
                </>
              ) : (
                line.replace(/^\d+\.\s/, '')
              )}
            </p>
          </div>
        );
      }

      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <div key={index} className="flex gap-2 mb-1 ml-4">
            <TrendingUp className="w-3 h-3 text-posthog-accent-secondary mt-1.5 flex-shrink-0" />
            <p className="text-posthog-text-secondary text-sm">
              {line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, (match, p1) => p1)}
            </p>
          </div>
        );
      }

      // Code blocks
      if (line.startsWith('```')) {
        return (
          <div key={index} className="bg-posthog-bg-tertiary border border-posthog-border rounded-lg p-3 my-3 font-mono text-xs text-posthog-text-secondary">
            <code>{line.replace(/```/g, '')}</code>
          </div>
        );
      }

      // Code inline
      if (line.includes('`')) {
        const parts = line.split(/`(.*?)`/g);
        return (
          <p key={index} className="text-posthog-text-secondary mb-2">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <code key={i} className="bg-posthog-bg-tertiary px-1.5 py-0.5 rounded text-xs font-mono text-posthog-accent">
                  {part}
                </code>
              ) : part
            )}
          </p>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }

      // Regular text
      return (
        <p key={index} className="text-posthog-text-secondary mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-posthog-bg-secondary border border-posthog-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-posthog-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-posthog-accent to-orange-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-posthog-text-primary">Agent Constitution</h1>
              <p className="text-sm text-posthog-text-secondary">Statistical Analysis Requirements & Workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-posthog-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-posthog-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="prose prose-invert max-w-none">
            {renderFormattedContent()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 107, 53, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 107, 53, 0.5);
        }
      `}</style>
    </div>
  );
}