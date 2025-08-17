// services/prompts/fileUpload.ts

/**
 * Creates the prompt for the File Upload Auditor feature. This is the first attempt,
 * using a broader "pentester" persona that leverages search.
 * @param url The URL to analyze for a file upload form.
 * @returns The complete prompt string.
 */
export const createFileUploadAnalysisPrompt = (url: string): string => {
    const hostname = new URL(url).hostname;
    return `
    Act as an expert penetration tester. Your task is to analyze the following URL and its associated domain to find a file upload form.

    Target URL: ${url}

    **Methodology:**
    1.  **Intelligent Search (Primary Step):** Your most important task is to use your search tool to find pages on the domain \`${hostname}\` that are likely to contain a file upload form. Use queries like \`site:${hostname} inurl:upload\`, \`site:${hostname} "choose file"\`, or \`site:${hostname} "select file"\`. The target URL provided is a starting point, but you must search the entire site.
    2.  **Fetch and Analyze HTML:** From the most relevant search result, fetch and scrutinize its complete HTML source code. Look for an HTML \`<form>\` that contains an \`<input type="file">\` element.
    3.  **Extract Form Details:** If a form is found, you MUST extract the following details from the HTML:
        - The form's \`action\` attribute (the URL it submits to).
        - The form's \`method\` attribute (e.g., 'POST').
        - The \`name\` attribute of the \`<input type="file">\` tag.
        - The \`name\` and \`value\` attributes of the submit button or any other required hidden inputs.
    4.  **Provide Analysis and Guidance:** Based on what you find, create a report.

    **Output Format:**
    Your entire response MUST be a single, valid JSON object.
    The object must contain the following keys:
    - "found": (boolean) \`true\` if you found a file upload form, \`false\` otherwise.
    - "description": (string) If found, a clear description of where the form is located and what its purpose seems to be (e.g., "A profile picture upload form was found on the user settings page."). If not found after a thorough search, state "No file upload form was detected on the website."
    - "manualTestingGuide": (string) If found, provide a detailed, step-by-step guide for a security analyst to test the upload functionality manually. This guide MUST include a precise \`cURL\` command constructed from the details you extracted in step 3. If not found, this should be an empty string.

    Example \`cURL\` command structure in your guide:
    \`\`\`
    curl -X POST -F "profile_picture=@/path/to/your/malicious.svg" -F "submit=Upload" "https://example.com/user/upload-avatar"
    \`\`\`
    You must use the *actual* inferred form details for the cURL command.

    Do not include any text or markdown outside of the main JSON object.
`;
};

/**
 * Creates the fallback prompt for the File Upload Auditor. This version acts as a strict
 * HTML parser and does NOT use search, focusing only on the provided URL.
 * @param url The URL to analyze for a file upload form.
 * @returns The complete prompt string.
 */
export const createFileUploadAnalysisPromptAttempt2 = (url: string): string => {
    return `
    Act as a strict HTML parser. Your ONLY task is to analyze the raw HTML source code of the provided URL to find a file upload form. Do NOT use search. Focus exclusively on the HTML content of this single page.

    Target URL: ${url}

    **Methodology:**
    1.  **Fetch and Analyze HTML:** Fetch and scrutinize the complete HTML source code of the exact URL provided. Look for an HTML \`<form>\` that contains an \`<input type="file">\` element.
    2.  **Extract Form Details:** If a form is found, you MUST extract the following details from the HTML:
        - The form's \`action\` attribute.
        - The form's \`method\` attribute.
        - The \`name\` attribute of the \`<input type="file">\` tag.
    3.  **Provide Analysis and Guidance:** Based on what you find, create a report.

    **Output Format:**
    Your entire response MUST be a single, valid JSON object with the following keys:
    - "found": (boolean) \`true\` if you found a file upload form, \`false\` otherwise.
    - "description": (string) If found, a clear description. If not found, state "No file upload form was detected in the page's HTML."
    - "manualTestingGuide": (string) If found, provide a detailed, step-by-step guide for a security analyst to test the upload functionality manually, including a precise \`cURL\` command. If not found, this should be an empty string.

    Do not include any text or markdown outside of the main JSON object.
`;
};