// components/SettingsModal.tsx
// version 0.0.46
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, CogIcon, CheckCircleIcon, ArrowPathIcon } from './Icons.tsx';
import { Spinner } from './Spinner.tsx';
import { useSettings } from '../contexts/SettingsProvider.tsx';
import { testApi } from '../services/Service.ts';
import { OPEN_ROUTER_MODELS } from '../constants.ts';
import type { ApiKeys } from '../types.ts';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { 
        apiKeys: globalApiKeys, setApiKeys: setGlobalApiKeys, 
        openRouterModel: globalOpenRouterModel, setOpenRouterModel: setGlobalOpenRouterModel,
        saveApiKeys: globalSaveApiKeys, setSaveApiKeys: setGlobalSaveApiKeys
    } = useSettings();

    // Local state for the modal form
    const [localApiKeys, setLocalApiKeys] = useState<ApiKeys>(globalApiKeys);
    const [localOpenRouterModel, setLocalOpenRouterModel] = useState(globalOpenRouterModel);
    const [localSaveApiKeys, setLocalSaveApiKeys] = useState(globalSaveApiKeys);

    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
    const [isKeyValidated, setIsKeyValidated] = useState(false);
    const openRouterInputRef = useRef<HTMLInputElement>(null);

    // State for dynamic OpenRouter models
    const [openRouterModels, setOpenRouterModels] = useState<string[]>(OPEN_ROUTER_MODELS);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [fetchModelsError, setFetchModelsError] = useState<string | null>(null);

    // Sync local state with global context when modal opens or global state changes
    useEffect(() => {
        if (isOpen) {
            setLocalApiKeys(globalApiKeys);
            setLocalOpenRouterModel(globalOpenRouterModel);
            setLocalSaveApiKeys(globalSaveApiKeys);
            setTestResult(null);
            setIsKeyValidated(false);
        }
    }, [isOpen, globalApiKeys, globalOpenRouterModel, globalSaveApiKeys]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                openRouterInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const fetchOpenRouterModels = useCallback(async (force = false) => {
        setIsFetchingModels(true);
        setFetchModelsError(null);

        if (!force) {
            try {
                const cachedData = localStorage.getItem('openRouterModelsCache');
                if (cachedData) {
                    const { models, timestamp } = JSON.parse(cachedData);
                    const isCacheValid = (new Date().getTime() - timestamp) < 24 * 60 * 60 * 1000; // 24 hours
                    if (isCacheValid && models && models.length > 0) {
                        setOpenRouterModels(models);
                        setIsFetchingModels(false);
                        return;
                    }
                }
            } catch (e) { console.error("Failed to read model cache", e); }
        }
        
        try {
            const response = await fetch("https://openrouter.ai/api/v1/models");
            if (!response.ok) throw new Error(`OpenRouter API failed with status ${response.status}`);
            
            const data = await response.json();
            const modelIds = Array.isArray(data?.data) 
                ? data.data.map((model: any) => model.id).sort()
                : [];
            
            if (modelIds.length === 0) {
                throw new Error("API returned no models or an unexpected format.");
            }

            setOpenRouterModels(modelIds);
            if (!modelIds.includes(localOpenRouterModel)) {
                const newDefault = 'google/gemini-2.5-flash';
                setLocalOpenRouterModel(modelIds.includes(newDefault) ? newDefault : modelIds[0]);
            }
            
            try {
                const cacheData = { models: modelIds, timestamp: new Date().getTime() };
                localStorage.setItem('openRouterModelsCache', JSON.stringify(cacheData));
            } catch(e) { console.error("Failed to write model cache", e); }
        } catch (e: any) {
            setFetchModelsError(e.message || "Failed to fetch model list.");
            setOpenRouterModels(OPEN_ROUTER_MODELS); // Fallback to constant
        } finally {
            setIsFetchingModels(false);
        }
    }, [localOpenRouterModel]);

    useEffect(() => {
        if (isOpen) {
            fetchOpenRouterModels();
        }
    }, [isOpen, fetchOpenRouterModels]);

    const handleSaveSettings = () => {
        // Only require validation if a key is actually present. Allows saving an empty key.
        if (localApiKeys.openrouter.trim() && !isKeyValidated) {
            setTestResult({success: false, message: 'Please validate the new API key successfully before saving.'});
            return;
        }
        setGlobalApiKeys(localApiKeys);
        setGlobalOpenRouterModel(localOpenRouterModel);
        setGlobalSaveApiKeys(localSaveApiKeys);
        onClose();
    };
    
    const handleTestApi = async () => {
        const keyToTest = localApiKeys.openrouter;
        const modelToTest = localOpenRouterModel;

        if (!keyToTest) {
            setTestResult({ success: false, message: 'API Key must be provided.' });
            return;
        }
        setIsKeyValidated(false);
        setIsTesting(true);
        setTestResult(null);
        const result = await testApi(keyToTest, modelToTest);
        setIsTesting(false);
        setTestResult({ success: result.success, message: result.success ? 'API connection successful!' : `Test failed: ${result.error}` });
        if (result.success) {
            setIsKeyValidated(true);
        }
    };
    
    if (!isOpen) return null;

    const currentKey = localApiKeys.openrouter;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-purple-500/10 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-glass-border">
                    <div className="flex items-center gap-3">
                        <CogIcon className="h-6 w-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-text-primary">API Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-white/10 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>
                <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label htmlFor="openrouterApiKey" className="block text-sm font-medium text-text-secondary mb-2">
                            OpenRouter API Key
                        </label>
                        <div className="relative">
                            <input
                                ref={openRouterInputRef}
                                id="openrouterApiKey"
                                type="password"
                                value={localApiKeys.openrouter}
                                onChange={(e) => {
                                    setLocalApiKeys({ openrouter: e.target.value });
                                    setIsKeyValidated(false);
                                    setTestResult(null);
                                }}
                                placeholder="Enter your OpenRouter key (sk-or-v1...)"
                                className="w-full pl-4 pr-12 py-2 bg-control-bg border-2 border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors"
                            />
                            {isKeyValidated && localApiKeys.openrouter && (
                                <CheckCircleIcon className="absolute top-1/2 right-3 -translate-y-1/2 h-6 w-6 text-green-400" title="This key has been validated." />
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="model-select" className="block text-sm font-medium text-text-secondary mb-2">
                            Select Model
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <select
                                id="model-select"
                                value={localOpenRouterModel}
                                onChange={(e) => setLocalOpenRouterModel(e.target.value)}
                                className="w-full flex-grow p-2 bg-control-bg border-2 border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors"
                                disabled={isFetchingModels}
                            >
                                {openRouterModels.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                            <button onClick={() => fetchOpenRouterModels(true)} disabled={isFetchingModels} className="w-full sm:w-auto flex justify-center p-2 bg-control-bg border-2 border-control-border rounded-lg text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50" title="Refresh model list">
                                {isFetchingModels ? <Spinner /> : <ArrowPathIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        {fetchModelsError && <p className="text-red-400 text-xs mt-2">{fetchModelsError}</p>}
                        <p className="text-xs text-text-tertiary mt-2">
                            <strong className="text-cyan-400">Recommendation:</strong> For best results, use <code>google/gemini-2.5-flash</code>. The prompts in this tool have been highly optimized for it.
                        </p>
                    </div>

                    <div>
                        <button
                            onClick={handleTestApi}
                            disabled={isTesting || !currentKey}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-900/40 border border-cyan-700/80 rounded-lg hover:bg-cyan-900/60 disabled:opacity-60 disabled:cursor-wait transition-colors"
                        >
                            {isTesting ? <Spinner /> : 'Test API Connection'}
                        </button>
                        {testResult && (
                            <p className={`mt-3 text-sm text-center ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                {testResult.message}
                            </p>
                        )}
                    </div>

                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="save-api-keys"
                                name="save-api-keys"
                                type="checkbox"
                                checked={localSaveApiKeys}
                                onChange={(e) => setLocalSaveApiKeys(e.target.checked)}
                                className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-500 rounded bg-control-bg"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="save-api-keys" className="font-medium text-text-primary">
                                Save API key in your browser
                            </label>
                            <p className="text-text-tertiary">The key will be stored in localStorage. Use this only on a trusted device.</p>
                        </div>
                    </div>
                </main>

                <footer className="flex-shrink-0 p-4 bg-black/20 flex justify-end items-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500/20 text-text-secondary font-bold rounded-lg transition-all transform hover:scale-105 hover:bg-gray-500/30"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveSettings}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
                    >
                        Save & Close
                    </button>
                </footer>
            </div>
        </div>
    );
};