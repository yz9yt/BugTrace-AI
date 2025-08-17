// components/SstiForge.tsx
// version 0.0.36
import React, { useState, useCallback } from 'react';
import { generateSstiPayloads } from '../services/Service.ts';
import { ForgedPayload } from '../types.ts';
import { useApiOptions } from '../hooks/useApiOptions.ts';
import { Spinner } from './Spinner.tsx';
import { PuzzlePieceIcon, ClipboardDocumentListIcon } from './Icons.tsx';
import { ToolLayout } from './ToolLayout.tsx';

const TEMPLATE_ENGINES = ['Jinja2 (Python)', 'Twig (PHP)', 'Freemarker (Java)', 'Velocity (Java)', 'Generic'];

interface SstiForgeProps {
    onShowApiKeyWarning: () => void;
}

export const SstiForge: React.FC<SstiForgeProps> = ({ onShowApiKeyWarning }) => {
  const [engine, setEngine] = useState<string>(TEMPLATE_ENGINES[0]);
  const [goal, setGoal] = useState<string>('whoami');
  const [generatedPayloads, setGeneratedPayloads] = useState<ForgedPayload[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { apiOptions, isApiKeySet } = useApiOptions();
  
  const handleGenerate = useCallback(async () => {
    if (!isApiKeySet) {
        onShowApiKeyWarning();
        return;
    }
    if (!goal.trim()) {
      setError('Please enter a goal (e.g., a command to execute).');
      return;
    }
    setError(null);
    setIsGenerating(true);
    setGeneratedPayloads(null);

    try {
      const result = await generateSstiPayloads(engine, goal, apiOptions!);
      setGeneratedPayloads(result.payloads);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while generating payloads.');
    } finally {
      setIsGenerating(false);
    }
  }, [engine, goal, apiOptions, isApiKeySet, onShowApiKeyWarning]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <ToolLayout
      icon={<PuzzlePieceIcon className="h-8 w-8 text-cyan-400" />}
      title="SSTI Payload Generator"
      description="Generate Server-Side Template Injection payloads tailored for specific template engines and goals."
    >
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <label htmlFor="engine" className="block text-sm font-medium text-text-secondary mb-2">Template Engine</label>
          <select
            id="engine"
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="w-full p-2 bg-control-bg border border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-colors"
            disabled={isGenerating}
          >
            {TEMPLATE_ENGINES.map(eng => <option key={eng} value={eng}>{eng}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-text-secondary mb-2">Goal / Command</label>
          <textarea
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., id, cat /etc/passwd, read a secret key..."
            className="w-full h-24 p-4 font-mono text-sm bg-control-bg border border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 resize-y"
            disabled={isGenerating}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !goal.trim()}
          className="group relative inline-flex items-center justify-center px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          title="Generate SSTI payloads based on the selected engine and goal"
        >
          {isGenerating ? <Spinner /> : <PuzzlePieceIcon className="h-5 w-5 mr-2" />}
          <span className="relative">Generate Payloads</span>
        </button>
      </div>

      {isGenerating && (
        <div className="mt-8 text-center text-text-secondary animate-pulse">
            <p>AI is generating SSTI payloads...</p>
        </div>
      )}

      {error && !isGenerating && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg font-mono max-w-3xl mx-auto">{error}</div>
      )}

      {generatedPayloads && !isGenerating && (
        <div className="mt-8 space-y-6">
          {generatedPayloads.length > 0 ? generatedPayloads.map((p, index) => (
            <div key={index} className="bg-control-bg/50 p-4 rounded-lg border border-control-border transition-all hover:border-cyan-400/50">
              <h5 className="text-lg font-bold text-cyan-300">{p.technique}</h5>
              <p className="text-text-secondary text-sm my-2">{p.description}</p>
              <div className="bg-black/40 p-3 rounded-md font-mono text-sm text-purple-300 relative group">
                <pre className="overflow-x-auto"><code className="whitespace-pre-wrap break-all">{p.payload}</code></pre>
                <button 
                   onClick={() => handleCopy(p.payload, index)}
                   className="absolute top-2 right-2 p-1.5 rounded-md bg-purple-800/50 text-purple-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                   aria-label="Copy payload"
                   title="Copy payload"
                >
                  {copiedIndex === index ? (
                    <span className="text-xs font-bold px-1">Copied!</span>
                  ) : (
                    <ClipboardDocumentListIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center p-6 bg-green-900/30 border border-green-500/30 text-green-300 rounded-lg backdrop-blur-sm">
                <p className="font-semibold">The AI did not generate any payloads for this request. Try rephrasing your goal.</p>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};