// components/ApiKeyWarningModal.tsx
import React from 'react';
import { CogIcon, ShieldExclamationIcon } from './Icons.tsx';

interface ApiKeyWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoToSettings: () => void;
}

export const ApiKeyWarningModal: React.FC<ApiKeyWarningModalProps> = ({ isOpen, onClose, onGoToSettings }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl shadow-yellow-500/10 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-glass-border bg-glass-bg/80">
                    <ShieldExclamationIcon className="h-6 w-6 text-yellow-400" />
                    <h2 className="text-xl font-bold text-text-primary">API Key Required</h2>
                </header>

                <main className="p-6 text-text-secondary text-center">
                     <p className="text-lg">An API key is required to use this feature.</p>
                     <p className="mt-2 text-sm">Please configure your API key in the settings menu to proceed.</p>
                </main>

                <footer className="p-4 bg-black/10 dark:bg-black/20 flex justify-end items-center gap-4">
                     <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500/20 text-text-secondary font-bold rounded-lg transition-all transform hover:scale-105 hover:bg-gray-500/30"
                    >
                        Close
                    </button>
                    <button
                        onClick={onGoToSettings}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
                    >
                        <CogIcon className="h-5 w-5" />
                        Go to Settings
                    </button>
                </footer>
            </div>
        </div>
    );
};