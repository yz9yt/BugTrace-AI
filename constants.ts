// @author: Albert C | @yz9yt | github.com/yz9yt
// version 0.1 Beta
import { Severity } from './types.ts';

export const APP_VERSION = '0.1.2 Beta';

// This now serves as a fallback list in case the API fetch fails.
export const OPEN_ROUTER_MODELS = [
    'google/gemini-2.5-flash',
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o',
    'mistralai/mistral-large',
    'openai/gpt-3.5-turbo',
];

// Default Local AI / LiteLLM settings
export const DEFAULT_LOCAL_AI_URL = 'http://localhost:4000/v1/chat/completions';
export const DEFAULT_LOCAL_AI_MODEL = 'gpt-3.5-turbo';

// API Provider labels for UI
export const API_PROVIDER_LABELS = {
    openrouter: 'OpenRouter',
    localai: 'Local AI / LiteLLM',
} as const;


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