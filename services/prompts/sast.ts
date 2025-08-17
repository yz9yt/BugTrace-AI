// services/prompts/sast.ts
import type { Vulnerability } from '../../types.ts';

const sastPersonas = [
    "expert security researcher specializing in white-box code analysis with a bug bounty hunter's mindset",
    "meticulous code auditor with a focus on subtle logic flaws and insecure data handling patterns",
    "penetration tester attempting to find high-impact, chainable vulnerabilities that could lead to a system compromise",
    "automated SAST tool developer, creating a prompt that finds OWASP Top 10 vulnerabilities with high precision",
    "developer performing a peer review, looking for common mistakes, insecure library usage, and 'low-hanging fruit' vulnerabilities",
];

/**
 * Creates the prompt for Static Application Security Testing (SAST).
 * @param code The code snippet to analyze.
 * @param iteration The current recursive iteration, used to select a prompt variation.
 * @returns The complete prompt string.
 */
export const createSastAnalysisPrompt = (code: string, iteration: number): string => {
    // Cycle through personas based on the iteration number
    const persona = sastPersonas[iteration % sastPersonas.length];

    return `
    Act as a ${persona}.
    Your goal is to find exploitable vulnerabilities in the following code snippet. Prioritize findings that have a clear path to impact.

    Set the 'analyzedTarget' field to 'Analyzed Code Snippet'.

    Code to analyze:
    \`\`\`
    ${code}
    \`\`\`

    **Output Format:**
    Your entire response MUST be a single, valid JSON object that conforms to the VulnerabilityReport schema.
    For each vulnerability, you MUST include:
    - "vulnerability": The name of the weakness (e.g., SQL Injection).
    - "severity": The severity, judged by its exploitability and impact.
    - "description": **This field MUST be a step-by-step guide on how to reproduce the vulnerability.**
    - "impact": A specific, worst-case scenario an attacker could achieve (e.g., "An attacker can exfiltrate all user data from the 'users' table.").
    - "vulnerableCode": The EXACT line(s) of code that introduce the flaw.
    - "recommendation": A brief, concise mitigation strategy.

    If you find no exploitable vulnerabilities, return an empty "vulnerabilities" array.
    Do not add any conversational text or markdown. The raw response must be only the JSON object. Do not include 'injectionPoint'.
`;
};


/**
 * Creates the prompt for a deep-dive analysis on a single, specific SAST vulnerability finding.
 * @param vulnerability The initial, general vulnerability finding.
 * @param code The original source code where the vulnerability was found.
 * @returns The complete prompt string.
 */
export const createSastDeepAnalysisPrompt = (vulnerability: Vulnerability, code: string): string => `
    You are an AI acting as a world-class security researcher, focusing on exploiting **${vulnerability.vulnerability}**.
    A preliminary scan found a potential vulnerability in the code snippet below. Your job is to refine this into a high-quality, actionable bug bounty report.

    **Original Code Snippet:**
    \`\`\`
    ${code}
    \`\`\`

    **Initial Finding:**
    \`\`\`json
    ${JSON.stringify(vulnerability, null, 2)}
    \`\`\`

    **Your Task:**
    Re-evaluate this finding in the context of the full code provided and return a single, updated JSON object that is ready for submission.

    **Instructions for the new JSON object:**
    1.  **"description"**: Rewrite this into a precise, step-by-step **Proof-of-Concept** guide, referencing the provided code.
    2.  **"impact"**: Rewrite this to be a specific, high-impact scenario relevant to the code's context. Don't be generic.
    3.  **"recommendation"**: Provide a concise recommendation with a "before" and "after" code example if possible.
    4.  **"vulnerableCode"**: Re-evaluate and provide the most accurate line(s) of code that are vulnerable.
    5.  Keep "vulnerability" and "severity" fields identical to the original finding.
    6.  The "injectionPoint" field should be null as this is a static analysis.

    Your entire response MUST be only the single, updated JSON object. All string values must be properly escaped.
    Do not add any conversational text or markdown. The raw response must be only the JSON object.
`;