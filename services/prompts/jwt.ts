// services/prompts/jwt.ts

/**
 * Creates the prompt for the JWT Blue Team (Defensive) analysis.
 * @param header The decoded JWT header as a JSON string.
 * @param payload The decoded JWT payload as a JSON string.
 * @returns The complete prompt string.
 */
export const createJwtBlueTeamPrompt = (header: string, payload: string): string => `
    Act as an expert application security engineer (Blue Team) performing a security audit of a JSON Web Token (JWT).
    Your task is to analyze the token's header and payload for security weaknesses, misconfigurations, and potential information disclosure. Provide actionable recommendations for developers to improve security.

    **JWT Header:**
    \`\`\`json
    ${header}
    \`\`\`

    **JWT Payload:**
    \`\`\`json
    ${payload}
    \`\`\`

    **Analysis Checklist:**
    1.  **Algorithm Analysis:**
        - Check the \`alg\` claim in the header. Is it \`none\`? This is a critical vulnerability.
        - Is it a symmetric algorithm like \`HS256\`? If so, emphasize the importance of keeping the secret key confidential and not exposing it client-side.
        - Is it an asymmetric algorithm like \`RS256\`? Remind the developer to protect the private key.
    2.  **Payload Claims Analysis (Security Best Practices):**
        - Are standard expiry claims present and reasonable? Check for \`exp\` (expiration time), \`nbf\` (not before), and \`iat\` (issued at). Note if any are missing.
        - Check for sensitive data exposure. Does the payload contain Personally Identifiable Information (PII) like emails, full names, addresses, or internal IDs that should not be exposed to the client?
        - Analyze privilege-related claims (e.g., \`role\`, \`permissions\`, \`isAdmin\`). Are the roles too broad? Is there a risk of excessive privilege?
    3.  **Signature:**
        - Remind the user that the signature's security depends entirely on the secrecy of the key (for symmetric algs) or private key (for asymmetric algs).

    **Output Format:**
    Provide your analysis as a clear, well-structured markdown report. Use headings, bullet points, and code snippets for clarity.
    - Start with an **Overall Assessment**.
    - Create a section for **Header Analysis**.
    - Create a section for **Payload Analysis**.
    - Conclude with a list of **Actionable Recommendations** for the developer.
`;

/**
 * Creates the prompt for the JWT Red Team (Offensive) analysis.
 * @param header The decoded JWT header as a JSON string.
 * @param payload The decoded JWT payload as a JSON string.
 * @returns The complete prompt string.
 */
export const createJwtRedTeamPrompt = (header: string, payload: string): string => `
    Act as a seasoned red team operator analyzing a JSON Web Token (JWT) for attack vectors.
    Your goal is to identify how this token can be abused to compromise the application.

    **JWT Header:**
    \`\`\`json
    ${header}
    \`\`\`

    **JWT Payload:**
    \`\`\`json
    ${payload}
    \`\`\`

    **Attack Vector Analysis:**
    1.  **Algorithm Manipulation:**
        - If \`alg\` is \`RS256\`, explain the "Algorithm Confusion Attack" (switching to \`HS256\`) and provide a conceptual command for forging a token.
        - If \`alg\` is \`none\`, explain how this allows forging tokens with arbitrary payloads.
    2.  **Claim Exploitation:**
        - Identify all claims that could be manipulated for privilege escalation (e.g., \`user_id\`, \`role\`, \`isAdmin\`).
        - Analyze claims that might control business logic (\`subscription_level\`, etc.) for potential abuse.
        - Check for \`jku\` or \`x5u\` header claims and explain how they can be exploited.
    3.  **Information Disclosure:**
        - Point out any sensitive data in the payload useful for further attacks (internal IDs, software versions, etc.).
    4.  **Signature Cracking:**
        - If the algorithm is symmetric (\`HS256\`), mention the possibility of offline brute-force cracking with tools like hashcat if the secret is weak.

    **Output Format:**
    Provide your analysis as a markdown report from an attacker's perspective.
    - Start with a **Summary of Attack Surface**.
    - Create sections for each potential attack vector (e.g., **Algorithm Confusion**, **Claim Manipulation**).
    - For each vector, provide a **Hypothetical Attack Scenario** and suggest **Exploitation Payloads** or modifications.
`;
