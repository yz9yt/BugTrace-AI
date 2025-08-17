// @author: Albert C | @yz9yt | github.com/yz9yt
// components/DomXssPathfinder.tsx
// version 0.1 Beta
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeDomXss } from '../services/Service.ts';
import { DomXssAnalysisResult, VulnerabilityReport, Vulnerability, Severity } from '../types.ts';
import { useApiOptions } from '../hooks/useApiOptions.ts';
import { Spinner } from './Spinner.tsx';
import { FlowChartIcon, ScanIcon } from './Icons.tsx';
import { ToolLayout } from './ToolLayout.tsx';

interface DomXssPathfinderProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (report: VulnerabilityReport) => void;
  onAnalysisError: (message: string) => void;
  onShowApiKeyWarning: () => void;
  isLoading: boolean;
  report: VulnerabilityReport | null;
}

const convertToVulnerabilityReport = (result: DomXssAnalysisResult): VulnerabilityReport => {
    const vulnerabilities: Vulnerability[] = result.connected_paths.map(path => ({
        vulnerability: 'DOM-based Cross-Site Scripting',
        severity: Severity.HIGH,
        description: `A vulnerable data flow path was found from source \`${path.source}\` to sink \`${path.sink}\`.`,
        impact: `User-controlled data from '${path.source}' can be executed by the '${path.sink}', potentially leading to arbitrary JavaScript execution in the user's browser context. This could be used to steal session tokens, perform actions on behalf of the user, or deface the page.`,
        recommendation: `Ensure that any data read from an untrusted source like '${path.source}' is properly sanitized and encoded before being passed to a dangerous sink like '${path.sink}'. Avoid using '.innerHTML' or 'document.write' with user-controlled content; use '.textContent' instead.`,
        vulnerableCode: path.code_snippet,
        injectionPoint: {
            type: 'PATH', // Placeholder as DOM XSS is often in URL fragments
            parameter: path.source,
            method: 'GET'
        }
    }));

    return {
        analyzedTarget: 'DOM XSS Code Analysis',
        vulnerabilities,
    };
};

export const DomXssPathfinder: React.FC<DomXssPathfinderProps> = ({ onAnalysisStart, onAnalysisComplete, onAnalysisError, onShowApiKeyWarning, isLoading, report: selectedReport }) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DomXssAnalysisResult | null>(null);
  const { apiOptions, isApiKeySet } = useApiOptions();
  
  useEffect(() => {
    if (!isLoading && selectedReport?.analyzedTarget !== 'DOM XSS Code Analysis') {
        setResult(null);
    }
  }, [selectedReport, isLoading]);

  const handleAnalyze = useCallback(async () => {
    if (!isApiKeySet) {
        onShowApiKeyWarning();
        return;
    }
    if (!code.trim()) {
      setError('Please paste JavaScript code to analyze.');
      return;
    }
    setError(null);
    setResult(null);
    
    onAnalysisStart();
    try {
      const analysisResult = await analyzeDomXss(code, apiOptions!);
      setResult(analysisResult);
      const report = convertToVulnerabilityReport(analysisResult);
      onAnalysisComplete(report);
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred while analyzing the code.';
      setError(errorMessage);
      onAnalysisError(errorMessage);
    }
  }, [code, onAnalysisStart, onAnalysisComplete, onAnalysisError, apiOptions, isApiKeySet, onShowApiKeyWarning]);

  return (
    <ToolLayout
      icon={<FlowChartIcon className="h-8 w-8 text-cyan-400" />}
      title="DOM XSS Pathfinder"
      description="Paste JavaScript code to find vulnerable data flow paths from user-controlled sources to dangerous sinks."
    >
      <div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`const urlParams = new URLSearchParams(window.location.search);\nconst name = urlParams.get('name');\ndocument.getElementById('greeting').innerHTML = 'Hello, ' + name;`}
          className="w-full h-64 p-4 font-mono text-sm bg-control-bg border border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 resize-y"
          disabled={isLoading}
        />
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !code.trim()}
          className="group relative inline-flex items-center justify-center px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
        >
          {isLoading ? <Spinner /> : <ScanIcon className="h-5 w-5 mr-2" />}
          <span className="relative">Find Paths</span>
        </button>
      </div>

      {isLoading && (
        <div className="mt-8 text-center text-text-secondary animate-pulse">
            <p>AI is analyzing data flow paths...</p>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg font-mono max-w-3xl mx-auto">{error}</div>
      )}

      {result && !isLoading && (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Analysis Results</h3>
            
            <div className="mb-8">
                <h4 className="text-lg font-bold text-green-400 mb-3">Connected Paths (High Confidence)</h4>
                {result.connected_paths?.length > 0 ? (
                    <div className="space-y-4">
                        {result.connected_paths.map((path, index) => (
                            <div key={index} className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                                <p className="text-sm font-semibold text-green-300">
                                    <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded">{path.source}</span>
                                    <span className="mx-2 text-green-500">&rarr;</span>
                                    <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded">{path.sink}</span>
                                </p>
                                <div className="mt-3">
                                    <p className="text-xs text-text-tertiary mb-1">Connecting Code:</p>
                                    <pre className="bg-black/40 p-2 rounded-md font-mono text-xs text-purple-300 overflow-x-auto"><code>{path.code_snippet}</code></pre>
                                </div>
                                 <div className="mt-3">
                                    <p className="text-xs text-text-tertiary mb-1">Explanation:</p>
                                    <p className="text-sm text-text-secondary">{path.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary text-sm italic">No high-confidence vulnerable paths were found.</p>
                )}
            </div>

            <div>
                <h4 className="text-lg font-bold text-yellow-400 mb-3">Unconnected Findings (Informational)</h4>
                 {result.unconnected_findings?.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
                            <h5 className="font-semibold text-yellow-300 mb-2">Sources Found</h5>
                            <ul className="list-disc list-inside space-y-1">
                                {result.unconnected_findings.filter(f => f.type === 'source').map((f, i) => (
                                    <li key={i} className="font-mono text-sm text-yellow-200">{f.value}</li>
                                ))}
                            </ul>
                        </div>
                         <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
                            <h5 className="font-semibold text-yellow-300 mb-2">Sinks Found</h5>
                             <ul className="list-disc list-inside space-y-1">
                                {result.unconnected_findings.filter(f => f.type === 'sink').map((f, i) => (
                                    <li key={i} className="font-mono text-sm text-yellow-200">{f.value}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                 ) : (
                    <p className="text-text-secondary text-sm italic">No additional unconnected sources or sinks were identified.</p>
                 )}
            </div>
        </div>
      )}
    </ToolLayout>
  );
};