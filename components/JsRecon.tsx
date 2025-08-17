// @author: Albert C | @yz9yt | github.com/yz9yt
// components/JsRecon.tsx
// version 0.1 Beta
import React, { useState, useCallback } from 'react';
import { analyzeJsCode } from '../services/Service.ts';
import { Vulnerability, VulnerabilityReport } from '../types.ts';
import { useApiOptions } from '../hooks/useApiOptions.ts';
import { VulnerabilityCard } from './VulnerabilityCard.tsx';
import { Spinner } from './Spinner.tsx';
import { ScanIcon, TerminalIcon, CodeSearchIcon } from './Icons.tsx';
import { ToolLayout } from './ToolLayout.tsx';
import { ReportHeader } from './ReportHeader.tsx';

interface JsReconProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (report: VulnerabilityReport) => void;
  onAnalysisError: (message: string) => void;
  onShowApiKeyWarning: () => void;
  report: VulnerabilityReport | null;
  isLoading: boolean;
  analysisLog: string[];
  setAnalysisLog: React.Dispatch<React.SetStateAction<string[]>>;
  onAnalyzeWithAgent: (vulnerability: Vulnerability, analyzedTarget: string) => void;
  onSendToJwtAnalyzer: (token: string) => void;
}

export const JsRecon: React.FC<JsReconProps> = ({ onAnalysisStart, onAnalysisComplete, onAnalysisError, onShowApiKeyWarning, report, isLoading, analysisLog, setAnalysisLog, onAnalyzeWithAgent, onSendToJwtAnalyzer }) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { apiOptions, isApiKeySet } = useApiOptions();

  const handleAnalyze = useCallback(async () => {
    if (!isApiKeySet) {
      onShowApiKeyWarning();
      return;
    }
    if (!code.trim()) {
      setError('Please enter a JavaScript snippet to analyze.');
      return;
    }
    setError(null);

    onAnalysisStart();

    const steps = ['Initializing JS recon...', 'Contacting AI...', 'Analyzing code for secrets & endpoints...', 'Compiling findings...'];
    let currentStep = 0;
    setAnalysisLog([steps[currentStep]]);
    const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
            setAnalysisLog(prev => [...prev, steps[currentStep]]);
        } else {
            clearInterval(interval);
        }
    }, 800);

    try {
      const result = await analyzeJsCode(code, apiOptions!);
      onAnalysisComplete(result);
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      onAnalysisError(errorMessage);
    } finally {
        clearInterval(interval);
    }
  }, [code, onAnalysisStart, onAnalysisComplete, onAnalysisError, setAnalysisLog, apiOptions, isApiKeySet, onShowApiKeyWarning]);

  return (
    <ToolLayout
      icon={<CodeSearchIcon className="h-8 w-8 text-cyan-400" />}
      title="JS Reconnaissance"
      description="Paste JavaScript code to find hardcoded API endpoints, URLs, and potential secrets."
    >
      <div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="const apiKey = 'sk_live_...';\n\nfetch('/api/v1/users', {\n  // ...\n});"
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
          <span className="relative">Analyze JS Code</span>
        </button>
      </div>

      {isLoading && (
        <div className="mt-6 bg-control-bg p-4 rounded-lg border border-control-border">
           <div className="flex items-center gap-2 text-cyan-300 mb-3">
             <TerminalIcon className="h-5 w-5 animate-pulse" />
             <h3 className="font-semibold">Live Recon Log</h3>
           </div>
           <div className="text-sm text-text-secondary space-y-1.5 font-mono">
             {analysisLog.map((log, index) => (
               <p key={index}>{`> ${log}`}</p>
             ))}
           </div>
        </div>
      )}
      
      {error && !isLoading && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg font-mono">{error}</div>}

      {report && !isLoading && (
        <div className="mt-8">
          <ReportHeader report={report} />
          {report.vulnerabilities.length > 0 ? (
            <div className="space-y-4">
              {report.vulnerabilities.map((vuln, index) => (
                <VulnerabilityCard 
                    key={index} 
                    vulnerability={vuln} 
                    analyzedTarget={report.analyzedTarget}
                    onAnalyzeWithAgent={() => onAnalyzeWithAgent(vuln, report.analyzedTarget)}
                    onSendToJwtAnalyzer={onSendToJwtAnalyzer}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-green-900/30 border border-green-500/30 text-green-300 rounded-lg backdrop-blur-sm">
              <p className="font-semibold">No secrets, endpoints, or hardcoded URLs were found.</p>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};