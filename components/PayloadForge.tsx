// @author: Albert C | @yz9yt | github.com/yz9yt
// version 0.1 Beta
import React, { useState, useCallback, useEffect } from 'react';
import { forgePayloads } from '../services/Service.ts';
import { ForgedPayload } from '../types.ts';
import { useApiOptions } from '../hooks/useApiOptions.ts';
import { Spinner } from './Spinner.tsx';
import { FireIcon, ClipboardDocumentListIcon } from './Icons.tsx';
import { ToolLayout } from './ToolLayout.tsx';

type ForgeTab = 'ai' | 'fuzz';

interface PayloadForgeProps {
  payloadForForge: string | null;
  onPayloadUsed: () => void;
  onShowApiKeyWarning: () => void;
}

export const PayloadForge: React.FC<PayloadForgeProps> = ({ payloadForForge, onPayloadUsed, onShowApiKeyWarning }) => {
  const [basePayload, setBasePayload] = useState<string>('<script>alert(1)</script>');
  
  const [forgedPayloads, setForgedPayloads] = useState<ForgedPayload[] | null>(null);
  const [isForging, setIsForging] = useState<boolean>(false);
  const [forgeError, setForgeError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { apiOptions, isApiKeySet } = useApiOptions();

  const [payloadList, setPayloadList] = useState<string>('');
  const [listCopied, setListCopied] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<ForgeTab>('ai');

  useEffect(() => {
    if (payloadForForge) {
      setBasePayload(payloadForForge);
      onPayloadUsed();
    }
  }, [payloadForForge, onPayloadUsed]);

  const handleForge = useCallback(async () => {
    if (!isApiKeySet) {
        onShowApiKeyWarning();
        return;
    }
    if (!basePayload.trim()) {
      setForgeError('Please enter a base payload to forge.');
      return;
    }
    setForgeError(null);
    
    setIsForging(true);
    setForgedPayloads(null);
    setPayloadList('');
    setActiveTab('ai'); // Default to AI tab on new generation

    try {
      const result = await forgePayloads(basePayload, apiOptions!);
      setForgedPayloads(result.payloads);

      // --- Enhanced Fuzzing List Generation ---
      if (result.payloads && result.payloads.length > 0) {
        const fuzzingPrefixes = [
            '', // The payload itself
            "'",
            '"',
            "`",
            ">",
            "'>",
            "\">",
            "`>",
            "</script>",
            "</form>",
            "</div>",
            "</textarea>",
            "-->",
            "'-",
            "\"-",
            "`-",
            "');",
            "\");",
            "`));",
            "'});",
            "\"});",
            "`});",
        ];

        const allFuzzStrings = result.payloads.flatMap(forged => {
            const singleLinePayload = forged.payload.replace(/[\r\n\t]/g, '');
            return fuzzingPrefixes.map(prefix => `${prefix}${singleLinePayload}`);
        });
        const uniqueList = Array.from(new Set(allFuzzStrings));
        setPayloadList(uniqueList.join('\n'));
      } else {
        setPayloadList('// AI did not return any payloads to generate a fuzzing list from.');
      }

    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      setForgeError(errorMessage);
    } finally {
      setIsForging(false);
    }
  }, [basePayload, apiOptions, isApiKeySet, onShowApiKeyWarning]);
  
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleListCopy = () => {
    if (!payloadList) return;
    navigator.clipboard.writeText(payloadList);
    setListCopied(true);
    setTimeout(() => setListCopied(false), 2000);
  };

  return (
    <ToolLayout
      icon={<FireIcon className="h-8 w-8 text-orange-400" />}
      title="Payload Forge"
      description="Enter a base payload (e.g., an XSS script) and let the AI generate advanced variations for WAF bypass testing."
    >
      <div className="relative">
        <label htmlFor="basePayload" className="block text-sm font-medium text-text-secondary mb-2">Base Payload</label>
        <textarea
          id="basePayload"
          value={basePayload}
          onChange={(e) => setBasePayload(e.target.value)}
          placeholder="e.g., <script>alert(1)</script>"
          className="w-full h-24 p-4 font-mono text-sm bg-control-bg border-2 border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 resize-y"
          disabled={isForging}
        />
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleForge}
          disabled={isForging || !basePayload.trim()}
          className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 overflow-hidden"
        >
          {isForging ? <Spinner /> : <FireIcon className="h-5 w-5 mr-2" />}
          <span className="relative">Forge Payloads</span>
        </button>
      </div>

      {isForging && (
        <div className="mt-8 text-center text-text-secondary animate-pulse">
            <p>AI is forging payload variations...</p>
        </div>
      )}

      {forgeError && !isForging && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg font-mono max-w-3xl mx-auto">{forgeError}</div>
      )}

      {forgedPayloads && !isForging && (
        <div className="mt-8">
            <div className="flex bg-control-bg p-1 rounded-lg border border-control-border mb-4 max-w-sm mx-auto">
                <button onClick={() => setActiveTab('ai')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'ai' ? 'bg-purple-500/50 text-white' : 'text-text-tertiary hover:bg-white/5'}`}>AI Variations</button>
                <button onClick={() => setActiveTab('fuzz')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'fuzz' ? 'bg-purple-500/50 text-white' : 'text-text-tertiary hover:bg-white/5'}`}>Fuzzing List</button>
            </div>

            {activeTab === 'ai' ? (
                <div className="space-y-6 animate-fade-in">
                {forgedPayloads.length > 0 ? forgedPayloads.map((p, index) => (
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
                    <div className="text-center p-6 bg-green-900/40 border border-green-700 text-green-300 rounded-lg backdrop-blur-sm">
                        <p className="font-semibold">The AI did not return any forged payloads. Try rephrasing your base payload.</p>
                    </div>
                )}
                </div>
            ) : (
                <div className="animate-fade-in">
                    <p className="text-center text-text-secondary text-sm mb-4">A comprehensive list for fuzzing tools like Burp Intruder, combining all variations with common prefixes.</p>
                    <div className="relative">
                        <textarea
                            readOnly
                            value={payloadList}
                            className="w-full h-96 p-4 font-mono text-xs bg-black/40 border border-control-border rounded-lg text-green-300"
                        />
                        <button 
                            onClick={handleListCopy}
                            className="absolute top-3 right-3 p-1.5 rounded-md bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 transition-colors"
                            aria-label="Copy fuzzing list"
                            title="Copy fuzzing list"
                        >
                        {listCopied ? (
                            <span className="text-xs font-bold px-1">Copied!</span>
                        ) : (
                            <ClipboardDocumentListIcon className="h-5 w-5" />
                        )}
                        </button>
                    </div>
                </div>
            )}
        </div>
      )}
    </ToolLayout>
  );
};