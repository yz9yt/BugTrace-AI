// @author: Albert C | @yz9yt | github.com/yz9yt
// components/JwtAnalyzer.tsx
// version 0.1 Beta
import React, { useState, useEffect, useCallback } from 'react';
import { analyzeJwt } from '../services/Service.ts';
import { VulnerabilityReport, Severity } from '../types.ts';
import { useApiOptions } from '../hooks/useApiOptions.ts';
import { Spinner } from './Spinner.tsx';
import { KeyIcon, ShieldCheckIcon, FireIcon, ChatIcon, DocumentTextIcon, CodeBracketSquareIcon } from './Icons.tsx';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';
import { ToolLayout } from './ToolLayout.tsx';
import { sanitizeFilename, triggerDownload } from '../utils/reportExporter.ts';

// Base64URL to regular base64
const base64UrlDecode = (str: string): string => {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
        case 0: break;
        case 2: output += '=='; break;
        case 3: output += '='; break;
        default: throw new Error('Illegal base64url string!');
    }
    try {
        return decodeURIComponent(atob(output).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } catch (e) {
        return atob(output); // Fallback for non-UTF8 strings
    }
};

const formatJson = (jsonString: string): string => {
    try {
        return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
        return "Invalid JSON content";
    }
};

interface DecodedJwt {
    header: string;
    payload: string;
    signature: string;
}

interface JwtAnalyzerProps {
    initialToken: string | null;
    report: VulnerabilityReport | null;
    onTokenConsumed: () => void;
    onAnalysisComplete: (report: VulnerabilityReport) => void;
    onSendReportToAgent: (reportText: string, analysisType: string) => void;
    onShowApiKeyWarning: () => void;
}

