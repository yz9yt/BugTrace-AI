// hooks/useApiOptions.ts
import { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsProvider.tsx';
import { ApiOptions } from '../types.ts';

export const useApiOptions = (): {
    apiOptions: ApiOptions | null;
    isApiKeySet: boolean;
} => {
    const { apiKeys, selectedProvider, selectedModel } = useSettings();

    // Get the API key for the selected provider
    const currentApiKey = apiKeys[selectedProvider];
    const isApiKeySet = !!currentApiKey?.trim();

    const apiOptions = useMemo(() => {
        if (!isApiKeySet) {
            return null;
        }
        return {
            apiKey: currentApiKey,
            model: selectedModel,
            provider: selectedProvider,
        };
    }, [isApiKeySet, currentApiKey, selectedModel, selectedProvider]);

    return {
        apiOptions,
        isApiKeySet
    };
};