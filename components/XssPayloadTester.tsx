// components/XssPayloadTester.tsx
// version 0.0.29
import React from 'react';
import { InjectionPoint } from '../types.ts';
import { FireIcon } from './Icons.tsx';

interface XssPayloadTesterProps {
  payload: string;
  analyzedTarget: string;
  injectionPoint: InjectionPoint;
  onSendToPayloadForge?: (payload: string) => void;
}

const constructTestUrl = (baseUrl: string, parameter: string, payload: string): string => {
    try {
        const url = new URL(baseUrl);
        const params = new URLSearchParams(url.search);
        params.set(parameter, payload);
        url.search = params.toString();
        return url.toString();
    } catch (e) {
        console.error("Could not construct test URL:", e);
        // Fallback for potentially malformed base URLs
        const [base, ...rest] = baseUrl.split('?');
        const params = new URLSearchParams(rest.join('?'));
        params.set(parameter, payload);
        return `${base}?${params.toString()}`;
    }
};

export const XssPayloadTester: React.FC<XssPayloadTesterProps> = ({ payload, analyzedTarget, injectionPoint, onSendToPayloadForge }) => {
  
  const handleTestPayload = () => {
    const testUrl = constructTestUrl(analyzedTarget, injectionPoint.parameter, payload);
    window.open(testUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendToForge = () => {
    if (onSendToPayloadForge) {
      onSendToPayloadForge(payload);
    }
  };

  const isPost = injectionPoint.method === 'POST';

  return (
    <div className="space-y-2">
      <pre className="w-full bg-black/30 border border-purple-800/50 rounded-lg p-3 text-purple-200 text-sm overflow-x-auto">
        <code>{payload}</code>
      </pre>
      <div className="flex items-start flex-wrap gap-2">
        <button
          onClick={handleTestPayload}
          disabled={isPost}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-200 bg-purple-900/40 border border-purple-700/80 rounded-lg hover:bg-purple-900/60 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          title={isPost ? "Cannot automatically test POST-based payloads. Use the 'Analyze Exploit Path' feature for this." : "Opens the crafted URL in a new tab."}
        >
          Test in New Tab
        </button>
        {onSendToPayloadForge && (
            <button
                onClick={handleSendToForge}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-orange-200 bg-orange-900/40 border border-orange-700/80 rounded-lg hover:bg-orange-900/60 transition-colors"
                title="Send this payload to the Payload Forge for obfuscation."
            >
                <FireIcon className="h-4 w-4" />
                Send to Forge
            </button>
        )}
        <div className='pt-0.5 text-xs text-text-tertiary basis-full'>
          {isPost 
            ? "For POST requests, use the 'Analyze Exploit Path' feature on the vulnerability card."
            : "Opens the fully-formed URL in a new tab for verification."
          }
        </div>
      </div>
    </div>
  );
};