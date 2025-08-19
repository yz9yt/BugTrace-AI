# BugTrace-AI

[![Wiki Documentation](https://img.shields.io/badge/Wiki%20Documentation-000?logo=wikipedia&logoColor=white)](https://deepwiki.com/yz9yt/BugTrace-AI)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Beta-orange)
![Docker](https://img.shields.io/badge/Docker-Supported-blue?logo=docker)
![Made with](https://img.shields.io/badge/Made%20with-❤️-red)


****

| Product Demo English | Demostracion del producto Spanish |
| :---: | :---: |
| [![Product Demo English](https://img.youtube.com/vi/exrqesNWp1M/0.jpg)](https://youtu.be/exrqesNWp1M) | [![Demostración del producto en español](https://img.youtube.com/vi/CwT66Uqe6to/0.jpg)](https://youtu.be/CwT66Uqe6to) |

## 📑 Table of Contents
- [🚨 Disclaimer](#-disclaimer)
- [✨ Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Getting Started](#-getting-started)
- [📜 License](#-license)

***
BugTrace-AI is a comprehensive web vulnerability analysis suite that leverages the power of Generative AI to assist developers, penetration testers, and security analysts. It provides a rich set of tools for both static (SAST) and dynamic (DAST) analysis, vulnerability research, and payload generation, all within a single, intuitive interface.

The core philosophy of BugTrace-AI is to act as an intelligent assistant, performing non-invasive reconnaissance and analysis to form high-quality hypotheses about potential vulnerabilities, which serve as a starting point for manual investigation.

## 🚨 Disclaimer
This application is provided for educational and research purposes only.

The AI's output may contain inaccuracies, false positives, or false negatives. It is NOT a substitute for professional security auditing or manual code review.

By using this tool, you acknowledge and agree that you will only test applications for which you have explicit, written permission from the owner.

The creator of this tool assumes no liability for any misuse or damage caused by this application. Always verify findings manually.

## ✨ Features
BugTrace-AI is organized into a suite of powerful, specialized tools designed to cover various aspects of a web security audit.

### Core Analysis Tools
- 🤖 **WebSec Agent**: An expert AI chat assistant for any web security question. Ask it about security concepts, mitigation techniques, secure coding practices, or how to use security tools.

- 🔗 **URL Analysis (DAST)**: A non-invasive Dynamic Application Security Test. It uses the AI's search capabilities to analyze a URL's structure, identify the technology stack, and search for public vulnerabilities without sending any malicious traffic to the target. It features multiple scan modes:
  - **Recon Scan**: Focuses on passive reconnaissance and public exploit searching.
  - **Active Scan (Simulated)**: Analyzes URL patterns and parameters to hypothesize vulnerabilities like SQLi and XSS.
  - **Grey Box Scan**: Combines DAST with SAST by analyzing the page's live JavaScript, allowing the AI to correlate findings for higher accuracy.

- 💻 **Code Analysis (SAST)**: A "white-box" testing tool. Paste a code snippet, and the AI will act as an expert security code reviewer, looking for insecure functions, logic flaws, and common vulnerability patterns like SQL Injection and XSS.

- 📜 **Security Headers Analyzer**: Fetches and analyzes the live HTTP security headers of a target URL (e.g., CSP, HSTS, X-Frame-Options), providing an overall security score and actionable recommendations based on modern best practices.

### Specialized Vulnerability Scanners
- 📈 **DOM XSS Pathfinder**: A specialized tool that performs AI-powered static data flow analysis on JavaScript code. It identifies user-controlled sources (like location.hash) and dangerous sinks (like .innerHTML) and traces the data flow between them to find high-confidence DOM XSS vulnerabilities.

- 🔑 **JWT Decompiler & Auditor**: Decode and analyze JSON Web Tokens. It offers two audit modes:
  - **Blue Team (Defensive)**: Checks for security best-practice violations like weak algorithms (alg: none) and sensitive data exposure.
  - **Red Team (Offensive)**: Looks for attack vectors like algorithm confusion attacks and claim manipulation for privilege escalation.

- 🚀 **PrivEsc Pathfinder**: An AI-powered research assistant for post-exploitation. Provide a technology (e.g., WordPress) and version, and it will search public databases (CVEs, Exploit-DB) for known Privilege Escalation (PrivEsc) and RCE exploits.

- 📤 **File Upload Auditor**: A two-step tool to first use AI to detect file upload forms on a website, and then generate various types of malicious files (e.g., SVG with scripts, polyglot files) to test the security of the upload functionality.

### Reconnaissance & Discovery Tools
- 🔭 **JS Reconnaissance**: A specialized static analysis tool that parses JavaScript files to quickly find hardcoded API endpoints, URLs, and potential secrets like API keys or tokens.

- 🗺️ **URL List Finder**: Discovers all known URLs for a target domain by querying the extensive index of the Wayback Machine.

- 🧭 **Subdomain Finder**: Finds subdomains by searching public Certificate Transparency (CT) logs via crt.sh, a highly reliable method for subdomain discovery.

### Payload & Exploitation Tools
- 🔥 **Payload Forge**: Enter a base payload (e.g., an XSS script), and the AI will generate dozens of advanced variations using obfuscation and encoding techniques designed to bypass Web Application Firewalls (WAFs).

- 🧩 **SSTI Forge**: Generate Server-Side Template Injection payloads tailored for specific template engines (Jinja2, Twig, Freemarker, etc.) and goals, such as command execution.

- 📡 **OOB Interaction Helper**: A utility to generate Out-of-Band (OOB) payloads for blind vulnerabilities. Combine it with a callback service like interact.sh to craft payloads for Blind XSS, Log4Shell, and more.

## 🔬 Core Methodology: Enhancing AI Reliability
Generative AI can be non-deterministic. To combat this, BugTrace-AI employs a unique, multi-layered strategy to ensure the highest quality results.

- **Recursive Analysis (Analysis Depth)**: Instead of a single scan, the tool performs multiple analysis runs for each request. Critically, each run uses a slightly different prompt variation, asking the AI to adopt a different "persona" (e.g., "bug bounty hunter," then "meticulous code auditor"). This forces the AI to analyze the target from multiple angles, significantly reducing the chance of missing a vulnerability.

- **AI-Powered Consolidation**: After the recursive runs are complete, the tool gathers all individual reports and sends them back to the AI with a final prompt: "Act as a senior security analyst. Analyze these separate reports, de-duplicate the findings, merge similar descriptions, and produce a single, consolidated, high-quality final report."

- **Deep Analysis (Optional Refinement Pass)**: When enabled, this feature takes each finding from the consolidated report and sends it back to the AI for a dedicated refinement pass. The AI is prompted to focus exclusively on that one vulnerability to write a better Proof-of-Concept, a more detailed impact scenario, and a more precise recommendation.

This process of **Recursion -> Consolidation -> Refinement** is the core of the tool's power, transforming a potentially noisy AI process into a much more reliable and accurate one.

## 🛠️ Technology Stack
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Provider**: OpenRouter (compatible with models like Google Gemini, Anthropic Claude, and OpenAI GPT)
- **Deployment**: Docker, Nginx

## 🚀 Getting Started
The application is designed to be run easily and securely using Docker.

### Prerequisites
- Docker
- Docker Compose

### Installation & Running
Clone the repository:

```bash
git clone https://github.com/yz9yt/BugTrace-AI.git
cd BugTrace-AI
```

Make the deployment script executable:

```bash
chmod +x dockerizer.sh
```

Run the script to build and launch the application:

```bash
./dockerizer.sh
```

The script will build the Docker image and start the container in detached mode. You can now access BugTrace-AI at [http://localhost:6869](http://localhost:6869).

To stop the application, run:

```bash
docker-compose -f docker-compose.yml down
```

### API Configuration
All AI-powered features require an API key.

- Click the **Settings** icon (⚙️) in the header.
- The application uses [OpenRouter.ai](https://openrouter.ai) to allow access to a wide variety of models. You will need to get an OpenRouter API key.
- Enter your key in the settings modal.
- **Model Recommendation**: For the best performance and reliability, it is highly recommended to use the **google/gemini-flash** model, as the application's internal prompts have been specifically engineered and optimized for it.
- You can optionally choose to save the key in your browser's localStorage for convenience.

## 📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

---
Made with ❤️ by Albert C [@yz9yt](https://x.com/yz9yt)
