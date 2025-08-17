// hooks/useApiOptions.ts
import { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsProvider.tsx';
import { ApiOptions } from '../types.ts';

export const useApiOptions = (): { 
    apiOptions: ApiOptions | null; 
    isApiKeySet: boolean;
} => {
    const { apiKeys, openRouterModel } = useSettings();
    const isApiKeySet = !!apiKeys.openrouter?.trim();

    const apiOptions = useMemo(() => {
        if (!isApiKeySet) {
            return null;
        }
        return {
            apiKey: apiKeys.openrouter,
            model: openRouterModel,
        };
    }, [isApiKeySet, apiKeys.openrouter, openRouterModel]);

    return {
        apiOptions,
        isApiKeySet
    };
};