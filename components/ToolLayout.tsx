// components/ToolLayout.tsx
import React from 'react';

interface ToolLayoutProps {
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ icon, title, description, children }) => {
    return (
        <div className="bg-glass-bg backdrop-blur-xl rounded-xl border border-glass-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col flex-1 min-h-0">
            {/* Header section */}
            <div className="flex-shrink-0 p-6 sm:p-8 text-center border-b border-glass-border">
                <div className="h-12 w-12 mx-auto text-cyan-400 mb-4 flex items-center justify-center">
                    {icon}
                </div>
                <h3 className="text-2xl font-bold text-text-primary">{title}</h3>
                <p className="text-text-secondary mt-2 max-w-3xl mx-auto">
                    {description}
                </p>
            </div>
            
            {/* Scrollable content area */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};