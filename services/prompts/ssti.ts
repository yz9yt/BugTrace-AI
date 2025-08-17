// services/prompts/ssti.ts

/**
 * Creates the prompt for the SSTI Forge feature.
 * @param engine The template engine.
 * @param goal The desired outcome for the payload.
 * @returns The complete prompt string.
 */
export const createSstiForgePrompt = (engine: string, goal: string): string => `
    Act as a master penetration tester specializing in Server-Side Template Injection (SSTI).
    Your task is to generate a diverse list of SSTI payloads for the specified template engine and goal.

    Template Engine: \`${engine}\`
    Goal: \`${goal}\`

    **Instructions:**
    1.  Analyze the goal. If it's a command, generate payloads for command execution. If it's a file path, generate payloads for file reading. If it's something else, be creative.
    2.  Generate at least 3 distinct and effective payloads tailored to the \`${engine}\` engine. If the engine is 'Generic', provide payloads that work across multiple engines if possible.
    3.  For each payload, explain its mechanism.

    **Output Format:**
    Return a single, valid JSON object. This object must have a single key, "payloads", which is an array of objects.
    Each object in the "payloads" array must have exactly three keys:
    1.  "technique": A short string naming the type of payload (e.g., "Command Execution via subprocess", "File Read via read()").
    2.  "description": A brief, one-sentence explanation of how this specific payload works.
    3.  "payload": The generated, ready-to-use SSTI payload string.

    IMPORTANT: The entire response must be ONLY the JSON object, starting with '{' and ending with '}'.
    Ensure all string values inside the JSON, especially the 'payload', are properly escaped for JSON validity.
`;
