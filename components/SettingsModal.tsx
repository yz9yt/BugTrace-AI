// components/SettingsModal.tsx
// version 0.1.0
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, CogIcon, CheckCircleIcon, ArrowPathIcon } from './Icons.tsx';
import { Spinner } from './Spinner.tsx';
import { useSettings } from '../contexts/SettingsProvider.tsx';
import { testApi } from '../services/Service.ts';
import { PROVIDER_MODELS } from '../constants.ts';
import type { ApiKeys, LLMProvider } from '../types.ts';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROVIDER_LABELS: Record<LLMProvider, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google AI',
    openrouter: 'OpenRouter',
};

const PROVIDER_KEY_PLACEHOLDERS: Record<LLMProvider, string> = {
    openai: 'sk-...',
    anthropic: 'sk-ant-...',
    google: 'AIza...',
    openrouter: 'sk-or-v1...',
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const {
        apiKeys: globalApiKeys, setApiKeys: setGlobalApiKeys,
        selectedProvider: globalSelectedProvider, setSelectedProvider: setGlobalSelectedProvider,
        selectedModel: globalSelectedModel, setSelectedModel: setGlobalSelectedModel,
        saveApiKeys: globalSaveApiKeys, setSaveApiKeys: setGlobalSaveApiKeys
    } = useSettings();

    // Local state for the modal form
    const [localApiKeys, setLocalApiKeys] = useState<ApiKeys>(globalApiKeys);
    const [localSelectedProvider, setLocalSelectedProvider] = useState<LLMProvider>(globalSelectedProvider);
    const [localSelectedModel, setLocalSelectedModel] = useState(globalSelectedModel);
    const [localSaveApiKeys, setLocalSaveApiKeys] = useState(globalSaveApiKeys);

    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
    const [isKeyValidated, setIsKeyValidated] = useState(false);
    const apiKeyInputRef = useRef<HTMLInputElement>(null);

    // State for dynamic OpenRouter models
    const [openRouterModels, setOpenRouterModels] = useState<string[]>(PROVIDER_MODELS.openrouter);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [fetchModelsError, setFetchModelsError] = useState<string | null>(null);

    // Get current models list based on provider
    const currentModels = localSelectedProvider === 'openrouter' ? openRouterModels : PROVIDER_MODELS[localSelectedProvider];

    // Sync local state with global context when modal opens or global state changes
    useEffect(() => {
        if (isOpen) {
            setLocalApiKeys(globalApiKeys);
            setLocalSelectedProvider(globalSelectedProvider);
            setLocalSelectedModel(globalSelectedModel);
            setLocalSaveApiKeys(globalSaveApiKeys);
            setTestResult(null);
            setIsKeyValidated(false);
        }
    }, [isOpen, globalApiKeys, globalSelectedProvider, globalSelectedModel, globalSaveApiKeys]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                apiKeyInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Update selected model when provider changes
    useEffect(() => {
        const models = localSelectedProvider === 'openrouter' ? openRouterModels : PROVIDER_MODELS[localSelectedProvider];
        if (!models.includes(localSelectedModel)) {
            setLocalSelectedModel(models[0]);
        }
    }, [localSelectedProvider, localSelectedModel, openRouterModels]);

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

            try {
                const cacheData = { models: modelIds, timestamp: new Date().getTime() };
                localStorage.setItem('openRouterModelsCache', JSON.stringify(cacheData));
            } catch(e) { console.error("Failed to write model cache", e); }
        } catch (e: any) {
            setFetchModelsError(e.message || "Failed to fetch model list.");
            setOpenRouterModels(PROVIDER_MODELS.openrouter); // Fallback to constant
        } finally {
            setIsFetchingModels(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && localSelectedProvider === 'openrouter') {
            fetchOpenRouterModels();
        }
    }, [isOpen, localSelectedProvider, fetchOpenRouterModels]);

    const handleSaveSettings = () => {
        const currentKey = localApiKeys[localSelectedProvider];
        // Only require validation if a key is actually present. Allows saving an empty key.
        if (currentKey.trim() && !isKeyValidated) {
            setTestResult({success: false, message: 'Please validate the new API key successfully before saving.'});
            return;
        }
        setGlobalApiKeys(localApiKeys);
        setGlobalSelectedProvider(localSelectedProvider);
        setGlobalSelectedModel(localSelectedModel);
        setGlobalSaveApiKeys(localSaveApiKeys);
        onClose();
    };

    const handleTestApi = async () => {
        const keyToTest = localApiKeys[localSelectedProvider];
        const modelToTest = localSelectedModel;

        if (!keyToTest) {
            setTestResult({ success: false, message: 'API Key must be provided.' });
            return;
        }
        setIsKeyValidated(false);
        setIsTesting(true);
        setTestResult(null);
        const result = await testApi(keyToTest, modelToTest, localSelectedProvider);
        setIsTesting(false);
        setTestResult({ success: result.success, message: result.success ? 'API connection successful!' : `Test failed: ${result.error}` });
        if (result.success) {
            setIsKeyValidated(true);
        }
    };

    const handleProviderChange = (provider: LLMProvider) => {
        setLocalSelectedProvider(provider);
        setIsKeyValidated(false);
        setTestResult(null);
    };

    const handleApiKeyChange = (value: string) => {
        setLocalApiKeys({ ...localApiKeys, [localSelectedProvider]: value });
        setIsKeyValidated(false);
        setTestResult(null);
    };

    if (!isOpen) return null;

    const currentKey = localApiKeys[localSelectedProvider];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-purple-500/10 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
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
                        <label htmlFor="provider-select" className="block text-sm font-medium text-text-secondary mb-2">
                            LLM Provider
                        </label>
                        <select
                            id="provider-select"
                            value={localSelectedProvider}
                            onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
                            className="w-full p-2 bg-control-bg border-2 border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors"
                        >
                            {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-text-tertiary mt-2">
                            Select which LLM provider you want to use. Each provider requires its own API key.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-text-secondary mb-2">
                            {PROVIDER_LABELS[localSelectedProvider]} API Key
                        </label>
                        <div className="relative">
                            <input
                                ref={apiKeyInputRef}
                                id="apiKey"
                                type="password"
                                value={currentKey}
                                onChange={(e) => handleApiKeyChange(e.target.value)}
                                placeholder={`Enter your ${PROVIDER_LABELS[localSelectedProvider]} key (${PROVIDER_KEY_PLACEHOLDERS[localSelectedProvider]})`}
                                className="w-full pl-4 pr-12 py-2 bg-control-bg border-2 border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors"
                            />
                            {isKeyValidated && currentKey && (
                                <CheckCircleIcon className="absolute top-1/2 right-3 -translate-y-1/2 h-6 w-6 text-green-400" title="This key has been validated." />
                            )}
                        </div>
                        <p className="text-xs text-text-tertiary mt-2">
                            Get your API key from: {' '}
                            {localSelectedProvider === 'openai' && <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">OpenAI Platform</a>}
                            {localSelectedProvider === 'anthropic' && <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Anthropic Console</a>}
                            {localSelectedProvider === 'google' && <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a>}
                            {localSelectedProvider === 'openrouter' && <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">OpenRouter</a>}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="model-select" className="block text-sm font-medium text-text-secondary mb-2">
                            Select Model
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <select
                                id="model-select"
                                value={localSelectedModel}
                                onChange={(e) => setLocalSelectedModel(e.target.value)}
                                className="w-full flex-grow p-2 bg-control-bg border-2 border-control-border rounded-lg text-text-primary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-colors"
                                disabled={isFetchingModels && localSelectedProvider === 'openrouter'}
                            >
                                {currentModels.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                            {localSelectedProvider === 'openrouter' && (
                                <button
                                    onClick={() => fetchOpenRouterModels(true)}
                                    disabled={isFetchingModels}
                                    className="w-full sm:w-auto flex justify-center p-2 bg-control-bg border-2 border-control-border rounded-lg text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                                    title="Refresh model list"
                                >
                                    {isFetchingModels ? <Spinner /> : <ArrowPathIcon className="h-5 w-5" />}
                                </button>
                            )}
                        </div>
                        {fetchModelsError && localSelectedProvider === 'openrouter' && <p className="text-red-400 text-xs mt-2">{fetchModelsError}</p>}
                        <p className="text-xs text-text-tertiary mt-2">
                            <strong className="text-cyan-400">Note:</strong> The prompts in this tool are optimized for capable models. For best results, use:
                            {' '}{localSelectedProvider === 'openai' && 'GPT-4o or GPT-4 Turbo'}
                            {localSelectedProvider === 'anthropic' && 'Claude 3.5 Sonnet or Claude 3 Opus'}
                            {localSelectedProvider === 'google' && 'Gemini 1.5 Pro or Gemini 2.0 Flash'}
                            {localSelectedProvider === 'openrouter' && 'google/gemini-2.5-flash'}
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
                                Save API keys in your browser
                            </label>
                            <p className="text-text-tertiary">Keys will be stored in localStorage. Use this only on a trusted device.</p>
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
