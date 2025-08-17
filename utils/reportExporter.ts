// utils/reportExporter.ts
import { VulnerabilityReport, HeadersReport } from '../types.ts';

/**
 * Sanitizes a string to be used as part of a filename.
 * @param name The string to sanitize.
 * @returns A sanitized string safe for filenames.
 */
export const sanitizeFilename = (name: string): string => {
    return name.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
};

/**
 * Triggers a file download in the browser.
 * @param filename The desired name of the file.
 * @param content The content of the file.
 * @param mimeType The MIME type of the file.
 */
export const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


// --- Vulnerability Report Exporters ---

const generateMarkdownReport = (report: VulnerabilityReport): string => {
    let md = `# BugTrace-AI Security Report\n\n`;
    md += `**Target:** \`${report.analyzedTarget}\`\n`;
    md += `**Date:** ${new Date(report.id || Date.now()).toLocaleString()}\n`;
    md += `**Findings:** ${report.vulnerabilities.length}\n\n`;
    md += `--- \n\n`;

    if (report.vulnerabilities.length === 0) {
        md += `## No Vulnerabilities Found\n\n`;
        md += `The analysis did not identify any vulnerabilities based on the selected scan type.\n`;
        return md;
    }

    report.vulnerabilities.forEach((vuln, index) => {
        md += `## ${index + 1}. ${vuln.vulnerability}\n\n`;
        md += `**Severity:** ${vuln.severity}\n\n`;
        md += `### Description\n${vuln.description}\n\n`;
        md += `### Impact\n${vuln.impact}\n\n`;
        if (vuln.vulnerableCode) {
            md += `### Vulnerable Pattern / PoC\n`;
            md += "```\n" + vuln.vulnerableCode + "\n```\n\n";
        }
        md += `### Recommendation\n${vuln.recommendation}\n\n`;
        md += `--- \n\n`;
    });

    return md;
};

export const downloadReportAsMarkdown = (report: VulnerabilityReport) => {
    const markdownContent = generateMarkdownReport(report);
    const date = new Date(report.id || Date.now()).toISOString().split('T')[0];
    const filename = `bugtrace-report-${sanitizeFilename(report.analyzedTarget)}-${date}.md`;
    triggerDownload(filename, markdownContent, 'text/markdown;charset=utf-8');
};

export const downloadReportAsJson = (report: VulnerabilityReport) => {
    const jsonContent = JSON.stringify(report, null, 2);
    const date = new Date(report.id || Date.now()).toISOString().split('T')[0];
    const filename = `bugtrace-report-${sanitizeFilename(report.analyzedTarget)}-${date}.json`;
    triggerDownload(filename, jsonContent, 'application/json;charset=utf-8');
};

// --- Headers Report Exporters ---

const generateHeadersMarkdownReport = (report: HeadersReport): string => {
    let md = `# BugTrace-AI Security Headers Report\n\n`;
    md += `**Target:** \`${report.analyzedUrl}\`\n`;
    md += `**Overall Score:** ${report.overallScore}\n`;
    md += `**Summary:** ${report.summary}\n\n`;
    md += `--- \n\n`;

    report.findings.forEach((finding, index) => {
        md += `## ${index + 1}. ${finding.name}\n\n`;
        md += `- **Status:** ${finding.status}\n`;
        md += `- **Severity:** ${finding.severity}\n`;
        if (finding.value) {
            md += `- **Value:** \`${finding.value}\`\n`;
        }
        md += `\n**Recommendation:**\n${finding.recommendation}\n\n`;
        md += `--- \n\n`;
    });

    return md;
};

export const downloadHeadersReportAsMarkdown = (report: HeadersReport) => {
    const markdownContent = generateHeadersMarkdownReport(report);
    const date = new Date().toISOString().split('T')[0];
    const filename = `bugtrace-headers-report-${sanitizeFilename(report.analyzedUrl)}-${date}.md`;
    triggerDownload(filename, markdownContent, 'text/markdown;charset=utf-8');
};

export const downloadHeadersReportAsJson = (report: HeadersReport) => {
    const jsonContent = JSON.stringify(report, null, 2);
    const date = new Date().toISOString().split('T')[0];
    const filename = `bugtrace-headers-report-${sanitizeFilename(report.analyzedUrl)}-${date}.json`;
    triggerDownload(filename, jsonContent, 'application/json;charset=utf-8');
};