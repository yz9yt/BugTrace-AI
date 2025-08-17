// components/NoLightModeModal.tsx
import React from 'react';
import { SunIcon } from './Icons.tsx';

interface NoLightModeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NoLightModeModal: React.FC<NoLightModeModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl w-full max-w-md shadow-2xl shadow-cyan-500/10 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-glass-border bg-glass-bg/80">
                    <SunIcon className="h-6 w-6 text-yellow-300" />
                    <h2 className="text-xl font-bold text-text-primary">A Message From the Shadows</h2>
                </header>

                <main className="p-6 text-text-secondary text-center">
                     <p className="text-lg">No light mode here!</p>
                     <p className="mt-2 text-sm">This is a hacker's tool. We thrive in the darkness.</p>
                </main>

                <footer className="p-4 bg-black/10 dark:bg-black/20 flex justify-center items-center">
                     <button
                        onClick={onClose}
                        className="px-8 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
                    >
                        Got it
                    </button>
                </footer>
            </div>
        </div>
    );
};