export const JwtAnalyzer: React.FC<JwtAnalyzerProps> = ({ initialToken, report, onTokenConsumed, onAnalysisComplete, onSendReportToAgent, onShowApiKeyWarning }) => {
    const [encodedJwt, setEncodedJwt] = useState(initialToken || '');
    const [decodedJwt, setDecodedJwt] = useState<DecodedJwt | null>(null);
    const [loadingState, setLoadingState] = useState<'none' | 'blue' | 'red'>('none');
    const [error, setError] = useState<string | null>(null);
    const { apiOptions, isApiKeySet } = useApiOptions();
    
    const [blueTeamResult, setBlueTeamResult] = useState<string | null>(null);
    const [redTeamResult, setRedTeamResult] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'blue' | 'red'>('blue');
    
    useEffect(() => {
        if (initialToken) {
            setEncodedJwt(initialToken);
            onTokenConsumed();
        }
    }, [initialToken, onTokenConsumed]);

    useEffect(() => {
      if (report && report.analyzedTarget.startsWith('JWT Analysis')) {
          const historyVuln = report.vulnerabilities[0];
          if (historyVuln) {
              setEncodedJwt(historyVuln.vulnerableCode);
              const [blueContent, redContent] = historyVuln.description.split('--- \n\n ---');
              
              const hasBlue = blueContent && !blueContent.includes('not yet performed');
              const hasRed = redContent && !redContent.includes('not yet performed');

              setBlueTeamResult(hasBlue ? blueContent : null);
              setRedTeamResult(hasRed ? redContent : null);
              
              if (hasBlue) {
                  setActiveTab('blue');
              } else if (hasRed) {
                  setActiveTab('red');
              } else {
                  setActiveTab('blue');
              }
              
              setError(null);
          }
      } 
      else if (!initialToken) {
          setBlueTeamResult(null);
          setRedTeamResult(null);
          setError(null);
      }
    }, [report, initialToken]);

    const tryDecodeJwt = useCallback((jwt: string) => {
        if (jwt.trim()) {
            const parts = jwt.split('.');
            if (parts.length === 3) {
                try {
                    const header = formatJson(base64UrlDecode(parts[0]));
                    const payload = formatJson(base64UrlDecode(parts[1]));
                    const signature = parts[2];
                    setDecodedJwt({ header, payload, signature });
                    setError(null);
                } catch (e: any) {
                    setDecodedJwt(null);
                    setError("Invalid JWT: Malformed Base64URL content.");
                }
            } else {
                setDecodedJwt(null);
                 if (jwt.trim().length > 0) {
                    setError("Invalid JWT: Must contain 3 parts separated by dots.");
                }
            }
        } else {
            setDecodedJwt(null);
            setError(null);
        }
    }, []);

    useEffect(() => {
        tryDecodeJwt(encodedJwt);
    }, [encodedJwt, tryDecodeJwt]);

    const handleAudit = useCallback(async (mode: 'blue_team' | 'red_team') => {
        if (!isApiKeySet) {
            onShowApiKeyWarning();
            return;
        }
        if (!decodedJwt) {
            setError("Cannot analyze an invalid or empty JWT.");
            return;
        }
        setError(null);
        setLoadingState(mode === 'blue_team' ? 'blue' : 'red');

        try {
            const headerObj = JSON.parse(decodedJwt.header);
            const payloadObj = JSON.parse(decodedJwt.payload);

            const result = await analyzeJwt(headerObj, payloadObj, mode, apiOptions!);
            
            let newBlueResult = blueTeamResult;
            let newRedResult = redTeamResult;

            if (mode === 'blue_team') {
                setBlueTeamResult(result);
                newBlueResult = result;
                setActiveTab('blue');
            } else {
                setRedTeamResult(result);
                newRedResult = result;
                setActiveTab('red');
            }

            const combinedDescription = `${newBlueResult || 'Blue Team analysis not yet performed.'}\n\n--- \n\n ---${newRedResult || 'Red Team analysis not yet performed.'}`;
            
            const reportForHistory: VulnerabilityReport = {
                analyzedTarget: `JWT Analysis: ${encodedJwt.substring(0, 20)}...`,
                vulnerabilities: [{
                    vulnerability: `JWT Security Audit (Blue & Red Team)`,
                    severity: Severity.INFO,
                    description: combinedDescription,
                    impact: "The impact varies based on the findings. Refer to the full report.",
                    recommendation: "Review the full analysis report for detailed recommendations.",
                    vulnerableCode: encodedJwt,
                }]
            };
            onAnalysisComplete(reportForHistory);

        } catch (e: any) {
            setError(e.message || "An unexpected error occurred during analysis.");
        } finally {
            setLoadingState('none');
        }
    }, [decodedJwt, encodedJwt, onAnalysisComplete, apiOptions, isApiKeySet, onShowApiKeyWarning, blueTeamResult, redTeamResult]);
    
    const handleSendToAgent = () => {
        const result = activeTab === 'blue' ? blueTeamResult : redTeamResult;
        if (result) {
            const analysisType = activeTab === 'blue' ? 'JWT Blue Team Audit' : 'JWT Red Team Audit';
            onSendReportToAgent(result, analysisType);
        }
    }

    const handleDownloadReport = () => {
        const content = activeTab === 'blue' ? blueTeamResult : redTeamResult;
        if (!content) return;

        const team = activeTab === 'blue' ? 'blue-team' : 'red-team';
        const truncatedJwt = sanitizeFilename(encodedJwt.substring(0, 20));
        const date = new Date().toISOString().split('T')[0];
        const filename = `jwt-audit-${team}-${truncatedJwt}-${date}.md`;

        triggerDownload(filename, content, 'text/markdown;charset=utf-8');
    };
    
    const handleDownloadJson = () => {
        const content = activeTab === 'blue' ? blueTeamResult : redTeamResult;
        if (!content || !decodedJwt) return;

        const team = activeTab === 'blue' ? 'blue' : 'red';
        const analysisType = activeTab === 'blue' ? 'Defensive Analysis' : 'Attack Surface';
        
        try {
            const reportData = {
                team,
                analysisType,
                jwt: encodedJwt,
                decoded: {
                    header: JSON.parse(decodedJwt.header),
                    payload: JSON.parse(decodedJwt.payload),
                },
                reportMarkdown: content
            };

            const truncatedJwt = sanitizeFilename(encodedJwt.substring(0, 20));
            const date = new Date().toISOString().split('T')[0];
            const filename = `jwt-audit-${team}-${truncatedJwt}-${date}.json`;

            triggerDownload(filename, JSON.stringify(reportData, null, 2), 'application/json;charset=utf-8');
        } catch (e) {
            console.error("Failed to create JSON report:", e);
            setError("Failed to create JSON report. The decoded JWT might not be valid JSON.");
        }
    };

    return (
        <ToolLayout
          icon={<KeyIcon className="h-8 w-8 text-cyan-400" />}
          title="JWT Decompiler & Auditor"
          description="Paste a JSON Web Token to decode it. Then, use the AI auditor to analyze its security."
        >
            <div>
                <label htmlFor="jwt-input" className="block text-sm font-medium text-text-secondary mb-2">Encoded JWT</label>
                <textarea
                    id="jwt-input"
                    value={encodedJwt}
                    onChange={e => setEncodedJwt(e.target.value)}
                    placeholder="ey...[header]....ey...[payload]....[signature]"
                    className="w-full h-40 p-4 font-mono text-xs bg-control-bg border border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 resize-y"
                />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => handleAudit('blue_team')}
                    disabled={loadingState !== 'none' || !decodedJwt}
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                >
                    {loadingState === 'blue' ? <Spinner /> : <ShieldCheckIcon className="h-5 w-5 mr-2" />}
                    Blue Team Audit
                </button>
                <button
                    onClick={() => handleAudit('red_team')}
                    disabled={loadingState !== 'none' || !decodedJwt}
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                >
                    {loadingState === 'red' ? <Spinner /> : <FireIcon className="h-5 w-5 mr-2" />}
                    Red Team Audit
                </button>
            </div>
            
            {decodedJwt && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8 animate-fade-in">
                     <div>
                        <h4 className="font-semibold text-purple-300 mb-1">Header</h4>
                        <pre className="bg-black/40 p-3 rounded-md font-mono text-xs text-purple-200 overflow-x-auto border border-purple-500/20"><code>{decodedJwt.header}</code></pre>
                    </div>
                     <div>
                        <h4 className="font-semibold text-cyan-300 mb-1">Payload / Claims</h4>
                        <pre className="bg-black/40 p-3 rounded-md font-mono text-xs text-cyan-200 overflow-x-auto border border-cyan-500/20"><code>{decodedJwt.payload}</code></pre>
                    </div>
                     <div>
                        <h4 className="font-semibold text-orange-400 mb-1">Signature</h4>
                        <pre className="bg-black/40 p-3 rounded-md font-mono text-xs text-orange-300 overflow-x-auto border border-orange-500/20 break-all"><code>{decodedJwt.signature}</code></pre>
                    </div>
                </div>
            )}
            
            {loadingState !== 'none' && (
                <div className="flex flex-col items-center justify-center text-text-secondary animate-pulse mt-6">
                    <p>AI is performing the {loadingState} team audit (this may take a moment)...</p>
                </div>
            )}
            
            {(blueTeamResult || redTeamResult) && loadingState === 'none' && (
                <div className="mt-12">
                    <div className="mb-4 pb-4 border-b border-glass-border">
                        <h3 className="text-xl font-semibold text-text-primary">Analysis Report</h3>
                        <div className="mt-4 pt-4 border-t border-glass-border flex items-center gap-2">
                            <button
                              onClick={handleDownloadReport}
                              disabled={!(activeTab === 'blue' ? blueTeamResult : redTeamResult)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-200 bg-purple-900/40 border border-purple-700/80 rounded-lg hover:bg-purple-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={`Download ${activeTab === 'blue' ? 'Blue' : 'Red'} Team report as Markdown`}
                            >
                              <DocumentTextIcon className="h-4 w-4" />
                              Download as Markdown (.md)
                            </button>
                             <button
                                onClick={handleDownloadJson}
                                disabled={!(activeTab === 'blue' ? blueTeamResult : redTeamResult)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-200 bg-cyan-900/40 border border-cyan-700/80 rounded-lg hover:bg-cyan-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={`Download report as structured JSON`}
                            >
                                <CodeBracketSquareIcon className="h-4 w-4" />
                                Download as JSON (.json)
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-control-bg/50 p-4 rounded-lg border border-control-border min-h-[24rem] flex flex-col">
                         <div className="border-b border-glass-border mb-4">
                            <div className="flex bg-control-bg/50 p-1 rounded-lg border border-control-border max-w-sm">
                                <button onClick={() => setActiveTab('blue')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'blue' ? 'bg-blue-500/50 text-white' : 'text-text-tertiary hover:bg-white/5'}`}>Blue Team</button>
                                <button onClick={() => setActiveTab('red')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'red' ? 'bg-red-500/50 text-white' : 'text-text-tertiary hover:bg-white/5'}`}>Red Team</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                           {activeTab === 'blue' && blueTeamResult && (
                                <div className="animate-fade-in">
                                    <h3 className="text-xl font-bold text-blue-300 mb-4">Blue Team Report: Defensive Analysis</h3>
                                    <MarkdownRenderer content={blueTeamResult} />
                                </div>
                           )}
                           {activeTab === 'red' && redTeamResult && (
                               <div className="animate-fade-in">
                                    <h3 className="text-xl font-bold text-red-300 mb-4">Red Team Report: Attack Surface</h3>
                                    <MarkdownRenderer content={redTeamResult} />
                                </div>
                           )}
                        </div>
                         <div className="mt-4 pt-4 border-t border-glass-border flex flex-wrap items-center gap-2">
                            <button
                              onClick={handleSendToAgent}
                              disabled={!(activeTab === 'blue' ? blueTeamResult : redTeamResult)}
                              className="flex-grow flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-900/40 border border-cyan-700/80 rounded-lg hover:bg-cyan-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Analyze this report with the WebSec Agent"
                            >
                              <ChatIcon className="h-5 w-5" />
                              Analyze with Agent
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToolLayout>
    );
};