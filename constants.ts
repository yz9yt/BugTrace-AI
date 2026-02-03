// @author: Albert C | @yz9yt | github.com/yz9yt
// version 0.1 Beta
import { Severity, LLMProvider } from './types.ts';

export const APP_VERSION = '0.1.3 Beta';

// Provider-specific API endpoints
export const API_ENDPOINTS: Record<LLMProvider, string> = {
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    google: 'https://generativelanguage.googleapis.com/v1beta/models',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

// Provider-specific models
export const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
    openai: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo',
    ],
    anthropic: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
    ],
    google: [
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro',
    ],
    openrouter: [
        'google/gemini-2.5-flash',
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4o',
        'mistralai/mistral-large',
        'openai/gpt-3.5-turbo',
    ],
};

// This now serves as a fallback list in case the API fetch fails (for OpenRouter)
export const OPEN_ROUTER_MODELS = PROVIDER_MODELS.openrouter;


export const SEVERITY_STYLES: Record<Severity, { headerBg: string; border: string; text: string }> = {
  [Severity.CRITICAL]: {
    headerBg: 'bg-red-800/50',
    border: 'border-red-500/80',
    text: 'text-red-200'
  },
  [Severity.HIGH]: {
    headerBg: 'bg-orange-700/50',
    border: 'border-orange-500/80',
    text: 'text-orange-200'
  },
  [Severity.MEDIUM]: {
    headerBg: 'bg-yellow-700/50',
    border: 'border-yellow-500/80',
    text: 'text-yellow-200'
  },
  [Severity.LOW]: {
    headerBg: 'bg-cyan-800/50',
    border: 'border-cyan-500/80',
    text: 'text-cyan-200'
  },
  [Severity.INFO]: {
    headerBg: 'bg-green-800/50',
    border: 'border-green-500/80',
    text: 'text-green-200'
  },
  [Severity.UNKNOWN]: {
    headerBg: 'bg-gray-800/50',
    border: 'border-gray-500/80',
    text: 'text-gray-300'
  },
};