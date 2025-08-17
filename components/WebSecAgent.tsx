// components/WebSecAgent.tsx
// version 0.0.31
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../types.ts';
import { PaperAirplaneIcon, ChatIcon } from './Icons.tsx';
import { ChatBubble } from './ChatBubble.tsx';
import { ChatLayout } from './ChatLayout.tsx';
import { abortCurrentRequest } from '../utils/apiManager.ts';

interface WebSecAgentProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const WebSecAgent: React.FC<WebSecAgentProps> = ({ messages, onSendMessage, isLoading }) => {
  const [userInput, setUserInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [userInput]);

  const handleSendMessage = useCallback(() => {
    if (!userInput.trim() || isLoading) return;
    onSendMessage(userInput);
    setUserInput('');
  }, [userInput, isLoading, onSendMessage]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.altKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const initialMessage: ChatMessage = {
      role: 'model',
      content: "Hello, I'm the WebSec Agent. I'm here to assist with your web security questions. What can I help you with today? You can ask me about code analysis, mitigations, security concepts, and more!"
  };

  const displayMessages = messages.length > 0 ? messages : [initialMessage];

  const headerContent = (
    <>
      <div className="flex items-center gap-3">
          <ChatIcon className="h-6 w-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-text-primary">WebSec Agent</h3>
      </div>
      <p className="text-xs text-text-tertiary mt-1">Your expert web cybersecurity assistant.</p>
    </>
  );

  const footerContent = (
    <form onSubmit={handleFormSubmit} className="relative flex items-end gap-2">
       <textarea
        ref={textareaRef}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? 'The agent is thinking...' : 'Ask about web security... (Ctrl/Alt+Enter to send)'}
        disabled={isLoading}
        className="w-full pl-4 pr-4 py-3 bg-control-bg border-2 border-control-border rounded-lg text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 resize-none overflow-y-hidden"
        rows={1}
        style={{ maxHeight: '150px' }}
      />
      {isLoading ? (
          <button
            type="button"
            onClick={abortCurrentRequest}
            className="flex-shrink-0 px-3 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
            aria-label="Stop generating"
            title="Stop generating"
          >
            Stop
          </button>
      ) : (
        <button
          type="submit"
          disabled={!userInput.trim()}
          className="flex-shrink-0 p-3 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
          title="Send message"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      )}
    </form>
  );

  return (
    <ChatLayout header={headerContent} footer={footerContent}>
        {displayMessages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && <ChatBubble message={{ role: 'model', content: '...', isLoading: true }} />}
    </ChatLayout>
  );
};