// hooks/useWebSecAgent.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, Vulnerability } from '../types.ts';
import { startGeneralChat, continueGeneralChat } from '../services/Service.ts';
import { getWebSecAgentSystemPrompt } from '../services/systemPrompts.ts';
import { useApiOptions } from './useApiOptions.ts';

export const useWebSecAgent = (onShowApiKeyWarning: () => void) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { apiOptions, isApiKeySet } = useApiOptions();
    const isResponding = useRef(false);

    // This useEffect handles the actual API call when messages change
    useEffect(() => {
        const processMessageQueue = async () => {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'user' && !isResponding.current) {
                isResponding.current = true;
                setIsLoading(true); // Set loading true here

                if (!isApiKeySet) {
                    setMessages(prev => [...prev, { role: 'model', content: "Error: API Key is not configured. Please set it in the settings." }]);
                    setIsLoading(false);
                    isResponding.current = false;
                    onShowApiKeyWarning();
                    return;
                }

                try {
                    const historyForApi = messages.slice(0, -1);
                    const responseText = historyForApi.length === 0
                        ? await startGeneralChat(getWebSecAgentSystemPrompt(), lastMessage.content, apiOptions!)
                        : await continueGeneralChat(getWebSecAgentSystemPrompt(), historyForApi, lastMessage.content, apiOptions!);
                    
                    setMessages(prev => [...prev, { role: 'model', content: responseText }]);
                } catch (e: any) {
                    const errorMessage = e.message || "Failed to get response.";
                    if (errorMessage !== "Request cancelled.") {
                        setMessages(prev => [...prev, { role: 'model', content: `Error: ${errorMessage}` }]);
                    } else {
                        setMessages(prev => prev.slice(0, -1)); // remove user message on cancel
                    }
                } finally {
                    setIsLoading(false);
                    isResponding.current = false;
                }
            }
        };

        processMessageQueue();

    }, [messages, apiOptions, isApiKeySet, onShowApiKeyWarning]);
    
    // Function for user to send a message from the chat input
    const sendMessage = useCallback((message: string) => {
        if (isLoading || !message.trim()) return;
        const newUserMessage: ChatMessage = { role: 'user', content: message };
        setMessages(prev => [...prev, newUserMessage]);
    }, [isLoading]);

    // Function to start a new conversation with context from a vulnerability
    const startAnalysisWithAgent = useCallback((vulnerability: Vulnerability, analyzedTarget: string) => {
        const contextPrompt = `I need to analyze this vulnerability. Please provide a detailed breakdown, suggest exploitation techniques, and offer mitigation advice.\n\n**Vulnerability:** ${vulnerability.vulnerability}\n**Severity:** ${vulnerability.severity}\n**Target:** ${analyzedTarget}\n**Description:** ${vulnerability.description}\n**Payload/Pattern:** \`\`\`\n${vulnerability.vulnerableCode}\n\`\`\``;
        setMessages([{ role: 'user', content: contextPrompt }]);
    }, []);

    // Function to start a new conversation with context from a report
    const startReportAnalysisWithAgent = useCallback((reportText: string, analysisType: string) => {
        const contextPrompt = `I need to analyze this report from a "${analysisType}" scan. Please provide a detailed breakdown, suggest next steps for manual testing, and offer mitigation advice.\n\n**Report:**\n${reportText}`;
        setMessages([{ role: 'user', content: contextPrompt }]);
    }, []);

    return {
        messages,
        isLoading,
        sendMessage,
        startAnalysisWithAgent,
        startReportAnalysisWithAgent,
    };
};
