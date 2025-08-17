// contexts/SettingsProvider.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ApiKeys } from '../types.ts';
import { OPEN_ROUTER_MODELS } from '../constants.ts';

interface SettingsContextType {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    apiKeys: ApiKeys;
    setApiKeys: (keys: ApiKeys) => void;
    openRouterModel: string;
    setOpenRouterModel: (model: string) => void;
    saveApiKeys: boolean;
    setSaveApiKeys: (save: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [apiKeys, setApiKeys] = useState<ApiKeys>({ openrouter: '' });
    const [openRouterModel, setOpenRouterModel] = useState<string>(OPEN_ROUTER_MODELS[0]);
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
                if (savedKeys) setApiKeys(JSON.parse(savedKeys));
            }
            
            const savedModel = localStorage.getItem('openRouterModel');
            if (savedModel) setOpenRouterModel(savedModel);

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
        try { localStorage.setItem('openRouterModel', openRouterModel); }
        catch (e) { console.error("Could not save model:", e); }
    }, [openRouterModel]);
    
    const value = useMemo(() => ({
        theme, setTheme,
        apiKeys, setApiKeys,
        openRouterModel, setOpenRouterModel,
        saveApiKeys, setSaveApiKeys,
    }), [theme, apiKeys, openRouterModel, saveApiKeys]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};