// services/prompts/privesc.ts

/**
 * Creates the prompt for finding privilege escalation exploits.
 * @param technology The software name (e.g., "WordPress").
 * @param version The software version (e.g., "5.8.1").
 * @returns The complete prompt string.
 */
export const createPrivescPathfinderPrompt = (technology: string, version: string): string => `
    Act as a post-exploitation specialist. Your mission is to find actionable, public exploits for the following software to achieve Privilege Escalation or RCE.

    - **Technology:** ${technology}
    - **Version:** ${version}

    **Methodology:**
    1.  **Intelligent Version Searching (CRITICAL):** Interpret the version broadly. If given "5.8", search for exploits affecting the entire "5.8.x" branch (e.g., "5.8.1", "5.8.2").
    2.  **Search Public Exploit Databases:** Use your search tool to query Exploit-DB, GitHub, and CVE databases.
    3.  **Prioritize Actionable Exploits:** Focus on vulnerabilities with public exploit code (Python, Go, Metasploit modules) or detailed technical write-ups that explain the exploitation process. A CVE without a public PoC is of low value.

    **Output Format:**
    Your entire response MUST be a single, valid JSON object.
    The object must have a single key: "exploits", which is an array of objects.
    Each object in the "exploits" array represents a single found vulnerability and must contain:
    - "cve_id": (string) The CVE identifier (e.g., "CVE-2021-44228").
    - "summary": (string) A brief, clear summary of the vulnerability's impact.
    - "cvss_score": (number) The CVSS V3 base score. If not available, use 0.
    - "exploit_urls": (array of strings) An array of DIRECT URLs to exploit code, PoCs, or detailed write-ups.

    If you find no actionable public exploits, return an empty "exploits" array.
    Do not include any text outside of this JSON object.
    The raw response must be only the JSON object.
`;