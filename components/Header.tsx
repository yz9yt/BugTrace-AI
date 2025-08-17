// @author: Albert C | @yz9yt | github.com/yz9yt
// version 0.1 Beta
import React from 'react';
import { AiBrainIcon, MenuIcon, BookOpenIcon, ChatIcon, CogIcon, SunIcon } from './Icons.tsx';
import { useApiStatus } from '../hooks/useApiStatus.ts';
import { abortCurrentRequest } from '../utils/apiManager.ts';

interface HeaderProps {
    onMenuClick: () => void;
    onSettingsClick: () => void;
    onUserDocsClick: () => void;
    onShowAgent: () => void;
    onGoHome: () => void;
    onLightModeClick: () => void;
}

const StopIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.25 5.25a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 .75.75h12a.75.75 0 0 0 .75-.75v-12a.75.75 0 0 0-.75-.75H5.25z" clipRule="evenodd" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ onMenuClick, onSettingsClick, onUserDocsClick, onShowAgent, onGoHome, onLightModeClick }) => {
    const { apiCallCount, isApiRequestActive, isStopping } = useApiStatus();

    return (
        <header className="sticky top-0 z-30 w-full bg-glass-bg backdrop-blur-lg border-b border-glass-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onMenuClick} 
                            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                            aria-label="Open menu"
                            title="Open menu"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                           <button onClick={onGoHome} className="flex items-center gap-2" aria-label="Go to homepage" title="Go to homepage and reset view">
                               <AiBrainIcon className="h-8 w-8 text-cyan-400" />
                               <span className="text-xl font-bold text-text-primary hidden sm:block">BugTrace-AI</span>
                           </button>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={onShowAgent}
                                className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                                 aria-label="Open WebSec Agent"
                                 title="Open WebSec Agent"
                            >
                                <ChatIcon className="h-6 w-6" />
                            </button>
                            <button 
                                onClick={onUserDocsClick}
                                className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                                 aria-label="Open documentation"
                                 title="Open documentation"
                            >
                                <BookOpenIcon className="h-6 w-6" />
                            </button>
                            <button
                                onClick={onLightModeClick}
                                className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                                aria-label="Toggle light mode"
                                title="Light Mode"
                            >
                                <SunIcon className="h-6 w-6" />
                            </button>
                            <button 
                                onClick={onSettingsClick}
                                className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                                 aria-label="Open settings"
                                 title="Open settings"
                            >
                                <CogIcon className="h-6 w-6" />
                            </button>
                            
                            <button
                                onClick={abortCurrentRequest}
                                disabled={!isApiRequestActive && !isStopping}
                                className={`rounded-md transition-colors text-sm font-semibold flex items-center justify-center ${
                                    isApiRequestActive 
                                    ? 'p-1 bg-red-900/50 text-red-400 hover:bg-red-900/80 animate-pulse' 
                                    : isStopping
                                    ? 'px-4 py-2 bg-yellow-900/50 text-yellow-400 cursor-wait'
                                    : 'p-1 bg-gray-800/30 text-gray-600 cursor-not-allowed'
                                }`}
                                aria-label="Stop current request"
                                title="Stop current request"
                            >
                                {isStopping ? 'Stopping...' : <StopIcon className="h-7 w-7" />}
                            </button>
                        </div>
                        <div className="text-[8px] text-text-tertiary font-mono mt-1.5 pr-1">
                            API Calls: {apiCallCount}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}