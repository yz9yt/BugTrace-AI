// components/HeadersReportHeader.tsx
import React from 'react';
import { HeadersReport } from '../types.ts';
import { downloadHeadersReportAsMarkdown, downloadHeadersReportAsJson } from '../utils/reportExporter.ts';
import { DocumentTextIcon, CodeBracketSquareIcon } from './Icons.tsx';

interface HeadersReportHeaderProps {
    report: HeadersReport;
}

const SCORE_STYLES: Record<string, string> = {
    'A+': 'bg-green-500 text-white',
    'A': 'bg-green-500 text-white',
    'B': 'bg-yellow-500 text-black',
    'C': 'bg-orange-500 text-white',
    'D': 'bg-red-500 text-white',
    'F': 'bg-red-700 text-white',
};

export const HeadersReportHeader: React.FC<HeadersReportHeaderProps> = ({ report }) => {
    return (
        <div className="bg-control-bg/30 p-6 rounded-xl border border-control-border mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-text-primary">Results for: <span className="text-cyan-300 font-mono break-all">{report.analyzedUrl}</span></h3>
                    <p className="text-text-secondary mt-1">{report.summary}</p>
                </div>
                <div className="flex-shrink-0 text-center">
                    <p className="text-text-secondary text-sm mb-1">Overall Score</p>
                    <div className={`text-4xl font-bold rounded-full h-20 w-20 flex items-center justify-center ${SCORE_STYLES[report.overallScore] || 'bg-gray-500'}`}>
                        {report.overallScore}
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-glass-border flex items-center gap-2">
                <button
                    onClick={() => downloadHeadersReportAsMarkdown(report)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-200 bg-purple-900/40 border border-purple-700/80 rounded-lg hover:bg-purple-900/60 transition-colors"
                    title="Download report in Markdown format"
                >
                    <DocumentTextIcon className="h-4 w-4" />
                    Download as Markdown (.md)
                </button>
                <button
                    onClick={() => downloadHeadersReportAsJson(report)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-200 bg-cyan-900/40 border border-cyan-700/80 rounded-lg hover:bg-cyan-900/60 transition-colors"
                    title="Download raw data in JSON format"
                >
                    <CodeBracketSquareIcon className="h-4 w-4" />
                    Download as JSON (.json)
                </button>
            </div>
        </div>
    );
};