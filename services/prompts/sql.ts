// services/prompts/sql.ts
import type { Vulnerability, ExploitContext } from '../../types.ts';

/**
 * Creates the prompt for generating an sqlmap command.
 * @param vulnerability The SQLi vulnerability context.
 * @param url The target URL.
 * @returns The complete prompt string.
 */
export const createSqlmapCommandGenerationPrompt = (vulnerability: Vulnerability, url: string): string => `
    Act as a world-class penetration tester and an expert in using the \`sqlmap\` tool.
    Your task is to generate the most effective and practical \`sqlmap\` command to test the specified SQL Injection vulnerability.

    **Vulnerability Context:**
    - URL: \`${url}\`
    - Vulnerability Details: ${JSON.stringify(vulnerability, null, 2)}

    **Command Requirements:**

    1.  **Target and Injection Point:**
        - The target URL (\`-u\`) MUST be the one provided. Enclose it in double quotes.
        - If \`injectionPoint.method\` is 'GET', you MUST specify the vulnerable parameter using \`-p "${vulnerability.injectionPoint.parameter}"\`.
        - If \`injectionPoint.method\` is 'POST', you MUST use the \`--data\` flag. Construct a plausible data string (e.g., \`"param1=value1&${vulnerability.injectionPoint.parameter}=test"\`). You MUST ALSO specify the parameter to test with \`-p "${vulnerability.injectionPoint.parameter}"\`.
        - If \`injectionPoint.type\` is 'PATH', mark the injection point in the URL path with a \`*\`. For example: \`https://example.com/vuln-path*/some/other/part\`.

    2.  **Tuning and Performance:**
        - Include \`--level=3\` and \`--risk=2\` for a more thorough scan that includes tests for time-based blind SQLi and is more comprehensive.

    3.  **Automation and Evasion:**
        - Always include \`--batch\` to run non-interactively, accepting default answers.
        - Always include \`--random-agent\` to use a random, valid User-Agent string.

    4.  **Enumeration Goal:**
        - The command's primary goal should be to enumerate databases. Use the \`--dbs\` flag.

    5.  **Authentication (Very Important):**
        - If the vulnerability description or URL suggests an authenticated session (e.g., words like 'profile', 'dashboard', 'account'), you MUST include a placeholder for a session cookie: \`--cookie="SESSIONID=your_cookie_here"\`.

    **Output Format:**
    Your response MUST be a single, valid JSON object. Do not include any text or markdown outside of the JSON object.
    The object must have two keys: \`command\` and \`explanation\`.

    - \`"command"\`: (string) The complete, ready-to-use \`sqlmap\` command.
    - \`"explanation"\`: (string) A clear, concise, and helpful explanation of the command. Break down what each flag does. **Crucially, if you included a cookie placeholder, you must explicitly tell the user to replace it with their actual session cookie.**

    **Example Output Structure:**
    \`\`\`json
    {
      "command": "sqlmap -u \\"https://example.com/profile?id=123\\" -p \\"id\\" --cookie=\\"SESSIONID=your_cookie_here\\" --level=3 --risk=2 --random-agent --batch --dbs",
      "explanation": "This command targets the 'id' parameter for injection. --level=3 and --risk=2 enable more advanced tests. --random-agent helps evade simple filters. --batch runs non-interactively. --dbs attempts to list all databases. **IMPORTANT:** You must replace 'your_cookie_here' with your valid session cookie for this authenticated endpoint."
    }
    \`\`\`
`;

/**
 * Creates the initial prompt for the SQLi Exploitation Assistant.
 * @param context The vulnerability context for the chat.
 * @returns The complete prompt string.
 */
export const createInitialSqlExploitChatPrompt = (context: ExploitContext): string => {
    const { vulnerability, targetUrl } = context;

    if (!vulnerability.injectionPoint || !targetUrl) {
        return "Error: SQLi exploit context is missing required injection point details or target URL.";
    }

    return `
        You are an SQL Injection specialist assistant. A potential vulnerability has been found. Your task is to provide a direct, actionable, step-by-step guide to manually confirm and exploit this vulnerability. This is the first message; provide your initial analysis and confirmation steps, then await my follow-up questions.

        **Vulnerability Details:**
        - **Type:** ${vulnerability.vulnerability}
        - **Target URL:** ${targetUrl}
        - **Injection Parameter:** ${vulnerability.injectionPoint.parameter}
        - **Method:** ${vulnerability.injectionPoint.method}
        - **Preliminary PoC/Pattern:** \`${vulnerability.vulnerableCode}\`

        **Your Initial Task: Vulnerability Confirmation**
        Your goal is to guide a bug bounty hunter through the manual confirmation process.
        1.  **Explain the Hypothesis:** Briefly explain why this parameter might be vulnerable based on the URL structure.
        2.  **Provide Confirmation Payloads:** Offer a series of simple payloads to test for the vulnerability. Start with syntax-breaking characters, then logical tests.
            - Example for syntax breaking: \`'\`, \`"\`, \`\\'\`
            - Example for logical tests: \`' OR 1=1-- \`, \`' AND 1=2-- \`
        3.  **Explain Expected Outcomes:** For each payload, clearly describe what the user should look for in the application's response (e.g., a database error message, a change in page content, no change in content).
        4.  **Conclude with a Question:** End your response by asking the user to perform these tests and report back the results so you can guide them to the next step (e.g., finding the number of columns with ORDER BY).

        After this, I will provide the results, and you will guide me through enumeration.
    `;
};