import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, TrendingUp, Shield, Users, Code, Palette } from 'lucide-react';
import type { AIAnalysis } from '../stores/useStore';
import clsx from 'clsx';

interface AIScoreDisplayProps {
  score: number;
  analyses: AIAnalysis[];
  compact?: boolean;
}

const agentIcons: Record<string, React.ReactNode> = {
  'market-analyst': <TrendingUp className="w-4 h-4" />,
  'tech-reviewer': <Code className="w-4 h-4" />,
  'ux-expert': <Palette className="w-4 h-4" />,
  'security-auditor': <Shield className="w-4 h-4" />,
  'business-strategist': <Users className="w-4 h-4" />,
};

const agentNames: Record<string, string> = {
  'market-analyst': 'Market Analyst',
  'tech-reviewer': 'Tech Reviewer',
  'ux-expert': 'UX Expert',
  'security-auditor': 'Security Auditor',
  'business-strategist': 'Business Strategist',
};

const AIScoreDisplay: React.FC<AIScoreDisplayProps> = ({ score, analyses, compact = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 8) return 'from-green-400 to-green-600';
    if (score >= 6) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={clsx(
            'flex flex-col items-center space-y-1 p-3 rounded-xl border-2 transition-all hover:scale-105',
            getScoreColor(score)
          )}
        >
          <div className="flex items-center space-x-1">
            <Brain className="w-4 h-4" />
            <span className="text-2xl font-bold">{score.toFixed(1)}</span>
          </div>
          <div className="flex items-center space-x-0.5">
            {analyses.slice(0, 5).map((analysis, index) => (
              <div
                key={analysis.agentId}
                className={clsx(
                  'w-2 h-2 rounded-full',
                  analysis.score >= 8 ? 'bg-green-500' :
                  analysis.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                title={`${agentNames[analysis.agentId]}: ${analysis.score}/10`}
              />
            ))}
          </div>
          <div className="text-xs font-medium">AI Score</div>
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Detailed Analysis Dropdown */}
        {showDetails && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-20 animate-slide-down">
            <h4 className="font-semibold text-gray-900 mb-3">AI Agent Analysis</h4>
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <div key={analysis.agentId} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {agentIcons[analysis.agentId]}
                      <span className="text-sm font-medium text-gray-700">
                        {agentNames[analysis.agentId]}
                      </span>
                    </div>
                    <span className={clsx(
                      'text-sm font-bold',
                      analysis.score >= 8 ? 'text-green-600' :
                      analysis.score >= 6 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {analysis.score}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{analysis.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full display mode
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>AI Analysis</span>
        </h3>
        <div className={clsx(
          'px-4 py-2 rounded-full font-bold text-xl',
          getScoreColor(score)
        )}>
          {score.toFixed(1)}/10
        </div>
      </div>

      <div className="space-y-4">
        {analyses.map((analysis) => (
          <div key={analysis.agentId} className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {agentIcons[analysis.agentId]}
                <h4 className="font-medium text-gray-900">{agentNames[analysis.agentId]}</h4>
              </div>
              <div className={clsx(
                'px-2 py-1 rounded-full text-sm font-bold',
                analysis.score >= 8 ? 'bg-green-100 text-green-700' :
                analysis.score >= 6 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              )}>
                {analysis.score}/10
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{analysis.summary}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h5 className="text-xs font-medium text-green-700 mb-1">Pros</h5>
                <ul className="space-y-1">
                  {analysis.pros.slice(0, 2).map((pro, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="text-green-500 mr-1">•</span>
                      <span className="line-clamp-1">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-medium text-red-700 mb-1">Cons</h5>
                <ul className="space-y-1">
                  {analysis.cons.slice(0, 2).map((con, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="text-red-500 mr-1">•</span>
                      <span className="line-clamp-1">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Score Bar Visualization */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Aggregate Score</span>
          <span>{score.toFixed(1)}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={clsx('h-2 rounded-full bg-gradient-to-r', getScoreGradient(score))}
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AIScoreDisplay;