// services/prompts/consolidation.ts

/**
 * Creates the prompt for consolidating multiple vulnerability reports.
 * @param reportsJson A stringified JSON array of VulnerabilityReport objects.
 * @returns The complete prompt string.
 */
export const createConsolidationPrompt = (reportsJson: string): string => `
    Act as an expert security analyst. You have been given a JSON array containing multiple vulnerability reports from separate runs of an automated scanner.
    Your task is to analyze all the findings, intelligently consolidate duplicates, merge descriptions, and produce a single, final, de-duplicated, high-quality report.

    **Methodology:**
    1.  **De-duplication:** Identify duplicate vulnerabilities. A duplicate is a finding with the same 'vulnerability' name and the same 'injectionPoint' (or both null).
    2.  **Merging:** When you find duplicates, merge them into a single entry. Choose the highest 'severity' from the duplicates. Combine the 'description', 'impact', and 'recommendation' fields to be more comprehensive, taking the best details from each.
    3.  **Final Report:** Construct a new, single JSON object that adheres to the VulnerabilityReport schema.

    **Input Data:**
    The raw data is a JSON array of reports:
    \`\`\`json
    ${reportsJson}
    \`\`\`

    **Output Format:**
    Your entire response MUST be a single, valid JSON object conforming to the VulnerabilityReport schema.
    - 'analyzedTarget' should be taken from the first report in the input.
    - 'vulnerabilities' should be the final, de-duplicated and merged list of vulnerabilities.
    - Ensure all string values in the final JSON are properly escaped.
    - Do not include any conversational text or markdown formatting. The response must start with '{' and end with '}'.
`;