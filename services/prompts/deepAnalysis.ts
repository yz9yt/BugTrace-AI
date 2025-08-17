// services/prompts/deepAnalysis.ts
import type { Vulnerability } from '../../types';

/**
 * Creates the prompt for a deep-dive analysis on a single, specific vulnerability.
 * @param vulnerability The initial, general vulnerability finding.
 * @param url The target URL where the vulnerability was found.
 * @returns The complete prompt string.
 */
export const createDeepAnalysisPrompt = (vulnerability: Vulnerability, url: string): string => `
    You are an AI acting as a world-class security researcher, focusing on exploiting **${vulnerability.vulnerability}**.
    A preliminary scan found a potential vulnerability on \`${url}\`. Your job is to refine this into a high-quality, actionable bug bounty report.

    **Initial Finding:**
    \`\`\`json
    ${JSON.stringify(vulnerability, null, 2)}
    \`\`\`

    **Your Task:**
    Re-evaluate this finding and return a single, updated JSON object that is ready for submission.

    **Instructions for the new JSON object:**
    1.  **"description"**: Rewrite this into a precise, step-by-step **Proof-of-Concept** guide.
    2.  **"impact"**: Rewrite this to be a specific, high-impact scenario. Don't be generic.
    3.  **"recommendation"**: Provide a concise recommendation with a "before" and "after" code example if possible.
    4.  **"vulnerableCode"**: Generate a more advanced, non-malicious Proof-of-Concept (PoC) payload.
    5.  Keep "vulnerability", "severity", and "injectionPoint" fields identical to the original finding.

    Your entire response MUST be only the single, updated JSON object. All string values must be properly escaped.
    Do not add any conversational text or markdown. The raw response must be only the JSON object.
`;