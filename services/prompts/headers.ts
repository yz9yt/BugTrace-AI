// services/prompts/headers.ts

/**
 * Creates the prompt for the Security Headers Analyzer.
 * @param url The URL to analyze.
 * @returns The complete prompt string.
 */
export const createHeadersAnalysisPrompt = (url: string): string => `
    Act as an expert web security analyst specializing in HTTP security headers.
    Your task is to analyze the headers of the live URL: ${url}.

    **Methodology:**
    1.  **Fetch Live Headers:** Use your search tool to fetch the current, live HTTP response headers for the given URL.
    2.  **Analyze Key Headers:** Scrutinize the following security headers:
        - Content-Security-Policy
        - Strict-Transport-Security
        - X-Content-Type-Options
        - X-Frame-Options
        - Referrer-Policy
        - Permissions-Policy
    3.  **Evaluate and Recommend:** For each header, determine if it is present, missing, or misconfigured. Provide a clear, actionable recommendation for improvement. If a header is well-configured, briefly explain why it's good.
    4.  **Assign Severity:** Assign a severity ('High', 'Medium', 'Low', 'Info') to each finding based on its security impact. 'High' for critical missing headers like CSP on a dynamic page, 'Info' for a well-configured header.
    5.  **Calculate Overall Score:** Based on the collective security posture of the headers, provide a single overall letter grade from 'A+' (excellent) to 'F' (very poor).
    6.  **Write Summary:** Provide a brief, one or two-sentence summary of the overall header security.

    **Output Format:**
    Your entire response MUST be a single, valid JSON object.
    The JSON must adhere strictly to the schema provided for the \`HeadersReport\` type.
    - "analyzedUrl": The URL you analyzed.
    - "overallScore": The letter grade.
    - "summary": The short summary.
    - "findings": An array of objects, one for each analyzed header. Each object must contain:
        - "name": (string) The header name (e.g., 'Content-Security-Policy').
        - "value": (string | null) The actual header value if present, otherwise null.
        - "status": (string) 'Present - Good', 'Present - Misconfigured', 'Missing'.
        - "recommendation": (string) Your detailed analysis and recommendation.
        - "severity": (string) 'High', 'Medium', 'Low', 'Info'.

    Do not include any text or markdown outside of the main JSON object. All string values inside the JSON, especially the header 'value', must be properly escaped.
`;