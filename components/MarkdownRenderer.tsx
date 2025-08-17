// components/MarkdownRenderer.tsx
import { marked } from 'marked';
import React, { useMemo } from 'react';

// Configure marked options once
marked.setOptions({
  gfm: true, // Enable GitHub Flavored Markdown
  breaks: true, // Use GFM line breaks
  pedantic: false, // Don't be strict about syntax
});

interface MarkdownRendererProps {
  content: string;
}

// Inlined styles to replace Tailwind's @tailwindcss/typography (prose) plugin,
// which doesn't work with dynamically generated content from a CDN build.
// This ensures that markdown content is always styled correctly.
const markdownStyles = `
.markdown-content ul,
.markdown-content ol {
    list-style: revert;
    margin-left: 2em;
    margin-block-start: 1em;
    margin-block-end: 1em;
    padding-inline-start: 1.5em;
}
.markdown-content li {
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
}
.markdown-content strong,
.markdown-content b {
    font-weight: 600;
}
.markdown-content p {
    margin-block-start: 0.8em;
    margin-block-end: 0.8em;
}
.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 {
    color: #93c5fd; /* light blue */
    border-bottom: 1px solid #374151;
    padding-bottom: 0.3em;
    margin-block-start: 1.5em;
    margin-block-end: 1em;
}
.markdown-content h1 { font-size: 1.5em; }
.markdown-content h2 { font-size: 1.25em; }
.markdown-content h3 { font-size: 1.1em; }
.markdown-content h4 { font-size: 1.0em; }

.markdown-content code {
    background-color: rgba(0, 0, 0, 0.4);
    color: #fca5a5; /* red-300 */
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    border-radius: 6px;
    font-family: 'Fira Code', 'Courier New', monospace;
    word-wrap: break-word;
}

.markdown-content pre {
    background-color: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    padding: 1em;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 0.9rem;
}

.markdown-content pre code {
    background-color: transparent;
    padding: 0;
    font-size: 100%;
    color: inherit;
    border: none;
}

.markdown-content a {
    color: #93c5fd;
    text-decoration: underline;
}

.markdown-content blockquote {
    padding-inline-start: 1em;
    border-inline-start: 0.25em solid var(--control-border);
    color: var(--text-secondary);
    font-style: italic;
    margin-block: 1em;
    margin-inline: 0;
}
`;

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const parsedHtml = useMemo(() => {
        if (!content) return '';
        // Note: In a production app with user-generated content,
        // you would add a sanitizer like DOMPurify here for security.
        // For this app, the content is from a trusted AI source.
        return marked.parse(content) as string;
    }, [content]);

    return (
        <>
            <style>{markdownStyles}</style>
            <div 
                className="markdown-content max-w-none text-current break-words"
                dangerouslySetInnerHTML={{ __html: parsedHtml }} 
            />
        </>
    );
};
