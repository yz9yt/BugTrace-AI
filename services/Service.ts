// @author: Albert C | @yz9yt | github.com/yz9yt
// services/Service.ts
// version 0.2 Beta
import {
    ApiOptions, Vulnerability, VulnerabilityReport, XssPayloadResult, ForgedPayloadResult,
    ChatMessage, ExploitContext, HeadersReport, DomXssAnalysisResult,
    FileUploadAnalysisResult, DastScanType, SqlmapCommandResult,
    Severity, LLMProvider
} from '../types.ts';
import {
    createSastAnalysisPrompt,
    createSastDeepAnalysisPrompt,
    createDastAnalysisPrompt,
    createDeepAnalysisPrompt,
    createHeadersAnalysisPrompt,
    createJsReconPrompt,
    createDomXssPathfinderPrompt,
    createXssPayloadGenerationPrompt,
    createSqlmapCommandGenerationPrompt,
    createInitialExploitChatPrompt,
    createInitialSqlExploitChatPrompt,
    createPayloadForgePrompt,
    createSstiForgePrompt,
    createFileUploadAnalysisPrompt,
    createFileUploadAnalysisPromptAttempt2,
    createJwtBlueTeamPrompt,
    createJwtRedTeamPrompt,
    createConsolidationPrompt,
    createFixJsonPrompt,
    createPrivescPathfinderPrompt,
    createValidationPrompt
} from './prompts/index.ts';
import {
    enforceRateLimit,
    updateRateLimitTimestamp,
    incrementApiCallCount,
    getNewAbortSignal,
    setRequestStatus,
    clearAbortController,
    incrementContinuousFailureCount,
    resetContinuousFailureCount,
} from '../utils/apiManager.ts';
import { API_ENDPOINTS } from '../constants.ts';

// Helper function to get API endpoint based on provider
const getApiEndpoint = (provider: LLMProvider, model?: string): string => {
    if (provider === 'google' && model) {
        return `${API_ENDPOINTS.google}/${model}:generateContent`;
    }
    return API_ENDPOINTS[provider];
};

