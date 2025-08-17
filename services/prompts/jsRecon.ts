// services/prompts/jsRecon.ts
import { Severity } from '../../types.ts';

/**
 * Creates the prompt for the new JS Reconnaissance feature.
 * @param code The JavaScript code to analyze.
 * @returns The complete prompt string.
 */
export const createJsReconPrompt = (code: string): string => `
    Act as a security researcher specializing in JavaScript reconnaissance.
    Analyze the following JavaScript code. Your goal is to extract API endpoints, hardcoded URLs, and potential secrets (like API keys or tokens).

    **Methodology:**
    1.  Scan the code for relative paths that look like API calls (e.g., '/api/v1/users', '/_next/data/...').
    2.  Scan for full URLs (http:// or https://) that might reveal development environments, cloud storage, or third-party services.
    3.  Scan for strings with high entropy or that match common API key/token patterns (e.g., 'sk_live_...', 'Bearer ...', long hex strings, or JWTs starting with 'ey...').

    **Output Format:**
    Your entire response MUST be a single JSON object that conforms to the VulnerabilityReport schema.
    - Set the 'analyzedTarget' field to 'JS Recon Analysis'.
    - Populate the 'vulnerabilities' array with your findings.
    - For each finding, create a vulnerability object with the following mapping:
        - For an API Endpoint:
            - "vulnerability": "API Endpoint Discovery"
            - "severity": "${Severity.INFO}"
            - "description": "An API endpoint was discovered in the code."
            - "vulnerableCode": The endpoint path itself (e.g., "/api/users").
        - For a Hardcoded URL:
            - "vulnerability": "Hardcoded URL"
            - "severity": "${Severity.LOW}"
            - "description": "A hardcoded URL was found, which might expose internal resources or be an information leak."
            - "vulnerableCode": The full URL.
        - For a Potential Secret:
            - "vulnerability": "Potential Secret Leak"
            - "severity": "${Severity.HIGH}"
            - "description": "A potential secret (API key, token, etc.) was found hardcoded in the script. This requires immediate review."
            - "vulnerableCode": The secret string or pattern.
    - For all findings, set 'impact' to 'Information Disclosure' and 'recommendation' to 'Manually review the finding for sensitive information exposure and confirm if it should be publicly accessible. Rotate keys if necessary.'
    - Do NOT include the 'injectionPoint' field for any findings.

    If no findings, return an empty 'vulnerabilities' array.
    Do not add any conversational text or markdown. The raw response must be only the JSON object.
`;