// hooks/useApiOptions.ts
import { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsProvider.tsx';
import { ApiOptions } from '../types.ts';

export const useApiOptions = (): { 
    apiOptions: ApiOptions | null; 
    isApiKeySet: boolean;
} => {
    const { apiProvider, apiKeys, openRouterModel, localAiConfig } = useSettings();

    const isApiKeySet = useMemo(() => {
        switch (apiProvider) {
            case 'openrouter':
                return !!apiKeys.openrouter?.trim();
            case 'localai':
                // For local AI, we just need a base URL (API key is optional)
                return !!localAiConfig.baseUrl?.trim();
            default:
                return false;
        }
    }, [apiProvider, apiKeys, localAiConfig.baseUrl]);

    const apiOptions = useMemo(() => {
        if (!isApiKeySet) {
            return null;
        }

        switch (apiProvider) {
            case 'openrouter':
                return {
                    provider: 'openrouter' as const,
                    apiKey: apiKeys.openrouter,
                    model: openRouterModel,
                };
            case 'localai':
                return {
                    provider: 'localai' as const,
                    apiKey: apiKeys.localai || '',
                    model: localAiConfig.model,
                    baseUrl: localAiConfig.baseUrl,
                };
            default:
                return null;
        }
    }, [isApiKeySet, apiProvider, apiKeys, openRouterModel, localAiConfig]);

    return {
        apiOptions,
        isApiKeySet
    };
};
