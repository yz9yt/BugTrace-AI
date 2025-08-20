// @author: Albert C | @yz9yt | github.com/yz9yt
// components/UrlAnalyzer.tsx
// version 0.1 Beta
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeUrl, performDeepAnalysis, consolidateReports, validateVulnerability } from '../services/Service.ts';
import { Vulnerability, VulnerabilityReport, DastScanType } from '../types.ts';
import { useApiOptions } from '../hooks/useApiOptions.ts';
import { VulnerabilityCard } from './VulnerabilityCard.tsx';
import { Spinner } from './Spinner.tsx';
import { ScanIcon, TerminalIcon, LinkIcon } from './Icons.tsx';
import { ToolLayout } from './ToolLayout.tsx';
import { ReportHeader } from './ReportHeader.tsx';

interface UrlAnalyzerProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (report: VulnerabilityReport) => void;
  onAnalysisError: (message: string) => void;
  onShowApiKeyWarning: () => void;
  report: VulnerabilityReport | null;
  isLoading: boolean;
  analysisLog: string[];
  onSendToPayloadForge: (payload: string) => void;
  onSendToJwtAnalyzer: (token: string) => void;
  onShowExploitAssistant: (vulnerability: Vulnerability, targetUrl: string) => void;
  onShowSqlExploitAssistant: (vulnerability: Vulnerability, targetUrl: string) => void;
  onAnalyzeWithAgent: (vulnerability: Vulnerability, targetUrl: string) => void;
  setAnalysisLog: React.Dispatch<React.SetStateAction<string[]>>;
}

const scanOptions: { id: DastScanType; name: string; description: string; }[] = [
    { id: 'recon', name: 'Recon Scan', description: 'Fast. Uses public intelligence (e.g., known exploits) to find vulnerabilities. Low invasiveness.' },
    { id: 'active', name: 'Active Scan (Simulated)', description: 'Thorough. Analyzes inputs and application structure to hypothesize vulnerabilities.' },
    { id: 'greybox', name: 'Grey Box Scan (DAST + SAST)', description: 'Most Powerful. Combines Active Scan with an analysis of the site\'s live JavaScript code for higher accuracy.' },
];

