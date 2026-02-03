// contexts/SettingsProvider.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ApiKeys, ApiProvider, LocalAiConfig } from '../types.ts';
import { OPEN_ROUTER_MODELS, DEFAULT_LOCAL_AI_URL, DEFAULT_LOCAL_AI_MODEL } from '../constants.ts';

interface SettingsContextType {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    apiProvider: ApiProvider;
    setApiProvider: (provider: ApiProvider) => void;
    apiKeys: ApiKeys;
    setApiKeys: (keys: ApiKeys) => void;
    openRouterModel: string;
    setOpenRouterModel: (model: string) => void;
    localAiConfig: LocalAiConfig;
    setLocalAiConfig: (config: LocalAiConfig) => void;
    saveApiKeys: boolean;
    setSaveApiKeys: (save: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [apiProvider, setApiProvider] = useState<ApiProvider>('openrouter');
    const [apiKeys, setApiKeys] = useState<ApiKeys>({ openrouter: '', localai: '' });
    const [openRouterModel, setOpenRouterModel] = useState<string>(OPEN_ROUTER_MODELS[0]);
    const [localAiConfig, setLocalAiConfig] = useState<LocalAiConfig>({
        baseUrl: DEFAULT_LOCAL_AI_URL,
        model: DEFAULT_LOCAL_AI_MODEL,
    });
    const [saveApiKeys, setSaveApiKeys] = useState<boolean>(false);

    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
            if (savedTheme) {
                setTheme(savedTheme);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
            }

            const savedProvider = localStorage.getItem('apiProvider') as ApiProvider | null;
            if (savedProvider) setApiProvider(savedProvider);

            const savedSavePref = localStorage.getItem('saveApiKeys') === 'true';
            setSaveApiKeys(savedSavePref);

            if (savedSavePref) {
                const savedKeys = localStorage.getItem('apiKeys');
                if (savedKeys) setApiKeys(JSON.parse(savedKeys));
            }
            
            const savedOpenRouterModel = localStorage.getItem('openRouterModel');
            if (savedOpenRouterModel) setOpenRouterModel(savedOpenRouterModel);

            const savedLocalAiConfig = localStorage.getItem('localAiConfig');
            if (savedLocalAiConfig) setLocalAiConfig(JSON.parse(savedLocalAiConfig));

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
        try { localStorage.setItem('apiProvider', apiProvider); }
        catch (e) { console.error("Could not save API provider:", e); }
    }, [apiProvider]);

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
        try { localStorage.setItem('openRouterModel', openRouterModel); }
        catch (e) { console.error("Could not save OpenRouter model:", e); }
    }, [openRouterModel]);

    useEffect(() => {
        try { localStorage.setItem('localAiConfig', JSON.stringify(localAiConfig)); }
        catch (e) { console.error("Could not save Local AI config:", e); }
    }, [localAiConfig]);
    
    const value = useMemo(() => ({
        theme, setTheme,
        apiProvider, setApiProvider,
        apiKeys, setApiKeys,
        openRouterModel, setOpenRouterModel,
        localAiConfig, setLocalAiConfig,
        saveApiKeys, setSaveApiKeys,
    }), [theme, apiProvider, apiKeys, openRouterModel, localAiConfig, saveApiKeys]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
