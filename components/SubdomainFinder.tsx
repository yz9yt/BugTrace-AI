// @author: Albert C | @yz9yt | github.com/yz9yt
// components/SubdomainFinder.tsx
// version 0.1 Beta
import React, { useState } from 'react';
import { ScanIcon, ShareIcon } from './Icons.tsx';
import { ToolLayout } from './ToolLayout.tsx';

export const SubdomainFinder: React.FC = () => {
    const [domainInput, setDomainInput] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleOpenSubdomainList = () => {
        const cleanedDomain = domainInput.trim();
        if (!cleanedDomain) {
            setError('Please enter a domain name.');
            return;
        }
        if (cleanedDomain.includes('://') || cleanedDomain.includes('/')) {
            setError('Invalid format. Please enter a domain name only (e.g., example.com), not a full URL.');
            return;
        }
        
        setError(null);
        
        const crtShUrl = `https://crt.sh/json?q=${cleanedDomain}`;
        window.open(crtShUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <ToolLayout
            icon={<ShareIcon className="h-8 w-8 text-cyan-400" />}
            title="Subdomain Finder"
            description="Discover subdomains using Certificate Transparency logs from crt.sh."
        >
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="relative flex-grow w-full max-w-lg">
                    <input
                        type="text"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        placeholder="example.com"
                        className="w-full pl-4 pr-12 py-3 bg-control-bg border border-control-border rounded-lg text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300"
                        onKeyDown={(e) => e.key === 'Enter' && handleOpenSubdomainList()}
                    />
                </div>
                <button
                    onClick={handleOpenSubdomainList}
                    disabled={!domainInput.trim()}
                    className="group w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                >
                    <ScanIcon className="h-5 w-5 mr-2" />
                    <span className="relative">Open Subdomain List</span>
                </button>
            </div>
            {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg font-mono max-w-3xl mx-auto">{error}</div>
            )}
        </ToolLayout>
    );
};