export const UrlAnalyzer: React.FC<UrlAnalyzerProps> = ({ 
    onAnalysisStart, onAnalysisComplete, onAnalysisError, onShowApiKeyWarning,
    report, isLoading, analysisLog, 
    onSendToPayloadForge, onSendToJwtAnalyzer, onShowExploitAssistant, onShowSqlExploitAssistant, onAnalyzeWithAgent, 
    setAnalysisLog
}) => {
  const [url, setUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scanType, setScanType] = useState<DastScanType>('recon');
  const [deepAnalysis, setDeepAnalysis] = useState<boolean>(false);
  const [validateFindings, setValidateFindings] = useState<boolean>(true); // NEW STATE for validation checkbox
  const [depth, setDepth] = useState<number>(3);
  const { apiOptions, isApiKeySet } = useApiOptions();

  useEffect(() => {
    // When a report is selected from history, update the input field
    if (report?.analyzedTarget && report.analyzedTarget.startsWith('http')) {
      setUrl(report.analyzedTarget);
    }
  }, [report]);

  const handleScanTypeChange = (type: DastScanType) => {
    setScanType(type);
  };

  const handleDeepAnalysisChange = (checked: boolean) => {
    setDeepAnalysis(checked);
  };
  
  const handleValidateFindingsChange = (checked: boolean) => { // Handler for new checkbox
    setValidateFindings(checked);
  };

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

    onAnalysisStart();

    try {
        setAnalysisLog(['Starting Analysis...']);
        await new Promise(res => setTimeout(res, 200));

        // --- Phase 1: Recursive Scanning ---
        const successfulReports: VulnerabilityReport[] = [];
        for (let i = 0; i < depth; i++) {
            setAnalysisLog(prev => [...prev, `Executing recursive analysis ${i + 1} of ${depth} with a new prompt variation...`]);
            try {
                const result = await analyzeUrl(url, scanType, apiOptions!, i);
                successfulReports.push(result);
                setAnalysisLog(prev => [...prev, ` -> Run ${i + 1} completed. Found ${result.vulnerabilities.length} potential vulnerabilities.`]);
            } catch (e: any) {
                console.error(`Recursive analysis run ${i + 1} failed:`, e);
                setAnalysisLog(prev => [...prev, ` -> Run ${i + 1} failed: ${e.message}`]);
            }
        }

        if (successfulReports.length === 0) {
            throw new Error("All recursive analysis attempts failed. This could be due to API errors or network issues.");
        }
        
        // --- Phase 2: Consolidation ---
        let baseReport: VulnerabilityReport;
        if (successfulReports.length > 1) {
            setAnalysisLog(prev => [...prev, `Consolidating ${successfulReports.length} reports with AI...`]);
            baseReport = await consolidateReports(successfulReports, apiOptions!);
            setAnalysisLog(prev => [...prev, 'Consolidation complete.']);
        } else {
            baseReport = successfulReports[0];
        }

        if (baseReport.vulnerabilities.length === 0) {
            onAnalysisComplete(baseReport);
            return;
        }

        // --- Phase 3: Validation & Deep Analysis (Optional) ---
        let processedVulnerabilities: Vulnerability[] = baseReport.vulnerabilities;
        if (deepAnalysis || validateFindings) { // Execute this block if Deep Analysis OR Validation is enabled
            setAnalysisLog(prev => [...prev, 'Starting validation and analysis of each finding...']);

            const finalFindings: Vulnerability[] = [];
            for (let i = 0; i < processedVulnerabilities.length; i++) {
                const vuln = processedVulnerabilities[i];
                setAnalysisLog(prev => [...prev, `[${i + 1}/${processedVulnerabilities.length}] Validating finding: ${vuln.vulnerability}...`]);
                
                try {
                    const validationResult = await validateVulnerability(vuln, apiOptions!);
                    if (validationResult.is_valid) {
                        setAnalysisLog(prev => [...prev, ` -> Finding validated.`]);
                        if (deepAnalysis) { // Only perform deep analysis if that specific checkbox is also ticked
                            setAnalysisLog(prev => [...prev, ` -> Starting deep analysis...`]);
                            const enrichedVuln = await performDeepAnalysis(vuln, url, apiOptions!);
                            finalFindings.push(enrichedVuln);
                        } else {
                            finalFindings.push(vuln); // If only validation, just add the validated finding
                        }
                    } else {
                        setAnalysisLog(prev => [...prev, ` -> Filtering potential false positive: ${vuln.vulnerability} (${validationResult.reasoning})`]);
                    }
                } catch (e: any) {
                    console.error(`Validation failed for ${vuln.vulnerability}`, e);
                    setAnalysisLog(prev => [...prev, ` -> Validation failed. Keeping original finding as-is.`]);
                    finalFindings.push(vuln); // If validation fails, keep the original finding
                }
            }
            
            processedVulnerabilities = finalFindings;
        }

        setAnalysisLog(prev => [...prev, 'Final report generation complete.']);
        const finalReport = { ...baseReport, vulnerabilities: processedVulnerabilities };
        onAnalysisComplete(finalReport);

    } catch (e: any) {
        const errorMessage = e.message || 'An unexpected error occurred.';
        setError(errorMessage);
        onAnalysisError(errorMessage);
    }
  }, [url, scanType, deepAnalysis, validateFindings, depth, onAnalysisStart, onAnalysisComplete, onAnalysisError, setAnalysisLog, apiOptions, isApiKeySet, onShowApiKeyWarning]);

  return (
    <ToolLayout
        icon={<LinkIcon className="h-8 w-8 text-cyan-400" />}
        title="URL Analysis (DAST)"
        description="Enter a URL for the AI to analyze using one of the scan modes below."
    >
      <div className="max-w-xl mx-auto mb-6">
          <fieldset className="space-y-4">
              <legend className="sr-only">Scan Type</legend>
              {scanOptions.map(option => (
                  <div key={option.id} className="relative flex items-start cursor-pointer" onClick={() => handleScanTypeChange(option.id)}>
                      <div className="flex items-center h-5">
                          <input
                              id={option.id}
                              name="scan-type"
                              type="radio"
                              checked={scanType === option.id}
                              onChange={() => handleScanTypeChange(option.id)}
                              className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-500 bg-control-bg rounded-full"
                              disabled={isLoading}
                          />
                      </div>
                      <div className="ml-3 text-sm">
                          <label htmlFor={option.id} className="font-medium text-text-primary flex items-center gap-2">
                              {option.name}
                          </label>
                          <p className="text-text-secondary">{option.description}</p>
                      </div>
                  </div>
              ))}
          </fieldset>

          <div className="mt-4">
              <label htmlFor="depth-select" className="block text-sm font-medium text-text-secondary mb-2">
                  Analysis Depth <span className="text-text-tertiary">(for reliability)</span>
              </label>
              <select
                  id="depth-select"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="w-full p-2 bg-control-bg border border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-colors"
                  disabled={isLoading}
              >
                  <option value="1">1 (Fastest)</option>
                  <option value="2">2</option>
                  <option value="3">3 (Default)</option>
                  <option value="4">4</option>
                  <option value="5">5 (Most Reliable)</option>
              </select>
          </div>

          <div className="relative flex items-start mt-4 p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg cursor-pointer" onClick={() => handleDeepAnalysisChange(!deepAnalysis)}>
              <div className="flex items-center h-5">
                  <input
                      id="deep-analysis"
                      name="deep-analysis"
                      type="checkbox"
                      checked={deepAnalysis}
                      onChange={(e) => handleDeepAnalysisChange(e.target.checked)}
                      className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-500 bg-control-bg rounded"
                      disabled={isLoading}
                  />
              </div>
              <div className="ml-3 text-sm">
                  <label htmlFor="deep-analysis" className="font-medium text-text-primary flex items-center gap-2">
                      Enable Deep Analysis
                  </label>
                  <p className="text-text-secondary">Performs a second, specialized analysis on each finding for a higher-quality report. (Slower, may use more API credits)</p>
              </div>
          </div>
          
           {/* New Checkbox for Validation */}
          <div className="relative flex items-start mt-4 p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg cursor-pointer" onClick={() => handleValidateFindingsChange(!validateFindings)}>
              <div className="flex items-center h-5">
                  <input
                      id="validate-findings"
                      name="validate-findings"
                      type="checkbox"
                      checked={validateFindings}
                      onChange={(e) => handleValidateFindingsChange(e.target.checked)}
                      className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-500 bg-control-bg rounded"
                      disabled={isLoading}
                  />
              </div>
              <div className="ml-3 text-sm">
                  <label htmlFor="validate-findings" className="font-medium text-text-primary flex items-center gap-2">
                      Enable Finding Validation
                  </label>
                  <p className="text-text-secondary">Performs an extra pass to filter out potential AI hallucinations and false positives. (Recommended)</p>
              </div>
          </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="relative flex-grow w-full max-w-lg">
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ginandjuice.shop/"
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
          <span className="relative">Analyze URL</span>
        </button>
      </div>

       {isLoading && (
         <div className="mt-6 bg-control-bg p-4 rounded-lg border border-control-border max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-cyan-300 mb-3">
              <TerminalIcon className="h-5 w-5 animate-pulse" />
              <h3 className="font-semibold">Live Analysis Log</h3>
            </div>
            <div className="text-sm text-text-secondary space-y-1.5 font-mono">
              {analysisLog.map((log, index) => (
                <p key={index}>{`> ${log}`}</p>
              ))}
            </div>
         </div>
       )}
      
      {error && !isLoading && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg font-mono max-w-3xl mx-auto">{error}</div>}

      {report && !isLoading &&(
        <div className="mt-8">
          <ReportHeader report={report} />

          {report.vulnerabilities.length > 0 ? (
            <div className="space-y-4">
              {report.vulnerabilities.map((vuln, index) => (
                <VulnerabilityCard 
                    key={index} 
                    vulnerability={vuln} 
                    analyzedTarget={report.analyzedTarget}
                    onSendToPayloadForge={onSendToPayloadForge} 
                    onSendToJwtAnalyzer={onSendToJwtAnalyzer}
                    onShowExploitAssistant={() => onShowExploitAssistant(vuln, report.analyzedTarget)}
                    onShowSqlExploitAssistant={() => onShowSqlExploitAssistant(vuln, report.analyzedTarget)}
                    onAnalyzeWithAgent={() => onAnalyzeWithAgent(vuln, report.analyzedTarget)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-green-900/30 border border-green-500/30 text-green-300 rounded-lg backdrop-blur-sm">
              <p className="font-semibold">Analysis complete! The AI did not infer any obvious vulnerabilities for the selected scan type.</p>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};
