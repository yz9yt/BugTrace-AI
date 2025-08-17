// components/ChatLayout.tsx
import React, { useEffect, useRef } from 'react';

interface ChatLayoutProps {
    header: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ header, children, footer }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever children (messages) change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ 
                top: chatContainerRef.current.scrollHeight, 
                behavior: 'smooth' 
            });
        }
    }, [children]);

    return (
        <div className="bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col flex-1 min-h-0">
            <header className="flex-shrink-0 p-4 border-b border-glass-border">
                {header}
            </header>

            <main ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {children}
            </main>

            <footer className="flex-shrink-0 p-4 border-t border-glass-border">
                {footer}
            </footer>
        </div>
    );
};