// services/prompts/validation.ts
import type { Vulnerability } from '../../types.ts';

/**
 * Creates the prompt for validating a vulnerability finding.
 * @param vulnerability The vulnerability finding to validate.
 * @returns The complete prompt string.
 */
export const createValidationPrompt = (vulnerability: Vulnerability): string => `
    Act as an extremely skeptical senior security analyst. Your task is to validate the following vulnerability finding.
    Your objective is to find any indication that this finding could be an AI hallucination or a false positive.

    **Finding to Validate:**
    \`\`\`json
    ${JSON.stringify(vulnerability, null, 2)}
    \`\`\`

    **Validation Methodology:**
    1.  **Re-evaluate Context:** Analyze the "vulnerability" and "description" fields. Are there any contradictions? Is the Proof-of-Concept (PoC) plausible given the information?
    2.  **PoC Review:** If the \`vulnerableCode\` field contains a payload or pattern, could this realistically work, or is it a superficial conjecture?
    3.  **Search for Counter-Evidence:** Based on your knowledge and search capabilities, look for any information that contradicts or casts doubt on the finding. Is it a known vulnerability that has been patched?

    **Output Format:**
    Your response MUST be a single, valid JSON object with the following keys:
    - **is_valid**: (boolean) \`true\` if the finding appears to be genuine. \`false\` if it is a potential false positive or hallucination.
    - **reasoning**: (string) A concise explanation of why the finding is valid or why it is considered a false positive.
    
    Do not include any conversational text or markdown outside of the JSON object.
`;
