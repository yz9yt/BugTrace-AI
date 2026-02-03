// contexts/SettingsProvider.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ApiKeys, LLMProvider } from '../types.ts';
import { PROVIDER_MODELS } from '../constants.ts';

interface SettingsContextType {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    apiKeys: ApiKeys;
    setApiKeys: (keys: ApiKeys) => void;
    selectedProvider: LLMProvider;
    setSelectedProvider: (provider: LLMProvider) => void;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    // Legacy support for openRouterModel
    openRouterModel: string;
    setOpenRouterModel: (model: string) => void;
    saveApiKeys: boolean;
    setSaveApiKeys: (save: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [apiKeys, setApiKeys] = useState<ApiKeys>({
        openai: '',
        anthropic: '',
        google: '',
        openrouter: ''
    });
    const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openai');
    const [selectedModel, setSelectedModel] = useState<string>(PROVIDER_MODELS.openai[0]);
    const [saveApiKeys, setSaveApiKeys] = useState<boolean>(false);

    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
            if (savedTheme) {
                setTheme(savedTheme);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
            }

            const savedSavePref = localStorage.getItem('saveApiKeys') === 'true';
            setSaveApiKeys(savedSavePref);

            if (savedSavePref) {
                const savedKeys = localStorage.getItem('apiKeys');
                if (savedKeys) {
                    const parsed = JSON.parse(savedKeys);
                    // Migrate old format if needed
                    if (parsed.openrouter && !parsed.openai) {
                        setApiKeys({
                            openai: '',
                            anthropic: '',
                            google: '',
                            openrouter: parsed.openrouter
                        });
                    } else {
                        setApiKeys(parsed);
                    }
                }
            }

            const savedProvider = localStorage.getItem('selectedProvider') as LLMProvider | null;
            if (savedProvider) {
                setSelectedProvider(savedProvider);
            }

            const savedModel = localStorage.getItem('selectedModel');
            if (savedModel) {
                setSelectedModel(savedModel);
            }

        } catch (e) { console.error("Could not load settings:", e); }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        try { localStorage.setItem('theme', theme); }
        catch (e) { console.error("Could not save theme:", e); }
    }, [theme]);

    useEffect(() => {
        try {
            localStorage.setItem('saveApiKeys', String(saveApiKeys));
            if (saveApiKeys) {
                localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
            } else {
                localStorage.removeItem('apiKeys');
            }
        } catch (e) { console.error("Could not save API key settings:", e); }
    }, [saveApiKeys, apiKeys]);

    useEffect(() => {
        try { localStorage.setItem('selectedProvider', selectedProvider); }
        catch (e) { console.error("Could not save provider:", e); }
    }, [selectedProvider]);

    useEffect(() => {
        try { localStorage.setItem('selectedModel', selectedModel); }
        catch (e) { console.error("Could not save model:", e); }
    }, [selectedModel]);

    const value = useMemo(() => ({
        theme, setTheme,
        apiKeys, setApiKeys,
        selectedProvider, setSelectedProvider,
        selectedModel, setSelectedModel,
        // Legacy support
        openRouterModel: selectedModel,
        setOpenRouterModel: setSelectedModel,
        saveApiKeys, setSaveApiKeys,
    }), [theme, apiKeys, selectedProvider, selectedModel, saveApiKeys]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};