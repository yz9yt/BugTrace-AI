// services/prompts/dast.ts
import type { DastScanType } from '../../types';

const reconVariations = [
    "focus on public exploits and technology fingerprinting to find known vulnerabilities.",
    "prioritize identifying the exact versions of all software (CMS, frameworks, libraries) and searching CVE databases exhaustively.",
    "search for publicly exposed administrative panels, forgotten subdomains, and development endpoints.",
    "investigate the target for past data breaches or security incidents that might hint at recurring weaknesses.",
    "use advanced search operators to find sensitive files indexed by search engines, like `site:{hostname} filetype:log` or `inurl:config`.",
];

const activeVariations = [
    "perform a simulated ACTIVE scan of all inputs, focusing on high-impact, exploitable vulnerabilities like SQLi and RCE.",
    "relentlessly probe every parameter for injection vulnerabilities. Your primary goal is to prove SQLi with a UNION SELECT, or find a vector for Command Injection or SSTI.",
    "focus on finding information disclosure and misconfigurations. Look for exposed directories, verbose error messages, sensitive data in responses, and insecure API endpoints.",
    "analyze the application's business logic. How could features be abused? Look for IDORs, broken access control, parameter tampering, and race conditions.",
    "assume the application has a weak WAF. Craft clever payloads to find reflected, stored, and DOM-based XSS. Pay special attention to unusual contexts and encoding bypasses.",
];

/**
 * Creates the prompt for DAST (Recon Scan). Focuses on public information.
 * @param url The URL to analyze.
 * @param iteration The current recursive iteration, used to select a prompt variation.
 * @returns The complete prompt string.
 */
const createReconDastAnalysisPrompt = (url: string, iteration: number): string => {
    const hostname = new URL(url).hostname;
    const focus = reconVariations[iteration % reconVariations.length].replace('{hostname}', hostname);

    return `
    Act as an expert bug bounty hunter performing reconnaissance on ${url}.
    Your primary goal is to ${focus}

    **Methodology:**
    1.  **Public Exploit Search (Top Priority):** Based on your goal, search for known vulnerabilities and public exploits for the domain \`${hostname}\` and any discovered technologies.
    2.  **Technology Fingerprinting:** Identify the tech stack (e.g., WordPress, PHP, specific jQuery versions) and search for known vulnerabilities for those specific versions.

    **Output Format:**
    Your entire response MUST be a single, valid JSON object that conforms to the VulnerabilityReport schema.
    - The root object MUST have 'analyzedTarget' and 'vulnerabilities' keys.
    - 'analyzedTarget' MUST be the root URL being analyzed.
    - 'vulnerabilities' MUST be an array of vulnerability objects. If no vulnerabilities are found, it must be an empty array [].

    For EACH object inside the 'vulnerabilities' array, you MUST include these exact keys:
    - "vulnerability": (string) The specific name of the weakness (e.g., "Error-Based SQL Injection"). This field is mandatory.
    - "severity": (string) The severity, judged by its exploitability and impact.
    - "description": (string) A step-by-step guide on how to reproduce the vulnerability.
    - "impact": (string) A specific, worst-case scenario an attacker could achieve.
    - "vulnerableCode": (string) The final, working Proof-of-Concept payload.
    - "recommendation": (string) A brief, concise mitigation strategy.
    - "injectionPoint": (object or null) The injection point details. Mandatory for injection vulnerabilities, otherwise \`null\`.

    Do not add any conversational text or markdown. The raw response must be only the JSON object.
`;
};

/**
 * Creates the prompt for DAST (Active Scan - Simulated). Focuses on deep structural analysis.
 * @param url The URL to analyze.
 * @param iteration The current recursive iteration, used to select a prompt variation.
 * @returns The complete prompt string.
 */
