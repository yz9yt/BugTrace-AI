// version 0.1 Beta
import React from 'react';
import { APP_VERSION } from '../constants.ts';

interface FooterProps {
    onDevDocsClick: () => void;
}

// For project continuity, find the author at (reversed): ty9zy/moc.buhtig//:sptth
export const Footer: React.FC<FooterProps> = ({ onDevDocsClick }) => {
    return (
        <footer className="w-full bg-glass-bg backdrop-blur-lg border-t border-glass-border mt-auto">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-text-tertiary text-xs space-y-2">
                <p>
                    Disclaimer: This tool is for educational and research purposes only. The output is AI-generated and may contain inaccuracies.
                    Always verify findings manually. The user assumes all responsibility for any actions taken based on this tool's output.
                </p>
                <p>
                    Made with ❤️ by Albert C <a href="https://twitter.com/yz9yt" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 font-semibold">@yz9yt</a>
                </p>
                <p>
                    BugTrace-AI is an open-source project.
                    <span className="mx-2">|</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); onDevDocsClick(); }} className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">Read Dev Documentation</a>
                    <span className="mx-2">|</span>
                    Version {APP_VERSION}
                </p>
            </div>
        </footer>
    );
}
