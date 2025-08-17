// components/ChatBubble.tsx
import React from 'react';
import { ChatMessage } from '../types.ts';
import { AiBrainIcon } from './Icons.tsx';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';

export const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';

    return (
        <div className={`w-full bg-control-bg/${isModel ? '50' : '80'} border border-glass-border rounded-lg overflow-hidden`}>
            {/* Header */}
            <div className={`flex items-center gap-2 px-4 py-2 bg-black/10 ${isModel ? 'text-cyan-300' : 'text-purple-300'}`}>
                {isModel && <AiBrainIcon className="h-4 w-4" />}
                <span className="text-xs font-semibold uppercase tracking-wider">{message.role}</span>
            </div>
            {/* Content */}
            <div className="p-4">
                {message.isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                    </div>
                ) : (
                     <MarkdownRenderer content={message.content} />
                )}
            </div>
        </div>
    );
};
