// services/prompts/jsonFix.ts

/**
 * Creates a prompt to ask the AI to fix a malformed JSON string, providing full context.
 * @param originalPrompt The prompt that originally generated the malformed JSON.
 * @param malformedJson The broken JSON string.
 * @param errorMessage The error message from the JSON parser.
 * @returns The complete prompt string.
 */
export const createFixJsonPrompt = (originalPrompt: string, malformedJson: string, errorMessage: string): string => `
    You are a JSON correction specialist. Your previous attempt to generate a JSON object failed. Your task is to analyze the original request, the malformed JSON you produced, and the resulting parser error, then provide a perfectly valid JSON object that meets the original request.

    **1. Original Request:**
    This was the prompt you were originally given. Pay close attention to the requested "Output Format" or schema.
    \`\`\`
    ${originalPrompt}
    \`\`\`

    **2. Your Malformed JSON Response:**
    This is the JSON you generated, which is syntactically incorrect.
    \`\`\`json
    ${malformedJson}
    \`\`\`

    **3. The Parser Error:**
    This is the specific error message produced when trying to parse your response.
    \`\`\`
    ${errorMessage}
    \`\`\`

    **Your Task:**
    Analyze the error in the context of the original request. Common mistakes include trailing commas, unescaped quotes within string values, or including conversational text.
    Your entire response MUST be ONLY the corrected, valid JSON object that satisfies the original request's schema. Do not add any conversational text, markdown, or explanations. Your response must start with '{' or '[' and end with '}' or ']'.
`;