// Helper function to format request body for different providers
const formatRequestBody = (provider: LLMProvider, model: string, messages: any[], isJson: boolean) => {
    switch (provider) {
        case 'openai':
        case 'openrouter':
            return {
                model,
                messages,
                ...(isJson && { response_format: { type: "json_object" } }),
            };

        case 'anthropic':
            // Anthropic uses a different format
            const systemMessage = messages.find((m: any) => m.role === 'system');
            const userMessages = messages.filter((m: any) => m.role !== 'system');
            return {
                model,
                max_tokens: 4096,
                ...(systemMessage && { system: systemMessage.content }),
                messages: userMessages.map((m: any) => ({
                    role: m.role === 'model' ? 'assistant' : m.role,
                    content: m.content
                })),
            };

        case 'google':
            // Google Gemini uses a different format
            const contents = messages
                .filter((m: any) => m.role !== 'system')
                .map((m: any) => ({
                    role: m.role === 'model' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));

            const systemInstruction = messages.find((m: any) => m.role === 'system');

            return {
                contents,
                ...(systemInstruction && {
                    systemInstruction: {
                        parts: [{ text: systemInstruction.content }]
                    }
                }),
                generationConfig: {
                    temperature: 0.7,
                    ...(isJson && { responseMimeType: "application/json" }),
                }
            };

        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
};

// Helper function to format request headers for different providers
const formatRequestHeaders = (provider: LLMProvider, apiKey: string): Record<string, string> => {
    switch (provider) {
        case 'openai':
        case 'openrouter':
            return {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            };

        case 'anthropic':
            return {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            };

        case 'google':
            // Google uses API key as a query parameter, not in headers
            return {
                'Content-Type': 'application/json',
            };

        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
};

// Helper function to extract content from API response
const extractResponseContent = (provider: LLMProvider, data: any): string => {
    switch (provider) {
        case 'openai':
        case 'openrouter':
            return data.choices[0].message.content;

        case 'anthropic':
            return data.content[0].text;

        case 'google':
            return data.candidates[0].content.parts[0].text;

        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
};

const callApi = async (prompt: string, options: ApiOptions, isJson: boolean = true) => {
    await enforceRateLimit();
    const { apiKey, model, provider } = options;
    if (!apiKey) {
        throw new Error("API Key is not configured.");
    }
    const signal = getNewAbortSignal();

    try {
        setRequestStatus('active');
        updateRateLimitTimestamp();
        incrementApiCallCount();

        const messages = [{ role: 'user', content: prompt }];
        const requestBody = formatRequestBody(provider, model, messages, isJson);
        const headers = formatRequestHeaders(provider, apiKey);

        // For Google, add API key as query parameter
        const endpoint = getApiEndpoint(provider, model);
        const url = provider === 'google' ? `${endpoint}?key=${apiKey}` : endpoint;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
            signal: signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error?.message || errorData?.message || `API request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = extractResponseContent(provider, data);

        if (!content) {
            throw new Error("Received an empty response from the AI. The model may have been filtered or refused the request.");
        }

        resetContinuousFailureCount();
        return content;

    } catch (error: any) {
        incrementContinuousFailureCount();
        if (error.name === 'AbortError') {
            console.log("API request was cancelled.");
            throw new Error("Request cancelled.");
        }
        console.error(`Error calling ${provider} API:`, error);
        throw new Error(error.message || "An unknown error occurred while contacting the AI service.");
    } finally {
        setRequestStatus('idle');
        clearAbortController();
    }
};

const extractJson = (text: string): string | null => {
    const markdownMatch = text.match(/```(json)?\s*(\{[\s\S]*\}|\[[\s\S]*\])\s*```/);
    if (markdownMatch && markdownMatch[2]) {
        return markdownMatch[2];
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return text.substring(firstBrace, lastBrace + 1);
    }
    return null;
};

const parseJsonWithCorrection = async <T>(jsonText: string, originalPrompt: string, options: ApiOptions): Promise<T> => {
    try {
        return JSON.parse(jsonText) as T;
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            console.warn("Malformed JSON detected. Attempting self-correction.", { originalError: error.message, jsonText });
            
            const fixPrompt = createFixJsonPrompt(originalPrompt, jsonText, error.message);
            const fixedJsonText = await callApi(fixPrompt, options, true);
            
            try {
                return JSON.parse(fixedJsonText) as T;
            } catch (secondError: any) {
                 console.error("JSON self-correction failed. The AI's corrected response was still invalid.", { correctedJson: fixedJsonText, error: secondError.message });
                 throw new Error("Failed to parse the API's JSON response, even after a self-correction attempt.");
            }
        }
        throw error; // Re-throw other errors
    }
};

const processReport = (report: VulnerabilityReport): VulnerabilityReport => {
  const vulnerabilities = (report.vulnerabilities || []).map(v => ({
    ...v,
    severity: Object.values(Severity).includes(v.severity) ? v.severity : Severity.UNKNOWN,
  }));
  return { ...report, vulnerabilities };
};


export const analyzeCode = async (code: string, options: ApiOptions, iteration: number): Promise<VulnerabilityReport> => {
  const prompt = createSastAnalysisPrompt(code, iteration);
  const resultText = await callApi(prompt, options, true);
  const result = await parseJsonWithCorrection<VulnerabilityReport>(resultText, prompt, options);
  return processReport(result);
};

export const performSastDeepAnalysis = async (vulnerability: Vulnerability, code: string, options: ApiOptions): Promise<Vulnerability> => {
    const prompt = createSastDeepAnalysisPrompt(vulnerability, code);
    const resultText = await callApi(prompt, options, true);
    return await parseJsonWithCorrection<Vulnerability>(resultText, prompt, options);
};

export const analyzeJsCode = async (code: string, options: ApiOptions): Promise<VulnerabilityReport> => {
  const prompt = createJsReconPrompt(code);
  const resultText = await callApi(prompt, options, true);
  const result = await parseJsonWithCorrection<VulnerabilityReport>(resultText, prompt, options);
  return processReport(result);
};

export const analyzeUrl = async (url: string, scanType: DastScanType, options: ApiOptions, iteration: number): Promise<VulnerabilityReport> => {
  const prompt = createDastAnalysisPrompt(url, scanType, iteration);
  const resultText = await callApi(prompt, options, false); // DAST uses search, response is not guaranteed to be perfect JSON
  const jsonText = extractJson(resultText);
  if (!jsonText) {
    console.warn("DAST response did not contain valid JSON, creating a default report. Raw text:", resultText);
    return processReport({
        analyzedTarget: url,
        vulnerabilities: [],
    });
  }
  const result = await parseJsonWithCorrection<VulnerabilityReport>(jsonText, prompt, options);
  if (!result.analyzedTarget) {
      result.analyzedTarget = url;
  }
  return processReport(result);
};

export const validateVulnerability = async (vulnerability: Vulnerability, options: ApiOptions): Promise<{is_valid: boolean; reasoning: string}> => {
    const prompt = createValidationPrompt(vulnerability);
    const resultText = await callApi(prompt, options, true);
    return await parseJsonWithCorrection<{is_valid: boolean; reasoning: string}>(resultText, prompt, options);
};

export const consolidateReports = async (reports: VulnerabilityReport[], options: ApiOptions): Promise<VulnerabilityReport> => {
    if (reports.length === 0) throw new Error("Cannot consolidate an empty array of reports.");
    if (reports.length === 1) return reports[0];
    
    const prompt = createConsolidationPrompt(JSON.stringify(reports));
    const resultText = await callApi(prompt, options, true);
    const result = await parseJsonWithCorrection<VulnerabilityReport>(resultText, prompt, options);
    return processReport(result);
};

export const performDeepAnalysis = async (vulnerability: Vulnerability, url: string, options: ApiOptions): Promise<Vulnerability> => {
    const prompt = createDeepAnalysisPrompt(vulnerability, url);
    const resultText = await callApi(prompt, options, true);
    return await parseJsonWithCorrection<Vulnerability>(resultText, prompt, options);
};

export const analyzeFileUpload = async (url: string, options: ApiOptions): Promise<FileUploadAnalysisResult> => {
    // --- Attempt 1: Pentester Persona (uses search) ---
    try {
        const prompt1 = createFileUploadAnalysisPrompt(url);
        const resultText1 = await callApi(prompt1, options, false);
        const jsonText1 = extractJson(resultText1);
        
        if (jsonText1) {
            const result1 = await parseJsonWithCorrection<FileUploadAnalysisResult>(jsonText1, prompt1, options);
            if (result1.found) {
                // Success on the first try, return immediately.
                return result1;
            }
        }
        // If not found or JSON was bad, proceed to the second attempt.
        console.log("File upload not found on first attempt, trying fallback method.");
    } catch (e: any) {
        console.warn("File upload analysis (attempt 1) failed:", e.message, "Proceeding to fallback.");
        // Ignore the error and proceed to the second attempt.
    }

    // --- Attempt 2: Strict HTML Parser Persona (no search) ---
    // This runs if the first attempt failed, returned bad JSON, or found nothing.
    const prompt2 = createFileUploadAnalysisPromptAttempt2(url);
    const resultText2 = await callApi(prompt2, options, false);
    const jsonText2 = extractJson(resultText2);
    
    if (!jsonText2) {
        // If both attempts fail to produce JSON, return a default "not found" response.
        return {
            found: false,
            description: "The AI's response could not be understood after two attempts. It's likely no file upload form was found.",
            manualTestingGuide: "",
        };
    }
    // Return the result of the second attempt, whatever it is.
    return await parseJsonWithCorrection<FileUploadAnalysisResult>(jsonText2, prompt2, options);
};


export const analyzeJwt = async (header: object, payload: object, mode: 'blue_team' | 'red_team', options: ApiOptions): Promise<string> => {
    const prompt = mode === 'blue_team' 
        ? createJwtBlueTeamPrompt(JSON.stringify(header, null, 2), JSON.stringify(payload, null, 2))
        : createJwtRedTeamPrompt(JSON.stringify(header, null, 2), JSON.stringify(payload, null, 2));
    return callApi(prompt, options, false);
};

export const analyzeHeaders = async (url: string, options: ApiOptions): Promise<HeadersReport> => {
    const prompt = createHeadersAnalysisPrompt(url);
    const resultText = await callApi(prompt, options, false); // Uses search
    const jsonText = extractJson(resultText);
    if (!jsonText) {
        return {
            analyzedUrl: url,
            overallScore: 'F',
            summary: "Could not analyze headers due to an issue with the AI's response format.",
            findings: []
        };
    }
    const result = await parseJsonWithCorrection<HeadersReport>(jsonText, prompt, options);
    if (!result.analyzedUrl) {
        result.analyzedUrl = url;
    }
    return result;
};

export const findPrivescExploits = async (technology: string, version: string, options: ApiOptions): Promise<VulnerabilityReport> => {
    const prompt = createPrivescPathfinderPrompt(technology, version);
    const resultText = await callApi(prompt, options, false); // Uses search
    const jsonText = extractJson(resultText);
    if (!jsonText) {
        return processReport({
            analyzedTarget: `${technology} ${version}`,
            vulnerabilities: [],
        });
    }
    const result = await parseJsonWithCorrection<any>(jsonText, prompt, options);

    const report: VulnerabilityReport = {
        analyzedTarget: `${technology} ${version}`,
        vulnerabilities: (result.exploits || []).map((exploit: any) => {
            let severity = Severity.UNKNOWN;
            const score = parseFloat(exploit.cvss_score);
            if (score >= 9.0) severity = Severity.CRITICAL;
            else if (score >= 7.0) severity = Severity.HIGH;
            else if (score >= 4.0) severity = Severity.MEDIUM;
            else if (score > 0) severity = Severity.LOW;

            return {
                vulnerability: exploit.cve_id || "Unknown CVE",
                severity: severity,
                description: exploit.summary || "No summary provided.",
                impact: "Potential for Privilege Escalation or Remote Code Execution.",
                recommendation: `Review the following public exploits:\n${(exploit.exploit_urls || []).join('\n') || "No exploit URLs found."}`,
                vulnerableCode: `${technology} ${version}`
            };
        })
    };
    return processReport(report);
};

export const analyzeDomXss = async (code: string, options: ApiOptions): Promise<DomXssAnalysisResult> => {
  const prompt = createDomXssPathfinderPrompt(code);
  const resultText = await callApi(prompt, options, true);
  return await parseJsonWithCorrection<DomXssAnalysisResult>(resultText, prompt, options);
};

export const generateXssPayload = async (vulnerability: Vulnerability, options: ApiOptions, samplePayloads?: string[]): Promise<XssPayloadResult> => {
  const prompt = createXssPayloadGenerationPrompt(vulnerability, samplePayloads);
  const resultText = await callApi(prompt, options, true);
  return await parseJsonWithCorrection<XssPayloadResult>(resultText, prompt, options);
};

export const generateSqlmapCommand = async (vulnerability: Vulnerability, url: string, options: ApiOptions): Promise<SqlmapCommandResult> => {
  const prompt = createSqlmapCommandGenerationPrompt(vulnerability, url);
  const resultText = await callApi(prompt, options, true);
  return await parseJsonWithCorrection<SqlmapCommandResult>(resultText, prompt, options);
};

export const forgePayloads = async (basePayload: string, options: ApiOptions): Promise<ForgedPayloadResult> => {
  const prompt = createPayloadForgePrompt(basePayload);
  const resultText = await callApi(prompt, options, true);
  return await parseJsonWithCorrection<ForgedPayloadResult>(resultText, prompt, options);
};

export const generateSstiPayloads = async (engine: string, goal: string, options: ApiOptions): Promise<ForgedPayloadResult> => {
  const prompt = createSstiForgePrompt(engine, goal);
  const resultText = await callApi(prompt, options, true);
  return await parseJsonWithCorrection<ForgedPayloadResult>(resultText, prompt, options);
};

// --- Chat Functions ---
const callLLMChat = async (history: ChatMessage[], options: ApiOptions) => {
    await enforceRateLimit();
    const { apiKey, model, provider } = options;
    if (!apiKey) {
        throw new Error("API Key is not configured.");
    }
    const signal = getNewAbortSignal();

    try {
        setRequestStatus('active');
        updateRateLimitTimestamp();
        incrementApiCallCount();

        const messages = history.map(({ role, content }) => ({ role, content }));
        const requestBody = formatRequestBody(provider, model, messages, false);
        const headers = formatRequestHeaders(provider, apiKey);

        // For Google, add API key as query parameter
        const endpoint = getApiEndpoint(provider, model);
        const url = provider === 'google' ? `${endpoint}?key=${apiKey}` : endpoint;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
            signal: signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error?.message || errorData?.message || `API request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = extractResponseContent(provider, data);

        resetContinuousFailureCount();
        return content;

    } catch (error: any) {
        incrementContinuousFailureCount();
        if (error.name === 'AbortError') {
            console.log("Chat API request was cancelled.");
            throw new Error("Request cancelled.");
        }
        console.error(`Error calling ${provider} Chat API:`, error);
        throw new Error(error.message || "An unknown error occurred while contacting the AI service.");
    } finally {
        setRequestStatus('idle');
        clearAbortController();
    }
};

export const startExploitChat = async (context: ExploitContext, options: ApiOptions): Promise<string> => {
    const prompt = createInitialExploitChatPrompt(context);
    const initialHistory: ChatMessage[] = [{ role: 'user', content: prompt }];
    return callLLMChat(initialHistory, options);
};

export const startSqlExploitChat = async (context: ExploitContext, options: ApiOptions): Promise<string> => {
    const prompt = createInitialSqlExploitChatPrompt(context);
    const initialHistory: ChatMessage[] = [{ role: 'user', content: prompt }];
    return callLLMChat(initialHistory, options);
};

export const continueExploitChat = async (history: ChatMessage[], newUserMessage: string, options: ApiOptions): Promise<string> => {
    const updatedHistory: ChatMessage[] = [...history, { role: 'user', content: newUserMessage }];
    return callLLMChat(updatedHistory, options);
};

export const startGeneralChat = async (systemPrompt: string, userMessage: string, options: ApiOptions): Promise<string> => {
    const initialHistory: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
    ];
    return callLLMChat(initialHistory, options);
};

export const continueGeneralChat = async (systemPrompt: string, history: ChatMessage[], newUserMessage: string, options: ApiOptions): Promise<string> => {
    const fullHistory: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: newUserMessage }
    ];
    return callLLMChat(fullHistory, options);
};

export const testApi = async (apiKey: string, model: string, provider: LLMProvider): Promise<{ success: boolean; error?: string }> => {
    // Validate API key format based on provider
    const keyValidation = validateApiKeyFormat(apiKey, provider);
    if (!keyValidation.valid) {
        return { success: false, error: keyValidation.error };
    }

    try {
        const messages = [{ role: 'user', content: 'Test prompt' }];
        const requestBody = formatRequestBody(provider, model, messages, false);
        const headers = formatRequestHeaders(provider, apiKey);

        // Limit response size for test
        if (provider === 'openai' || provider === 'openrouter') {
            (requestBody as any).max_tokens = 5;
        } else if (provider === 'anthropic') {
            (requestBody as any).max_tokens = 5;
        } else if (provider === 'google') {
            (requestBody as any).generationConfig = {
                ...((requestBody as any).generationConfig || {}),
                maxOutputTokens: 5,
            };
        }

        const endpoint = getApiEndpoint(provider, model);
        const url = provider === 'google' ? `${endpoint}?key=${apiKey}` : endpoint;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.error?.message || data?.message || `HTTP error! status: ${response.status}`;
            return { success: false, error: errorMessage };
        }

        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message || 'A network error occurred.' };
    }
};

// Helper function to validate API key format
const validateApiKeyFormat = (apiKey: string, provider: LLMProvider): { valid: boolean; error?: string } => {
    switch (provider) {
        case 'openai':
            if (!apiKey.startsWith('sk-')) {
                return { valid: false, error: 'Invalid OpenAI API key format. It should start with "sk-".' };
            }
            break;
        case 'anthropic':
            if (!apiKey.startsWith('sk-ant-')) {
                return { valid: false, error: 'Invalid Anthropic API key format. It should start with "sk-ant-".' };
            }
            break;
        case 'google':
            if (apiKey.length < 20) {
                return { valid: false, error: 'Invalid Google API key format. Please check your API key.' };
            }
            break;
        case 'openrouter':
            if (!apiKey.startsWith('sk-or-')) {
                return { valid: false, error: 'Invalid OpenRouter API key format. It should start with "sk-or-".' };
            }
            break;
    }
    return { valid: true };
};
