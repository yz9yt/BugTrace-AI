// @author: Albert C | @yz9yt | github.com/yz9yt
// version 0.1 Beta
import React from 'react';
import { ShieldExclamationIcon, HeartIcon } from './Icons.tsx';

interface DisclaimerModalProps {
    onAccept: () => void;
    onReject: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept, onReject }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl w-full max-w-2xl shadow-2xl shadow-purple-500/10 flex flex-col"
            >
                <header className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-glass-border bg-glass-bg/80">
                    <ShieldExclamationIcon className="h-6 w-6 text-yellow-400" />
                    <h2 className="text-xl font-bold text-text-primary">Disclaimer & Terms of Use</h2>
                </header>

                <main className="p-6 text-text-secondary space-y-4 text-sm">
                    <p>This application is provided for <strong>educational and research purposes only</strong>. It uses generative AI to analyze web applications and assist in identifying potential security vulnerabilities.</p>
                    <p className="font-semibold text-text-primary">The AI's output may contain inaccuracies, false positives, or false negatives. It is NOT a substitute for professional security auditing or manual code review.</p>
                    <p>By using this tool, you acknowledge and agree that:</p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>You will only test applications for which you have <strong>explicit, written permission</strong> from the owner.</li>
                        <li>You are solely responsible for verifying any findings and for any actions taken based on the tool's output.</li>
                        <li>The creator of this tool assumes no liability for any misuse or damage caused by this application.</li>
                    </ul>
                </main>

                <footer className="p-4 bg-black/10 dark:bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-text-tertiary flex items-center gap-1.5">
                        Made with <HeartIcon className="h-4 w-4 text-red-400"/> by Albert C @yz9yt
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onReject}
                            className="px-6 py-2 bg-red-800/60 text-red-200 font-bold rounded-lg transition-all transform hover:scale-105 hover:bg-red-800/80"
                        >
                            Reject
                        </button>
                        <button
                            onClick={onAccept}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
                        >
                            Accept & Continue
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};