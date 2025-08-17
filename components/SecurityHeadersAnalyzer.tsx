// components/SecurityHeadersAnalyzer.tsx
// version 0.0.36
import React, { useState, useCallback } from 'react';
import { analyzeHeaders } from '../services/Service.ts';
import { HeadersReport, HeaderFinding, VulnerabilityReport, Vulnerability, Severity } from '../types.ts';
import { useApiOptions } from '../hooks/useApiOptions.ts';
import { Spinner } from './Spinner.tsx';
import { ScanIcon, ShieldCheckIcon } from './Icons.tsx';
import { ToolLayout } from './ToolLayout.tsx';
import { HeadersReportHeader } from './HeadersReportHeader.tsx';

interface SecurityHeadersAnalyzerProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (report: VulnerabilityReport) => void;
  onAnalysisError: (message: string) => void;
  onShowApiKeyWarning: () => void;
  isLoading: boolean;
  report: VulnerabilityReport | null;
}

const SEVERITY_STYLES: Record<HeaderFinding['severity'], string> = {
    'High': 'border-orange-500',
    'Medium': 'border-yellow-500',
    'Low': 'border-cyan-500',
    'Info': 'border-gray-500',
};

const FindingCard: React.FC<{ finding: HeaderFinding }> = ({ finding }) => {
    return (
        <div className={`p-4 rounded-lg border-l-4 ${SEVERITY_STYLES[finding.severity]} bg-control-bg/50`}>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg text-cyan-300 font-mono">{finding.name}</h4>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${finding.status === 'Missing' ? 'bg-red-900/70 text-red-200' : 'bg-green-900/70 text-green-200'}`}>{finding.status}</span>
            </div>
            {finding.value && (
                <div className="mb-3">
                    <p className="text-xs text-text-tertiary mb-1">Value:</p>
                    <pre className="bg-black/40 p-2 rounded-md font-mono text-xs text-purple-300 overflow-x-auto"><code>{finding.value}</code></pre>
                </div>
            )}
            <div>
                <p className="text-xs text-text-tertiary mb-1">Recommendation:</p>
                <p className="text-sm text-text-secondary">{finding.recommendation}</p>
            </div>
        </div>
    );
};

const convertToVulnerabilityReport = (report: HeadersReport): VulnerabilityReport => {
    const summaryVulnerability: Vulnerability = {
        vulnerability: 'Overall Security Header Grade',
        severity: Severity.INFO,
        description: `The overall security header grade for ${report.analyzedUrl} is **${report.overallScore}**.`,
        impact: report.summary,
        recommendation: 'See individual header findings for specific recommendations.',
        vulnerableCode: `Overall Score: ${report.overallScore}`
    };

    const findingVulnerabilities: Vulnerability[] = report.findings.map(finding => {
        let severity: Severity;
        switch(finding.severity) {
            case 'High': severity = Severity.HIGH; break;
            case 'Medium': severity = Severity.MEDIUM; break;
            case 'Low': severity = Severity.LOW; break;
            default: severity = Severity.INFO;
        }

        return {
            vulnerability: `Security Header: ${finding.name}`,
            severity: severity,
            description: `Status: **${finding.status}**.\n\n${finding.value ? `Value: \`${finding.value}\`` : ''}`,
            impact: 'Misconfigured or missing security headers can lead to vulnerabilities like Cross-Site Scripting (XSS), clickjacking, information disclosure, and Man-in-the-Middle (MITM) attacks.',
            recommendation: finding.recommendation,
            vulnerableCode: finding.value || 'Header Not Found'
        }
    });

    return {
        analyzedTarget: report.analyzedUrl,
        vulnerabilities: [summaryVulnerability, ...findingVulnerabilities],
    };
};

export const SecurityHeadersAnalyzer: React.FC<SecurityHeadersAnalyzerProps> = ({ onAnalysisStart, onAnalysisComplete, onAnalysisError, onShowApiKeyWarning, isLoading }) => {
    const [url, setUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [localReport, setLocalReport] = useState<HeadersReport | null>(null);
    const { apiOptions, isApiKeySet } = useApiOptions();
    
    const handleAnalyze = useCallback(async () => {
        if (!isApiKeySet) {
            onShowApiKeyWarning();
            return;
        }
        if (!url.trim().startsWith('http://') && !url.trim().startsWith('https://')) {
            setError('Please enter a valid URL starting with http:// or https://.');
            return;
        }
        setError(null);
        setLocalReport(null);
        
        onAnalysisStart();
        try {
            const result = await analyzeHeaders(url, apiOptions!);
            setLocalReport(result);
            const reportForHistory = convertToVulnerabilityReport(result);
            onAnalysisComplete(reportForHistory);
        } catch (e: any) {
            const errorMessage = e.message || 'An unexpected error occurred.';
            setError(errorMessage);
            onAnalysisError(errorMessage);
        }
    }, [url, onAnalysisStart, onAnalysisComplete, onAnalysisError, apiOptions, isApiKeySet, onShowApiKeyWarning]);

    return (
        <ToolLayout
          icon={<ShieldCheckIcon className="h-8 w-8 text-cyan-400" />}
          title="Security Headers Analyzer"
          description="Enter a URL to analyze its HTTP security headers. The AI will assess headers like CSP and HSTS against best practices."
        >
            <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <div className="relative flex-grow w-full max-w-lg">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full pl-4 pr-12 py-3 bg-control-bg border border-control-border rounded-lg text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300"
                            disabled={isLoading}
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAnalyze()}
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !url.trim()}
                        className="group w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                    >
                        {isLoading ? <Spinner /> : <ScanIcon className="h-5 w-5 mr-2" />}
                        <span className="relative">Analyze Headers</span>
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {isLoading && (
                     <div className="mt-8 text-center text-text-secondary animate-pulse">
                        <p>AI is fetching and analyzing headers...</p>
                    </div>
                )}
                
                {error && !isLoading && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg font-mono max-w-3xl mx-auto">{error}</div>}

                {localReport && !isLoading && (
                    <div className="mt-2 animate-fade-in">
                        <HeadersReportHeader report={localReport} />

                        <div className="mt-6 space-y-4">
                            {localReport.findings.map((finding, index) => (
                                <FindingCard key={index} finding={finding} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};