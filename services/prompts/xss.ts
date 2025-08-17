// services/prompts/xss.ts
import type { Vulnerability } from '../../types.ts';

/**
 * Creates the prompt for generating XSS payloads based on a vulnerability.
 * @param vulnerability The vulnerability context.
 * @param samplePayloads A list of sample payloads to seed the generation.
 * @returns The complete prompt string.
 */
export const createXssPayloadGenerationPrompt = (vulnerability: Vulnerability, samplePayloads?: string[]): string => {
    let referencePayloadsPrompt = '';
    if (samplePayloads && samplePayloads.length > 0) {
        referencePayloadsPrompt = `
        
**Reference Payloads:**
For additional inspiration, here is a list of common XSS payloads. Cross-reference these with your analysis of the injection context. Select, adapt, and include the most relevant payloads from this list in your final output. Ensure the final list is diverse and effective.

${samplePayloads.join('\n')}
        `;
    }

  return `
    Act as a master penetration tester specializing in XSS. Based on the following vulnerability, generate a set of diverse, non-malicious XSS payloads for manual verification.
    
    Vulnerability Type: ${vulnerability.vulnerability}
    Description: ${vulnerability.description}
    Vulnerable Snippet/URL Pattern: \`${vulnerability.vulnerableCode}\`

    **Analysis:**
    First, meticulously analyze the "Vulnerable Snippet/URL Pattern" and "Description" to understand the injection context.
    - Is the injection inside an HTML attribute? What kind of quotes are used (single ', double ", or none)?
    - Is the injection directly into HTML content?
    - Is it inside a JavaScript string?

    **Payload Requirements:**
    Generate a list of payloads demonstrating different techniques. For each, provide a 'description' and 'mechanism'. Prioritize payloads that are easily verifiable via a browser's alert() or confirm() box.

    1.  **Simple Alert PoC:** Create a payload that triggers a simple \`alert(1)\` or \`alert(document.domain)\`.
    2.  **Cookie Exfiltration PoC:** Create a payload that attempts to display \`document.cookie\` using an \`alert()\`.
    3.  **Encoded Payload:** Create at least one payload that uses encoding (e.g., HTML entities, URL encoding) to bypass simple filters.

    For each payload, break out of the context identified in your analysis (e.g., use \`"><script>...\` to escape an attribute).
    ${referencePayloadsPrompt}

    **Output Format:**
    Return a single, valid JSON object with two keys: "explanation" and "payloads".
    - "explanation": A brief, one-sentence explanation of the injection context (e.g., "The injection point is inside a double-quoted HTML attribute.").
    - "payloads": An array of objects, where each object has four keys:
      - "payload": The XSS payload string.
      - "description": What the payload's goal is (e.g., "Simple alert PoC", "Cookie theft PoC (alert)").
      - "mechanism": A short, technical explanation of HOW the payload works (e.g., "Executes script via an img tag's onerror event.").
      - "encoding": The type of encoding used (e.g., "Plain", "HTML-Encoded", "URL-Encoded").

    IMPORTANT: The entire response must be ONLY the JSON object, starting with '{' and ending with '}'.
    All string values inside the JSON, especially the 'payload', MUST be properly escaped. For example, any double quotes in a payload like \`<img src=x onerror="alert(1)">\` must be escaped as \`<img src=x onerror=\\"alert(1)\\"> \`.
    The JSON response must strictly adhere to this schema.
  `;
};