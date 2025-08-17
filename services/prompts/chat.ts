// services/prompts/chat.ts
import type { ExploitContext } from '../../types.ts';

/**
 * Creates the initial prompt to start a new chat in the XSS Exploitation Assistant.
 * @param context The vulnerability context for the chat.
 * @returns The complete prompt string.
 */
export const createInitialExploitChatPrompt = (context: ExploitContext): string => {
    const { vulnerability, targetUrl } = context;
    let initialPrompt = `
        You are an XSS exploitation specialist. A potential vulnerability has been found. Your task is to provide a direct, actionable guide to achieve a Proof-of-Concept. This is the first message; provide your initial analysis and then await my follow-up questions.
        
        **Vulnerability Details:**
        - **Type:** ${vulnerability.vulnerability}
        - **Description:** ${vulnerability.description}
    `;

    if (vulnerability.injectionPoint && targetUrl) { // DAST context
        initialPrompt += `
        - **Target URL:** ${targetUrl}
        - **Injection Parameter:** ${vulnerability.injectionPoint.parameter}
        - **Method:** ${vulnerability.injectionPoint.method}

        **Your Initial Task:**
        Your goal is to provide a step-by-step "Manual Reproduction Guide" for a bug bounty hunter.
        1.  Analyze the HTML of the target URL to find the form associated with the parameter \`${vulnerability.injectionPoint.parameter}\`.
        2.  Provide a clear and precise guide for triggering the PoC using Burp Suite or browser DevTools.
        3.  If you cannot find the form, provide a general manual testing guide.
        
        After this, I will ask follow-up questions for different payloads or bypasses.
        `;
    } else { // SAST (DOM-XSS) context
        initialPrompt += `
        - **Vulnerable Code Snippet:**
        \`\`\`javascript
        ${vulnerability.vulnerableCode}
        \`\`\`

        **Your Initial Task:**
        Your goal is to explain how to exploit this DOM-based XSS.
        1.  Analyze the code to identify the source and sink.
        2.  Provide a full Proof-of-Concept (PoC) URL that triggers the vulnerability. The URL should look like \`https://example.com/page.html#<payload>\`.
        3.  Provide a step-by-step "Manual Reproduction Guide".

        After this, I will ask follow-up questions.
        `;
    }
    return initialPrompt;
};