// services/prompts/domXss.ts

/**
 * Creates the prompt for the DOM XSS Pathfinder feature.
 * @param code The JavaScript code to analyze.
 * @returns The complete prompt string.
 */
export const createDomXssPathfinderPrompt = (code: string): string => `
    Act as an expert static analysis engine for DOM-based Cross-Site Scripting (XSS).
    Your task is to perform data flow analysis on the provided JavaScript code to find vulnerable paths from user-controlled sources to dangerous sinks.

    **Methodology:**
    1.  **Identify Sources:** Find all occurrences of user-controllable data sources (e.g., \`location.hash\`, \`location.search\`, \`document.URL\`, \`document.referrer\`, \`window.name\`).
    2.  **Identify Sinks:** Find all occurrences of dangerous functions or properties that can execute code if they receive untrusted data (e.g., \`.innerHTML\`, \`.outerHTML\`, \`document.write()\`, \`eval()\`, \`setTimeout()\`, \`new Function()\`).
    3.  **Trace Data Flow:** This is the most critical step. Trace the flow of data from each identified source. Follow variable assignments and function calls to determine if a source's data can reach a sink.
    
    **Output Format:**
    Your entire response MUST be a single, valid JSON object. The object must contain two keys: \`connected_paths\` and \`unconnected_findings\`.

    1.  \`connected_paths\`: An array for high-confidence findings. Only include an entry here if you have **confirmed a complete data path** from a source to a sink. Each object in this array must contain:
        - \`source\`: (string) The user-controlled source (e.g., "location.hash").
        - \`sink\`: (string) The dangerous sink (e.g., ".innerHTML").
        - \`code_snippet\`: (string) The specific line(s) of code demonstrating the variable assignment or function call that connects the source to the sink.
        - \`explanation\`: (string) A clear, concise explanation of the exploit path and how to trigger it.

    2.  \`unconnected_findings\`: An array for informational findings. List any sources or sinks you identified but **could not trace a clear path for**. Each object in this array must contain:
        - \`type\`: (string) Either "source" or "sink".
        - \`value\`: (string) The name of the source or sink found (e.g., "document.referrer", "eval()").

    If you find no sources or sinks at all, return empty arrays for both keys.
    Do not add any conversational text or markdown. The raw response must be only the JSON object.
`;