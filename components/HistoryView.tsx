// @author: Albert C | @yz9yt | github.com/yz9yt
// components/HistoryView.tsx
// version 0.1 Beta
import React from 'react';
import { VulnerabilityReport } from '../types.ts';
import { HistoryIcon, TrashIcon, LinkIcon, CodeBracketIcon } from './Icons.tsx';

interface HistoryViewProps {
  history: VulnerabilityReport[];
  onSelectReport: (report: VulnerabilityReport) => void;
  onClearHistory: () => void;
  selectedReportId?: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelectReport, onClearHistory, selectedReportId }) => {
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all analysis history? This action cannot be undone.')) {
        onClearHistory();
    }
  }

  return (
    <div className="bg-glass-bg backdrop-blur-xl p-6 sm:p-8 rounded-xl border border-glass-border shadow-2xl shadow-black/40 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
                <HistoryIcon className="h-8 w-8 text-cyan-400" />
                <div>
                    <h3 className="text-2xl font-bold text-text-primary">Analysis History</h3>
                    <p className="text-text-secondary text-sm">Select a previous report to view its details.</p>
                </div>
            </div>
            {history.length > 0 && (
                 <button 
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-300 bg-red-900/40 border border-red-700/80 rounded-lg hover:bg-red-900/60 disabled:opacity-60 transition-colors"
                    title="Clear all history"
                 >
                    <TrashIcon className="h-4 w-4" />
                    Clear History
                 </button>
            )}
        </div>

        <div className="space-y-3">
            {history.length > 0 ? (
                history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelectReport(item)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg text-left transition-all duration-200 ${
                            selectedReportId === item.id 
                                ? 'bg-cyan-500/20 ring-2 ring-cyan-400/50 shadow-lg' 
                                : 'bg-control-bg/50 hover:bg-control-bg'
                        }`}
                    >
                        <div className="flex-shrink-0">
                            {item.analyzedTarget.startsWith('http') ? <LinkIcon className="h-6 w-6 text-text-tertiary" /> : <CodeBracketIcon className="h-6 w-6 text-text-tertiary" />}
                        </div>
                        <div className="flex-grow overflow-hidden">
                             <p className="truncate text-base font-semibold text-text-primary">{item.analyzedTarget}</p>
                             <p className="text-xs text-text-tertiary">
                                {new Date(item.id || 0).toLocaleString()}
                             </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-black/20 text-text-secondary">
                                {item.vulnerabilities.length} {item.vulnerabilities.length === 1 ? 'Finding' : 'Findings'}
                            </span>
                        </div>
                    </button>
                ))
            ) : (
                <div className="text-center py-16 text-text-tertiary">
                    <HistoryIcon className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-semibold">No history yet.</p>
                    <p>Run an analysis to see your reports here.</p>
                </div>
            )}
        </div>
    </div>
  );
};