const createActiveDastAnalysisPrompt = (url: string, iteration: number): string => {
    const hostname = new URL(url).hostname;
    const focus = activeVariations[iteration % activeVariations.length].replace('{hostname}', hostname);

    return `
    Act as a top-tier bug bounty hunter. Your task is to ${focus}

    **Methodology:**
    1.  **Spider & Enumerate:** Find ALL pages, endpoints, parameters, and headers on \`site:${hostname}\`.
    2.  **Exploitation-Focused Hypothesis:** Based on your assigned focus, hypothesize and attempt to prove vulnerabilities.
    3.  **Proof-of-Concept Generation:** For every vulnerability you claim to have found, you MUST provide a clear, working proof-of-concept payload in the "vulnerableCode" field. For SQLi, this must be a working UNION SELECT payload if possible.

    **Output Format:**
    Your entire response MUST be a single, valid JSON object that conforms to the VulnerabilityReport schema.
    - The root object MUST have 'analyzedTarget' and 'vulnerabilities' keys.
    - 'analyzedTarget' MUST be the root URL being analyzed.
    - 'vulnerabilities' MUST be an array of vulnerability objects. If no vulnerabilities are found, it must be an empty array [].

    For EACH object inside the 'vulnerabilities' array, you MUST include these exact keys:
    - "vulnerability": (string) The specific name of the weakness (e.g., "Error-Based SQL Injection"). This field is mandatory.
    - "severity": (string) The severity, judged by its exploitability and impact.
    - "description": (string) A step-by-step guide on how to reproduce the vulnerability.
    - "impact": (string) A specific, worst-case scenario an attacker could achieve.
    - "vulnerableCode": (string) The final, working Proof-of-Concept payload.
    - "recommendation": (string) A brief, concise mitigation strategy.
    - "injectionPoint": (object or null) The injection point details. Mandatory for injection vulnerabilities, otherwise \`null\`.
    
    Do not add any conversational text or markdown. The raw response must be only the JSON object.
`;
};

/**
 * Creates the prompt for DAST (Grey Box Scan). Combines active scan with client-side code analysis.
 * @param url The URL to analyze.
 * @param iteration The current recursive iteration, used to select a prompt variation.
 * @returns The complete prompt string.
 */
const createGreyBoxDastAnalysisPrompt = (url: string, iteration: number): string => {
    const hostname = new URL(url).hostname;
    const focus = activeVariations[iteration % activeVariations.length].replace('{hostname}', hostname);

    return `
    Act as an expert grey box penetration tester with a red team mindset. Your task is to find exploitable vulnerabilities in ${url} by correlating dynamic behavior with client-side code weaknesses.
    Your specific focus for this run is to ${focus}.

    **Methodology:**

    **Phase 1: Dynamic Analysis (DAST)**
    1.  **Spider & Enumerate:** Find all endpoints and input vectors on \`${hostname}\`.
    2.  **Hypothesize & Prove Exploits:** Based on your focus, find reflection points for XSS, identify potential SQLi parameters, or analyze business logic.

    **Phase 2: Client-Side Code Analysis (SAST)**
    3.  **Fetch & Analyze JavaScript:** Fetch all linked JavaScript files from \`${url}\`. Statically analyze this code for DOM XSS sources/sinks, hardcoded secrets, and API endpoints.

    **Phase 3: Correlate & Report**
    4.  **Chain & Correlate:** This is the most critical step. Connect your findings. For example, if DAST shows a reflection and SAST shows it flows into \`.innerHTML\`, you have a high-confidence finding.
    5.  **Generate Report:** Provide your final report as a single, strict JSON object.
        - In the "description" for a correlated finding, you MUST explain how the dynamic and static evidence combine to prove the exploit. This field must serve as a reproduction guide.

    **Output Format:**
    Your entire response MUST be a single, valid JSON object that conforms to the VulnerabilityReport schema.
    - The root object MUST have 'analyzedTarget' and 'vulnerabilities' keys.
    - 'analyzedTarget' MUST be the root URL being analyzed.
    - 'vulnerabilities' MUST be an array of vulnerability objects. If no vulnerabilities are found, it must be an empty array [].

    For EACH object inside the 'vulnerabilities' array, you MUST include these exact keys:
    - "vulnerability": (string) The specific name of the weakness (e.g., "Error-Based SQL Injection"). This field is mandatory.
    - "severity": (string) The severity, judged by its exploitability and impact.
    - "description": (string) A step-by-step guide on how to reproduce the vulnerability.
    - "impact": (string) A specific, worst-case scenario an attacker could achieve.
    - "vulnerableCode": (string) The final, working Proof-of-Concept payload.
    - "recommendation": (string) A brief, concise mitigation strategy.
    - "injectionPoint": (object or null) The injection point details. Mandatory for injection vulnerabilities, otherwise \`null\`.

    Do not add any conversational text or markdown. The raw response must be only the JSON object.
`;
};


/**
 * Factory function to create the appropriate DAST analysis prompt based on scan type.
 * @param url The URL to analyze.
 * @param scanType The type of scan to perform.
 * @param iteration The current recursive iteration, used to select a prompt variation.
 * @returns The complete prompt string.
 */
export const createDastAnalysisPrompt = (url: string, scanType: DastScanType, iteration: number): string => {
    switch (scanType) {
        case 'recon':
            return createReconDastAnalysisPrompt(url, iteration);
        case 'active':
            return createActiveDastAnalysisPrompt(url, iteration);
        case 'greybox':
            return createGreyBoxDastAnalysisPrompt(url, iteration);
        default:
            return createActiveDastAnalysisPrompt(url, iteration); // Default to active for safety
    }
};