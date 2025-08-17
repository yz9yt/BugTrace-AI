// components/DevDocumentationModal.tsx
import React from 'react';
import { XMarkIcon, BookOpenIcon } from './Icons.tsx';

interface DevDocumentationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DevDocumentationModal: React.FC<DevDocumentationModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/10 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-glass-border bg-glass-bg/80 backdrop-blur-lg">
                    <div className="flex items-center gap-3">
                        <BookOpenIcon className="h-6 w-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-text-primary">Developer Documentation</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Close documentation">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-1 bg-gray-800/20">
                    <iframe
                        src="/devinfo/devinfo.html"
                        title="Developer Documentation"
                        className="w-full h-full border-none"
                    />
                </main>
            </div>
        </div>
    );
};