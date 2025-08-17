// components/UserDocumentationModal.tsx
// version 0.0.47
import React, { useState } from 'react';
import { XMarkIcon, BookOpenIcon, LinkIcon, CodeBracketIcon, ShieldExclamationIcon, CommandLineIcon, BeakerIcon, ChatIcon, CogIcon, ShieldCheckIcon, SignalIcon, CodeSearchIcon, PuzzlePieceIcon, KeyIcon, FlowChartIcon, ArrowUpTrayIcon, JwtTokenIcon, MagnifyingGlassIcon, PencilDocumentIcon } from './Icons.tsx';

interface UserDocumentationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Objeto de texto para la internacionalización
const TEXT = {
    titles: {
        en: 'User Guide & Methodology',
        es: 'Guía de Usuario y Metodología',
    },
    languageButton: {
        en: 'ES',
        es: 'EN',
    },
    sections: {
        introduction: {
            title: {
                en: 'Introduction',
                es: 'Introducción',
            },
            p1: {
                en: 'Welcome to BugTrace-AI! This tool leverages the power of Generative AI to assist developers, penetration testers, and security analysts in identifying potential web application vulnerabilities.',
                es: '¡Bienvenido a BugTrace-AI! Esta herramienta aprovecha el poder de la IA Generativa para ayudar a desarrolladores, pentesters y analistas de seguridad a identificar posibles vulnerabilidades en aplicaciones web.',
            },
            p2: {
                en: 'This guide explains the methodology behind each feature, how to use them effectively, and the limitations of this AI-powered approach.',
                es: 'Esta guía explica la metodología detrás de cada función, cómo usarlas de manera efectiva y las limitaciones de este enfoque basado en IA.',
            },
        },
        agent: {
            title: {
                en: 'WebSec Agent',
                es: 'Agente WebSec',
            },
            purposeTitle: {
                en: 'Purpose',
                es: 'Propósito',
            },
            purposeText: {
                en: 'The WebSec Agent is your go-to expert for any and all web security questions. You can open it via the chat icon in the header.',
                es: 'El Agente WebSec es tu experto de referencia para todas y cada una de las preguntas sobre seguridad web. Puedes abrirlo a través del icono de chat en el encabezado.',
            },
            listP: {
                en: 'You can ask it about a wide range of topics:',
                es: 'Puedes preguntarle sobre una amplia gama de temas:',
            },
            listItems: {
                en: [
                    '"Explain how a Cross-Site Request Forgery (CSRF) attack works."',
                    '"Show me an example of a secure way to connect to a database in Node.js."',
                    '"What is a Content Security Policy (CSP) and can you help me create one for my site?"',
                    '"How would I use a tool like Nmap to scan for open ports?"',
                ],
                es: [
                    '"Explica cómo funciona un ataque de Cross-Site Request Forgery (CSRF)."',
                    '"Muéstrame un ejemplo de una forma segura de conectarse a una base de datos en Node.js."',
                    '"¿Qué es una Content Security Policy (CSP) y puedes ayudarme a crear una para mi sitio?"',
                    '"¿Cómo usaría una herramienta como Nmap para escanear puertos abiertos?"',
                ],
            },
        },
        urlAnalysis: {
            title: {
                en: 'URL Analysis (DAST)',
                es: 'Análisis de URL (DAST)',
            },
            methodologyTitle: {
                en: 'Methodology',
                es: 'Metodología',
            },
            methodologyP1: {
                en: 'The URL Analysis functions as a Dynamic Application Security Test (DAST), but with a crucial difference: <strong>it is entirely non-invasive</strong>. The tool does <strong>not</strong> send any actual web requests, packets, or payloads to the target URL.',
                es: 'El Análisis de URL funciona como un Test de Seguridad de Aplicaciones Dinámico (DAST), pero con una diferencia crucial: <strong>es completamente no invasivo</strong>. La herramienta <strong>no</strong> envía ninguna solicitud web, paquete o payload real a la URL objetivo.',
            },
            methodologyP2: {
                en: `Instead, it uses the Gemini model's integrated Google Search grounding capabilities to gather information and form hypotheses.`,
                es: `En su lugar, utiliza las capacidades de "grounding" de Búsqueda de Google integradas en el modelo Gemini para recopilar información y formular hipótesis.`,
            },
            scanModesTitle: {
                en: 'Scan Modes Explained',
                es: 'Explicación de los Modos de Escaneo',
            },
            scanModesRecon: {
                en: `<strong>Recon Scan:</strong> This mode focuses on passive reconnaissance. The AI is prompted to use its search capability to gather publicly available information about the target domain and its technology stack (e.g., WordPress, Joomla), and then search for public vulnerability disclosures and CVEs for those technologies.`,
                es: `<strong>Escaneo de Reconocimiento:</strong> Este modo se centra en el reconocimiento pasivo. Se le indica a la IA que use su capacidad de búsqueda para recopilar información disponible públicamente sobre el dominio objetivo y su stack tecnológico (p. ej., WordPress, Joomla), y luego buscar divulgaciones públicas de vulnerabilidades y CVEs para esas tecnologías.`,
            },
            scanModesActive: {
                en: `<strong>Active Scan (Simulated):</strong> The term "Active" here is key—it's <strong>simulated</strong>. The AI analyzes the structure of the URL, including its path and query parameters (e.g., \`?id=1\`, \`?search=query\`), to identify patterns commonly associated with certain vulnerabilities (like SQLi or XSS) and form an educated hypothesis about potential weaknesses. It does not send any actual traffic.`,
                es: `<strong>Escaneo Activo (Simulado):</strong> El término "Activo" aquí es clave: es <strong>simulado</strong>. La IA analiza la estructura de la URL, incluyendo su ruta y parámetros de consulta (p. ej., \`?id=1\`, \`?search=query\`), para identificar patrones comúnmente asociados con ciertas vulnerabilidades (como SQLi o XSS) y formar una hipótesis fundamentada sobre posibles debilidades. No envía tráfico real.`,
            },
            scanModesGreyBox: {
                en: `<strong>Grey Box Scan:</strong> This is the most powerful mode. It combines the simulated DAST approach of the Active Scan with a static analysis (SAST) of the page's live JavaScript code. This allows the AI to correlate findings for higher accuracy. For example, it might dynamically find a reflection point in the URL and statically confirm that the associated JavaScript function passes that data into a dangerous sink like \`.innerHTML\`.`,
                es: `<strong>Escaneo de Caja Gris:</strong> Este es el modo más potente. Combina el enfoque DAST simulado del Escaneo Activo con un análisis estático (SAST) del código JavaScript en vivo de la página. Esto permite a la IA correlacionar hallazgos para una mayor precisión. Por ejemplo, podría encontrar dinámicamente un punto de reflexión en la URL y confirmar estáticamente que la función JavaScript asociada pasa esos datos a un "sink" peligroso como \`.innerHTML\`.`,
            },
            importantNote: {
                en: `<strong>Important:</strong> The result is an educated guess based on patterns and public data, not a confirmation. It's a starting point for a manual investigation.`,
                es: `<strong>Importante:</strong> El resultado es una conjetura fundamentada basada en patrones y datos públicos, no una confirmación. Es un punto de partida para una investigación manual.`,
            },
        },
        codeAnalysis: {
            title: {
                en: 'Code Analysis (SAST)',
                es: 'Análisis de Código (SAST)',
            },
            methodologyTitle: {
                en: 'Methodology',
                es: 'Metodología',
            },
            methodologyP1: {
                en: 'Code Analysis is a form of Static Application Security Testing (SAST), or "white-box" testing. You provide a snippet of source code, and the AI analyzes it without executing it.',
                es: 'El Análisis de Código es una forma de Test de Seguridad de Aplicaciones Estático (SAST), o test de "caja blanca". Proporcionas un fragmento de código fuente, y la IA lo analiza sin ejecutarlo.',
            },
            methodologyP2: {
                en: 'The AI is prompted to act as an expert security code reviewer. It examines the code for:',
                es: 'Se le indica a la IA que actúe como un revisor de código experto en seguridad. Examina el código en busca de:',
            },
            listItems: {
                en: [
                    `<strong>Insecure Functions:</strong> Use of dangerous functions like \`eval()\`, \`exec()\`, or insecure database query methods.`,
                    '<strong>Logic Flaws:</strong> Business logic that could be abused (e.g., improper authorization checks).',
                    '<strong>Common Vulnerability Patterns:</strong> It looks for classic signatures of vulnerabilities like SQL Injection (unsanitized query concatenation), XSS (unencoded output of user input), and others.',
                ],
                es: [
                    `<strong>Funciones Inseguras:</strong> Uso de funciones peligrosas como \`eval()\`, \`exec()\`, o métodos de consulta a base de datos inseguros.`,
                    '<strong>Fallos de Lógica:</strong> Lógica de negocio que podría ser abusada (p. ej., comprobaciones de autorización incorrectas).',
                    '<strong>Patrones de Vulnerabilidad Comunes:</strong> Busca firmas clásicas de vulnerabilidades como Inyección SQL (concatenación de consultas no sanitizadas), XSS (salida de datos de usuario sin codificar), y otras.',
                ],
            },
            howToTitle: {
                en: 'How to Get Code Snippets',
                es: 'Cómo Obtener Fragmentos de Código',
            },
            howToP1: {
                en: `The most common source of client-side code is your browser's <strong>Developer Tools</strong>.`,
                es: `La fuente más común de código del lado del cliente son las <strong>Herramientas de Desarrollador</strong> de tu navegador.`,
            },
            howToSteps: {
                en: [
                    `<strong>Open Developer Tools:</strong> Right-click on a webpage and select "Inspect", or use the shortcut <kbd>Ctrl+Shift+I</kbd> (Windows) or <kbd>Cmd+Option+I</kbd> (Mac).`,
                    `<strong>Go to the "Sources" Tab:</strong> This tab shows all files loaded by the page.`,
                    `<strong>Find JavaScript Files:</strong> In the left-hand navigator pane, look for \`.js\` files. Application logic is often found here.`,
                    `<strong>Copy Code:</strong> Select a snippet or the entire file content (<kbd>Ctrl+A</kbd>) and copy it.`,
                    `<strong>Paste and Analyze:</strong> Paste the code into the "Code Analysis" tab in this tool and run the analysis. For best results, analyze smaller, targeted functions rather than entire minified libraries.`,
                ],
                es: [
                    `<strong>Abrir Herramientas de Desarrollador:</strong> Haz clic derecho en una página web y selecciona "Inspeccionar", o usa el atajo <kbd>Ctrl+Shift+I</kbd> (Windows) o <kbd>Cmd+Option+I</kbd> (Mac).`,
                    `<strong>Ir a la Pestaña "Sources" (Fuentes):</strong> Esta pestaña muestra todos los archivos cargados por la página.`,
                    `<strong>Encontrar Archivos JavaScript:</strong> En el panel de navegación izquierdo, busca archivos \`.js\`. La lógica de la aplicación se encuentra a menudo aquí.`,
                    `<strong>Copiar Código:</strong> Selecciona un fragmento o todo el contenido del archivo (<kbd>Ctrl+A</kbd>) y cópialo.`,
                    `<strong>Pegar y Analizar:</strong> Pega el código en la pestaña "Análisis de Código" de esta herramienta y ejecuta el análisis. Para mejores resultados, analiza funciones más pequeñas y específicas en lugar de librerías enteras minificadas.`,
                ],
            },
        },
        reliability: {
            title: {
                en: 'Improving AI Reliability: Depth & Deep Analysis',
                es: 'Mejorando la Fiabilidad de la IA: Profundidad y Análisis Profundo',
            },
            p1: {
                en: 'Generative AI is a powerful but sometimes non-deterministic technology; it can miss things on a single pass. To combat this, this tool uses a multi-layered approach to significantly improve the reliability and accuracy of its results, especially for DAST and SAST.',
                es: 'La IA Generativa es una tecnología potente pero a veces no determinista; puede pasar por alto cosas en una sola pasada. Para combatir esto, la herramienta utiliza un enfoque multicapa para mejorar significativamente la fiabilidad y precisión de sus resultados, especialmente para DAST y SAST.',
            },
            depthTitle: {
                en: 'Analysis Depth (The Recursive Strategy)',
                es: 'Profundidad de Análisis (La Estrategia Recursiva)',
            },
            depthP1: {
                en: `When you select an "Analysis Depth" greater than 1, you're not just running the same scan again. You are initiating a <strong>recursive, multi-attempt strategy</strong>.`,
                es: `Cuando seleccionas una "Profundidad de Análisis" mayor que 1, no estás simplemente ejecutando el mismo escaneo de nuevo. Estás iniciando una <strong>estrategia recursiva de múltiples intentos</strong>.`,
            },
            depthSteps: {
                en: [
                    'The application sends the request to the AI multiple times (equal to the depth you selected).',
                    'Crucially, each request uses a <strong>slightly different prompt variation</strong>. The AI is asked to adopt a different "persona" for each run (e.g., "act as a bug bounty hunter," then "act as a meticulous code auditor"). This encourages the AI to look at the problem from multiple angles, catching a wider range of potential issues.',
                ],
                es: [
                    'La aplicación envía la solicitud a la IA múltiples veces (igual a la profundidad que seleccionaste).',
                    'De manera crucial, cada solicitud utiliza una <strong>variación de prompt ligeramente diferente</strong>. Se le pide a la IA que adopte una "persona" diferente para cada ejecución (p. ej., "actúa como un cazador de recompensas," luego "actúa como un auditor de código meticuloso"). Esto anima a la IA a mirar el problema desde múltiples ángulos, capturando una gama más amplia de posibles problemas.',
                ],
            },
            consolidationTitle: {
                en: 'The Consolidation Step',
                es: 'El Paso de Consolidación',
            },
            consolidationP1: {
                en: `After all recursive runs are complete, the tool performs a final, critical step. It gathers all the individual reports and sends them back to the AI with one last prompt: "Act as a senior security analyst. Analyze these separate reports, de-duplicate the findings, merge similar descriptions, and produce a single, consolidated, high-quality final report."`,
                es: `Una vez completadas todas las ejecuciones recursivas, la herramienta realiza un paso final y crítico. Recopila todos los informes individuales y los envía de nuevo a la IA con un último prompt: "Actúa como un analista de seguridad senior. Analiza estos informes separados, de-duplica los hallazgos, fusiona descripciones similares y produce un único informe final consolidado y de alta calidad."`,
            },
            consolidationP2: {
                en: 'This process of recursion and consolidation is the core of the tool\'s reliability, turning a potentially noisy process into a much more consistent one.',
                es: 'Este proceso de recursión y consolidación es el núcleo de la fiabilidad de la herramienta, convirtiendo un proceso potencialmente ruidoso en uno mucho más consistente.',
            },
            deepAnalysisTitle: {
                en: 'Deep Analysis (The Refinement Pass)',
                es: 'Análisis Profundo (La Pasada de Refinamiento)',
            },
            deepAnalysisP1: {
                en: 'Enabling "Deep Analysis" adds another layer of quality. After the consolidated report is generated, this feature takes <strong>each individual finding</strong> from that report and sends it back to the AI for a dedicated <strong>refinement pass</strong>.',
                es: 'Habilitar el "Análisis Profundo" añade otra capa de calidad. Después de generar el informe consolidado, esta función toma <strong>cada hallazgo individual</strong> de ese informe y lo envía de vuelta a la IA para una <strong>pasada de refinamiento</strong> dedicada.',
            },
            deepAnalysisP2: {
                en: 'The AI is given a specialized prompt like, "Focus exclusively on this one finding. Refine the description into a better PoC, write a more detailed impact scenario, and provide a code-level recommendation."',
                es: 'Se le da a la IA un prompt especializado como, "Concéntrate exclusivamente en este hallazgo. Refina la descripción para crear una mejor PoC, escribe un escenario de impacto más detallado y proporciona una recomendación a nivel de código."',
            },
            tradeOffNote: {
                en: `<strong>The Trade-Off:</strong> Using higher depth and enabling deep analysis produces significantly better reports but will take longer and use more API credits.`,
                es: `<strong>La Contrapartida:</strong> Usar una mayor profundidad y habilitar el análisis profundo produce informes significativamente mejores, pero tardará más y consumirá más créditos de API.`,
            },
        },
        jsRecon: {
            title: {
                en: 'JS Reconnaissance',
                es: 'Reconocimiento de JS',
            },
            methodologyTitle: {
                en: 'Methodology',
                es: 'Metodología',
            },
            p1: {
                en: 'The JS Reconnaissance tool is a specialized form of static analysis designed to quickly parse JavaScript files for valuable information during the reconnaissance phase of a penetration test.',
                es: 'La herramienta de Reconocimiento de JS es una forma especializada de análisis estático diseñada para analizar rápidamente archivos JavaScript en busca de información valiosa durante la fase de reconocimiento de un test de penetración.',
            },
            p2: {
                en: 'You paste the content of a JavaScript file, and the AI is prompted to act as a security researcher specifically looking for:',
                es: 'Pega el contenido de un archivo JavaScript, y se le indica a la IA que actúe como un investigador de seguridad buscando específicamente:',
            },
            listItems: {
                en: [
                    `<strong>API Endpoints:</strong> Relative paths that indicate API routes (e.g., \`/api/v2/users\`, \`/internal/getData\`).`,
                    `<strong>Hardcoded URLs:</strong> Full URLs that might reveal development environments, cloud storage buckets, or other infrastructure.`,
                    `<strong>Potential Secrets:</strong> Strings that match common patterns for API keys, secret tokens, or other sensitive credentials.`,
                ],
                es: [
                    `<strong>Endpoints de API:</strong> Rutas relativas que indican rutas de API (p. ej., \`/api/v2/users\`, \`/internal/getData\`).`,
                    `<strong>URLs Codificadas:</strong> URLs completas que podrían revelar entornos de desarrollo, buckets de almacenamiento en la nube u otra infraestructura.`,
                    `<strong>Posibles Secretos:</strong> Cadenas de texto que coinciden con patrones comunes de claves de API, tokens secretos u otras credenciales sensibles.`,
                ],
            },
            p3: {
                en: 'The AI then formats these findings into a report, categorizing each one and assigning a severity (e.g., \'Info\' for an endpoint, \'High\' for a potential secret). This tool automates the tedious process of manually reading through large, often minified, JavaScript files to find attack surface.',
                es: 'Luego, la IA formatea estos hallazgos en un informe, categorizando cada uno y asignando una severidad (p. ej., \'Info\' para un endpoint, \'High\' para un posible secreto). Esta herramienta automatiza el tedioso proceso de leer manualmente archivos JavaScript grandes, a menudo minificados, para encontrar superficie de ataque.',
            },
        },
        domXSS: {
            title: {
                en: 'DOM XSS Pathfinder',
                es: 'Buscador de Rutas DOM XSS',
            },
            methodologyTitle: {
                en: 'Methodology',
                es: 'Metodología',
            },
            p1: {
                en: 'The DOM XSS Pathfinder is a highly specialized tool that performs AI-powered static data flow analysis on JavaScript code to find potential DOM-based Cross-Site Scripting vulnerabilities with a high degree of accuracy.',
                es: 'El Buscador de Rutas DOM XSS es una herramienta altamente especializada que realiza un análisis de flujo de datos estático sobre código JavaScript, impulsado por IA, para encontrar posibles vulnerabilidades de Cross-Site Scripting basado en DOM con un alto grado de precisión.',
            },
            p2: {
                en: 'The process is designed to reduce false positives:',
                es: 'El proceso está diseñado para reducir los falsos positivos:',
            },
            steps: {
                en: [
                    `<strong>Source & Sink Identification:</strong> The AI is prompted to first identify all user-controllable input sources (e.g., \`location.hash\`, \`location.search\`) and dangerous execution sinks (e.g., \`element.innerHTML\`, \`document.write()\`).`,
                    '<strong>Data Flow Tracing:</strong> This is the crucial step. The AI doesn\'t just list sources and sinks; it attempts to trace the flow of data from a source to a sink, following variable assignments and function calls.',
                    `<strong>Structured Reporting:</strong> The results are presented in two distinct categories:`,
                ],
                es: [
                    `<strong>Identificación de Fuentes y Sinks:</strong> Primero se le pide a la IA que identifique todas las fuentes de entrada controlables por el usuario (p. ej., \`location.hash\`, \`location.search\`) y los "sinks" de ejecución peligrosos (p. ej., \`element.innerHTML\`, \`document.write()\`).`,
                    '<strong>Rastreo del Flujo de Datos:</strong> Este es el paso crucial. La IA no solo lista las fuentes y los sinks; intenta rastrear el flujo de datos desde una fuente hasta un sink, siguiendo asignaciones de variables y llamadas a funciones.',
                    `<strong>Informe Estructurado:</strong> Los resultados se presentan en dos categorías distintas:`,
                ],
            },
            subListItems: {
                en: [
                    `<strong>Connected Paths (High Confidence):</strong> This section only shows findings where the AI was able to confirm a complete data path from a source to a sink. Each finding includes the source, the sink, the code that links them, and an exploit explanation.`,
                    `<strong>Unconnected Findings (Informational):</strong> This lists any sources or sinks that were identified but could not be traced into a complete, vulnerable path. This is useful for manual review but is clearly separated to avoid noise.`,
                ],
                es: [
                    `<strong>Rutas Conectadas (Alta Confianza):</strong> Esta sección solo muestra hallazgos donde la IA pudo confirmar una ruta de datos completa desde una fuente hasta un sink. Cada hallazgo incluye la fuente, el sink, el código que los une y una explicación del exploit.`,
                    `<strong>Hallazgos No Conectados (Informativo):</strong> Aquí se listan las fuentes o sinks que se identificaron pero para los cuales no se pudo trazar una ruta vulnerable completa. Esto es útil para la revisión manual pero se separa claramente para evitar ruido.`,
                ],
            },
        },
        jwtAnalyzer: {
            title: {
                en: 'JWT Analyzer',
                es: 'Analizador de JWT',
            },
            purposeTitle: {
                en: 'Purpose',
                es: 'Propósito',
            },
            purposeP: {
                en: 'The JWT Decompiler & Auditor is a tool for analyzing JSON Web Tokens.',
                es: 'El Decompilador y Auditor de JWT es una herramienta para analizar JSON Web Tokens.',
            },
            howToTitle: {
                en: 'How to Use',
                es: 'Cómo Usar',
            },
            steps: {
                en: [
                    `<strong>Paste Token:</strong> Paste the full JWT into the input box. The tool will automatically decode the Header and Payload sections.`,
                    `<strong>Analyze:</strong> You have two audit options:`,
                    `<strong>Review:</strong> The results will appear in tabs, allowing you to switch between the defensive and offensive perspectives.`,
                ],
                es: [
                    `<strong>Pegar Token:</strong> Pega el JWT completo en el campo de entrada. La herramienta decodificará automáticamente las secciones de Cabecera y Payload.`,
                    `<strong>Analizar:</strong> Tienes dos opciones de auditoría:`,
                    `<strong>Revisar:</strong> Los resultados aparecerán en pestañas, permitiéndote cambiar entre las perspectivas defensiva y ofensiva.`,
                ],
            },
            subListItems: {
                en: [
                    `<strong>Blue Team Audit (Defensive):</strong> This analysis looks for security best-practice violations, such as weak algorithms (\`alg: none\`), missing expiry claims, and sensitive data exposure (PII) in the payload.`,
                    `<strong>Red Team Audit (Offensive):</strong> This analysis looks for potential attack vectors, such as algorithm confusion attacks, claim manipulation for privilege escalation, and information disclosure that could aid an attacker.`,
                ],
                es: [
                    `<strong>Auditoría Blue Team (Defensiva):</strong> Este análisis busca violaciones de las mejores prácticas de seguridad, como algoritmos débiles (\`alg: none\`), falta de claims de expiración y exposición de datos sensibles (PII) en el payload.`,
                    `<strong>Auditoría Red Team (Ofensiva):</strong> Este análisis busca posibles vectores de ataque, como ataques de confusión de algoritmos, manipulación de claims para escalada de privilegios y divulgación de información que podría ayudar a un atacante.`,
                ],
            },
        },
        headerAnalysis: {
            title: {
                en: 'Header Analysis',
                es: 'Análisis de Encabezados',
            },
            methodologyTitle: {
                en: 'Methodology',
                es: 'Metodología',
            },
            p1: {
                en: 'The Security Header Analyzer provides a quick and powerful way to assess the security posture of a web application based on its HTTP response headers. This is a critical first step in many web audits.',
                es: 'El Analizador de Encabezados de Seguridad proporciona una forma rápida y potente de evaluar la postura de seguridad de una aplicación web basándose en sus encabezados de respuesta HTTP. Este es un primer paso crítico en muchas auditorías web.',
            },
            p2: {
                en: 'Like the URL Analysis, this tool is <strong>non-invasive</strong>. It uses the AI\'s Google Search capabilities to fetch the live, current headers for the target URL. The AI is then prompted to act as an expert, evaluating the presence and configuration of key security headers against modern best practices.',
                es: 'Al igual que el Análisis de URL, esta herramienta es <strong>no invasiva</strong>. Utiliza las capacidades de Búsqueda de Google de la IA para obtener los encabezados en vivo y actuales para la URL objetivo. Luego, se le pide a la IA que actúe como un experto, evaluando la presencia y configuración de encabezados de seguridad clave contra las mejores prácticas modernas.',
            },
        },
        privEsc: {
            title: {
                en: 'PrivEsc Pathfinder',
                es: 'Buscador de Rutas de PrivEsc',
            },
            methodologyTitle: {
                en: 'Methodology',
                es: 'Metodología',
            },
            p1: {
                en: 'The PrivEsc Pathfinder is an AI-powered research assistant for the post-exploitation phase. Its purpose is to find known public vulnerabilities and exploits for a specific technology and version.',
                es: 'El Buscador de Rutas de PrivEsc es un asistente de investigación impulsado por IA para la fase de post-explotación. Su propósito es encontrar vulnerabilidades y exploits públicos conocidos para una tecnología y versión específicas.',
            },
            p2: {
                en: 'The tool uses the Gemini model\'s Google Search capability to query public sources like CVE databases, Exploit-DB, and GitHub for exploits related to Privilege Escalation (PrivEsc) or Remote Code Execution (RCE).',
                es: 'La herramienta utiliza la capacidad de Búsqueda de Google del modelo Gemini para consultar fuentes públicas como bases de datos de CVE, Exploit-DB y GitHub en busca de exploits relacionados con la Escalada de Privilegios (PrivEsc) o la Ejecución Remota de Código (RCE).',
            },
        },
        fileUpload: {
            title: {
                en: 'File Upload Auditor',
                es: 'Auditor de Carga de Archivos',
            },
            methodologyTitle: {
                en: 'Methodology',
                es: 'Metodología',
            },
            p1: {
                en: 'The File Upload Auditor is a comprehensive tool designed to find and test file upload vulnerabilities. It combines AI-powered reconnaissance with client-side payload generation for a complete workflow.',
                es: 'El Auditor de Carga de Archivos es una herramienta integral diseñada para encontrar y probar vulnerabilidades de carga de archivos. Combina el reconocimiento impulsado por IA con la generación de payloads del lado del cliente para un flujo de trabajo completo.',
            },
            step1Title: {
                en: 'Step 1: AI-Powered Form Detection',
                es: 'Paso 1: Detección de Formularios con IA',
            },
            step1Steps: {
                en: [
                    'You provide a target URL.',
                    'The AI uses its search capability to analyze the page\'s HTML, looking for an HTML form that contains an `<input type="file">` element.',
                    `If a form is found, the AI returns a description of its location and provides a step-by-step guide for manual testing, often including a sample \`cURL\` command. This allows for precise, manual verification.`,
                ],
                es: [
                    'Proporcionas una URL objetivo.',
                    'La IA utiliza su capacidad de búsqueda para analizar el HTML de la página, buscando un formulario HTML que contenga un elemento `<input type="file">`.',
                    `Si se encuentra un formulario, la IA devuelve una descripción de su ubicación y proporciona una guía paso a paso para pruebas manuales, a menudo incluyendo un comando \`cURL\` de ejemplo. Esto permite una verificación manual precisa.`,
                ],
            },
            step2Title: {
                en: 'Step 2: Malicious File Forging',
                es: 'Paso 2: Falsificación de Archivos Maliciosos',
            },
            step2P: {
                en: 'After analysis, you can use the integrated file forger to create payloads. This client-side tool generates several types of files designed to bypass common server-side validation checks (e.g., SVG with script, polyglot files).',
                es: 'Después del análisis, puedes usar el falsificador de archivos integrado para crear payloads. Esta herramienta del lado del cliente genera varios tipos de archivos diseñados para eludir las comprobaciones de validación comunes del lado del servidor (p. ej., SVG con script, archivos políglotas).',
            },
        },
        discoveryTools: {
            title: {
                en: 'Discovery Tools',
                es: 'Herramientas de Descubrimiento',
            },
            purposeTitle: {
                en: 'Purpose',
                es: 'Propósito',
            },
            p1: {
                en: 'This category contains passive reconnaissance tools that gather information without sending any traffic to the target servers.',
                es: 'Esta categoría contiene herramientas de reconocimiento pasivo que recopilan información sin enviar tráfico a los servidores objetivo.',
            },
            urlFinderTitle: {
                en: 'URL List Finder',
                es: 'Buscador de Listas de URL',
            },
            urlFinderP: {
                en: 'This tool queries the <a href="https://web.archive.org/" target="_blank" rel="noopener noreferrer">Wayback Machine</a>\'s extensive index to discover all known URLs for a specific domain. It\'s a powerful way to find old or forgotten pages and endpoints.',
                es: 'Esta herramienta consulta el extenso índice de la <a href="https://web.archive.org/" target="_blank" rel="noopener noreferrer">Wayback Machine</a> para descubrir todas las URL conocidas de un dominio específico. Es una forma poderosa de encontrar páginas y endpoints antiguos u olvidados.',
            },
            subdomainFinderTitle: {
                en: 'Subdomain Finder',
                es: 'Buscador de Subdominios',
            },
            subdomainFinderP: {
                en: 'This tool uses <a href="https://crt.sh/" target="_blank" rel="noopener noreferrer">crt.sh</a>, which searches public Certificate Transparency (CT) logs. When an SSL/TLS certificate is issued for a subdomain (e.g., `dev.example.com`), it\'s recorded in these public logs, making it an extremely reliable source for discovering subdomains.',
                es: 'Esta herramienta utiliza <a href="https://crt.sh/" target="_blank" rel="noopener noreferrer">crt.sh</a>, que busca en los registros públicos de Transparencia de Certificados (CT). Cuando se emite un certificado SSL/TLS para un subdominio (p. ej., `dev.example.com`), se registra en estos registros públicos, lo que lo convierte en una fuente extremadamente fiable para descubrir subdominios.',
            },
        },
        payloadTools: {
            title: {
                en: 'Payload Tools',
                es: 'Herramientas de Payloads',
            },
            purposeTitle: {
                en: 'Purpose',
                es: 'Propósito',
            },
            p1: {
                en: 'This group of tools helps you generate and craft payloads for various types of vulnerabilities.',
                es: 'Este grupo de herramientas te ayuda a generar y crear payloads para varios tipos de vulnerabilidades.',
            },
            forgeTitle: {
                en: 'Payload Forge',
                es: 'Forja de Payloads',
            },
            forgeP: {
                en: 'Enter a base payload (e.g., an XSS script), and the AI will generate advanced variations using obfuscation and encoding techniques for WAF bypass testing.',
                es: 'Introduce un payload base (p. ej., un script XSS), y la IA generará variaciones avanzadas utilizando técnicas de ofuscación y codificación para probar el bypass de WAF.',
            },
            sstiTitle: {
                en: 'SSTI Forge',
                es: 'Forja de SSTI',
            },
            sstiP: {
                en: 'Generate Server-Side Template Injection payloads tailored for specific template engines and goals (e.g., command execution).',
                es: 'Genera payloads de Inyección de Plantillas del Lado del Servidor (SSTI) adaptados para motores de plantillas y objetivos específicos (p. ej., ejecución de comandos).',
            },
            oobTitle: {
                en: 'OOB Helper',
                es: 'Asistente OOB',
            },
            oobP: {
                en: 'A utility to generate Out-of-Band (OOB) payloads for blind vulnerabilities. Use a service like <a href="https://interact.sh" target="_blank" rel="noopener noreferrer">interact.sh</a> to get a callback domain, and this tool will craft payloads for various contexts (Blind XSS, Log4Shell, etc.).',
                es: 'Una utilidad para generar payloads Out-of-Band (OOB) para vulnerabilidades ciegas. Usa un servicio como <a href="https://interact.sh" target="_blank" rel="noopener noreferrer">interact.sh</a> para obtener un dominio de callback, y esta herramienta creará payloads para varios contextos (Blind XSS, Log4Shell, etc.).',
            },
        },
        vulnerabilityActions: {
            title: {
                en: 'Vulnerability Actions',
                es: 'Acciones de Vulnerabilidad',
            },
            p1: {
                en: 'When a vulnerability is identified, the card for that finding will show several action buttons to help you investigate further.',
                es: 'Cuando se identifica una vulnerabilidad, la tarjeta de ese hallazgo mostrará varios botones de acción para ayudarte a investigar más a fondo.',
            },
            analyzeTitle: {
                en: 'Analyze Exploit Path',
                es: 'Analizar Ruta de Explotación',
            },
            analyzeP: {
                en: 'For vulnerabilities like XSS and SQLi, this button opens an interactive chat assistant pre-loaded with the full context of a finding. You can then have a conversation with the AI to get a step-by-step reproduction guide, ask for alternative payloads, or get clarification on complex scenarios.',
                es: 'Para vulnerabilidades como XSS y SQLi, este botón abre un asistente de chat interactivo precargado con el contexto completo de un hallazgo. Luego puedes tener una conversación con la IA para obtener una guía de reproducción paso a paso, pedir payloads alternativos o aclarar escenarios complejos.',
            },
            generateTitle: {
                en: 'Generate Payloads / Commands',
                es: 'Generar Payloads / Comandos',
            },
            generateP: {
                en: `For XSS, you can click <strong>"Generate XSS Payloads"</strong> to have the AI generate a diverse set of payloads specifically tailored to the injection point. For SQLi, you can generate a sample \`sqlmap\` command to use for manual verification.`,
                es: `Para XSS, puedes hacer clic en <strong>"Generar Payloads XSS"</strong> para que la IA genere un conjunto diverso de payloads específicamente adaptados al punto de inyección. Para SQLi, puedes generar un comando \`sqlmap\` de ejemplo para usar en la verificación manual.`,
            },
        },
        apiConfig: {
            title: {
                en: 'API Configuration',
                es: 'Configuración de la API',
            },
            overviewTitle: {
                en: 'Overview',
                es: 'Resumen',
            },
            p1: {
                en: 'All AI-powered features in this application require an API key. You can configure this by clicking the <strong>Settings</strong> icon',
                es: 'Todas las funciones impulsadas por IA en esta aplicación requieren una clave de API. Puedes configurarla haciendo clic en el icono de <strong>Configuración</strong>',
            },
            p2: {
                en: 'This application uses <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer">OpenRouter</a> as its AI provider. OpenRouter gives you access to a wide variety of models from different providers (like Anthropic\'s Claude and OpenAI\'s GPT). You will need an OpenRouter API key to use this tool.',
                es: 'Esta aplicación utiliza <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer">OpenRouter</a> como su proveedor de IA. OpenRouter te da acceso a una amplia variedad de modelos de diferentes proveedores (como Claude de Anthropic y GPT de OpenAI). Necesitarás una clave de API de OpenRouter para usar esta herramienta.',
            },
            modelNote: {
                en: `<strong>Model Recommendation:</strong> For best results and reliability, it is highly recommended to use the \`google/gemini-2.5-flash\` model. The application's internal prompts have been specifically engineered and optimized for it.`,
                es: `<strong>Recomendación de Modelo:</strong> Para obtener los mejores resultados y fiabilidad, se recomienda encarecidamente utilizar el modelo \`google/gemini-2.5-flash\`. Los prompts internos de la aplicación han sido diseñados y optimizados específicamente para él.`,
            },
            savingKeyTitle: {
                en: 'Saving Your Key',
                es: 'Guardando tu Clave',
            },
            savingKeyP: {
                en: `For your convenience, you can check the <strong>"Save API key in your browser"</strong> box. This will store your key securely in your browser's \`localStorage\` so it's remembered the next time you open the app. If unchecked, the key will be forgotten when you close the tab.`,
                es: `Para tu comodidad, puedes marcar la casilla <strong>"Guardar clave de API en tu navegador"</strong>. Esto almacenará tu clave de forma segura en el \`localStorage\` de tu navegador para que se recuerde la próxima vez que abras la aplicación. Si no se marca, la clave se olvidará al cerrar la pestaña.`,
            },
        },
        disclaimer: {
            title: {
                en: 'Disclaimer',
                es: 'Aviso Legal',
            },
            noteTitle: {
                en: 'For Educational & Research Purposes Only',
                es: 'Solo para Fines Educativos y de Investigación',
            },
            noteP1: {
                en: 'This tool is an AI-powered assistant and not a substitute for professional security auditing. The output is generated by an AI and may contain inaccuracies, false positives, or false negatives.',
                es: 'Esta herramienta es un asistente impulsado por IA y no un sustituto de la auditoría de seguridad profesional. El resultado es generado por una IA y puede contener imprecisiones, falsos positivos o falsos negativos.',
            },
            noteP2: {
                en: 'Always manually verify any findings. The user assumes all responsibility for any actions taken based on this tool\'s output. Never perform testing on systems you do not have explicit, written permission to test.',
                es: 'Verifica siempre manualmente cualquier hallazgo. El usuario asume toda la responsabilidad por cualquier acción tomada en base al resultado de esta herramienta. Nunca realices pruebas en sistemas para los que no tengas permiso explícito y por escrito.',
            },
        },
    }
};

const DocSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id} className="space-y-4 pt-6 first:pt-0">
        <h3 className="text-2xl font-bold text-cyan-300 border-b border-cyan-500/30 pb-2">{title}</h3>
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary prose-headings:text-cyan-400 prose-strong:text-text-primary prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-kbd:bg-gray-700 prose-kbd:text-gray-200 prose-kbd:border-gray-600 prose-code:text-purple-300 prose-code:bg-black/30 prose-code:p-1 prose-code:rounded-md prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6">
            {children}
        </div>
    </section>
);


export const UserDocumentationModal: React.FC<UserDocumentationModalProps> = ({ isOpen, onClose }) => {
    // Estado para el idioma, por defecto en inglés
    const [language, setLanguage] = useState<'en' | 'es'>('en');

    // Función para alternar el idioma
    const toggleLanguage = () => {
        setLanguage(prevLang => prevLang === 'en' ? 'es' : 'en');
    };

    if (!isOpen) return null;

    const sections = [
        { id: 'introduction', text: TEXT.sections.introduction.title },
        { id: 'agent', text: TEXT.sections.agent.title },
        { id: 'url-analysis', text: TEXT.sections.urlAnalysis.title },
        { id: 'code-analysis', text: TEXT.sections.codeAnalysis.title },
        { id: 'reliability', text: TEXT.sections.reliability.title },
        { id: 'js-recon', text: TEXT.sections.jsRecon.title },
        { id: 'dom-xss-pathfinder', text: TEXT.sections.domXSS.title },
        { id: 'jwt-analyzer', text: TEXT.sections.jwtAnalyzer.title },
        { id: 'header-analysis', text: TEXT.sections.headerAnalysis.title },
        { id: 'privesc-pathfinder', text: TEXT.sections.privEsc.title },
        { id: 'file-upload-auditor', text: TEXT.sections.fileUpload.title },
        { id: 'discovery-tools', text: TEXT.sections.discoveryTools.title },
        { id: 'payload-tools', text: TEXT.sections.payloadTools.title },
        { id: 'vulnerability-actions', text: TEXT.sections.vulnerabilityActions.title },
        { id: 'api-config', text: TEXT.sections.apiConfig.title },
        { id: 'disclaimer', text: TEXT.sections.disclaimer.title },
    ];


    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/10 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-glass-border bg-glass-bg/80 backdrop-blur-lg">
                    <div className="flex items-center gap-3">
                        <BookOpenIcon className="h-6 w-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-text-primary">{TEXT.titles[language]}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Botón para alternar el idioma */}
                        <button onClick={toggleLanguage} className="py-1 px-3 rounded-full text-sm text-text-primary bg-black/10 hover:bg-black/20 transition-colors">
                            {TEXT.languageButton[language]}
                        </button>
                        <button onClick={onClose} className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Table of Contents */}
                    <nav className="w-1/4 flex-shrink-0 p-6 border-r border-glass-border overflow-y-auto">
                        <ul className="space-y-3">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a href={`#${section.id}`} onClick={e => {
                                        e.preventDefault();
                                        document.querySelector(`#doc-content #${section.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                      }}
                                      className="font-semibold text-text-secondary hover:text-cyan-300 transition-colors block"
                                    >
                                      {section.text[language]}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Content */}
                    <main id="doc-content" className="flex-1 p-8 overflow-y-auto scroll-smooth" style={{scrollPaddingTop: '20px'}}>
                        <div className="space-y-10">

                            <DocSection id="introduction" title={TEXT.sections.introduction.title[language]}>
                                <p>{TEXT.sections.introduction.p1[language]}</p>
                                <p>{TEXT.sections.introduction.p2[language]}</p>
                            </DocSection>

                            <DocSection id="agent" title={TEXT.sections.agent.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <ChatIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.agent.purposeTitle[language]}</h4></div>
                                <p>{TEXT.sections.agent.purposeText[language]}</p>
                                <p>{TEXT.sections.agent.listP[language]}</p>
                                <ul>
                                    {TEXT.sections.agent.listItems[language].map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </DocSection>

                            <DocSection id="url-analysis" title={TEXT.sections.urlAnalysis.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <LinkIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.urlAnalysis.methodologyTitle[language]}</h4></div>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.urlAnalysis.methodologyP1[language] }} />
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.urlAnalysis.methodologyP2[language] }} />
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.urlAnalysis.scanModesTitle[language]}</h4>
                                <ul className="list-none p-0 space-y-4">
                                    <li><span dangerouslySetInnerHTML={{ __html: TEXT.sections.urlAnalysis.scanModesRecon[language] }} /></li>
                                    <li><span dangerouslySetInnerHTML={{ __html: TEXT.sections.urlAnalysis.scanModesActive[language] }} /></li>
                                    <li><span dangerouslySetInnerHTML={{ __html: TEXT.sections.urlAnalysis.scanModesGreyBox[language] }} /></li>
                                </ul>
                                <div className="p-4 bg-purple-900/30 border border-purple-700/50 text-purple-200 rounded-lg text-sm not-prose mt-4">
                                    <span dangerouslySetInnerHTML={{ __html: TEXT.sections.urlAnalysis.importantNote[language] }} />
                                </div>
                            </DocSection>

                            <DocSection id="code-analysis" title={TEXT.sections.codeAnalysis.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <CodeBracketIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.codeAnalysis.methodologyTitle[language]}</h4></div>
                                <p>{TEXT.sections.codeAnalysis.methodologyP1[language]}</p>
                                <p>{TEXT.sections.codeAnalysis.methodologyP2[language]}</p>
                                <ul>
                                    {TEXT.sections.codeAnalysis.listItems[language].map((item, index) => <li key={index} dangerouslySetInnerHTML={{ __html: item }} />)}
                                </ul>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.codeAnalysis.howToTitle[language]}</h4>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.codeAnalysis.howToP1[language] }}/>
                                <ol>
                                    {TEXT.sections.codeAnalysis.howToSteps[language].map((step, index) => <li key={index} dangerouslySetInnerHTML={{ __html: step }} />)}
                                </ol>
                            </DocSection>
                            
                            <DocSection id="reliability" title={TEXT.sections.reliability.title[language]}>
                                <p>{TEXT.sections.reliability.p1[language]}</p>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.reliability.depthTitle[language]}</h4>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.reliability.depthP1[language] }} />
                                <ol>
                                    {TEXT.sections.reliability.depthSteps[language].map((step, index) => <li key={index} dangerouslySetInnerHTML={{ __html: step }} />)}
                                </ol>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.reliability.consolidationTitle[language]}</h4>
                                <p>{TEXT.sections.reliability.consolidationP1[language]}</p>
                                <p>{TEXT.sections.reliability.consolidationP2[language]}</p>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.reliability.deepAnalysisTitle[language]}</h4>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.reliability.deepAnalysisP1[language] }} />
                                <p>{TEXT.sections.reliability.deepAnalysisP2[language]}</p>
                                <div className="p-4 bg-purple-900/30 border border-purple-700/50 text-purple-200 rounded-lg text-sm not-prose mt-4">
                                    <span dangerouslySetInnerHTML={{ __html: TEXT.sections.reliability.tradeOffNote[language] }} />
                                </div>
                            </DocSection>

                            <DocSection id="js-recon" title={TEXT.sections.jsRecon.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <CodeSearchIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.jsRecon.methodologyTitle[language]}</h4></div>
                                <p>{TEXT.sections.jsRecon.p1[language]}</p>
                                <p>{TEXT.sections.jsRecon.p2[language]}</p>
                                <ul>
                                    {TEXT.sections.jsRecon.listItems[language].map((item, index) => <li key={index} dangerouslySetInnerHTML={{ __html: item }} />)}
                                </ul>
                                <p>{TEXT.sections.jsRecon.p3[language]}</p>
                            </DocSection>
                            
                            <DocSection id="dom-xss-pathfinder" title={TEXT.sections.domXSS.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <FlowChartIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.domXSS.methodologyTitle[language]}</h4></div>
                                <p>{TEXT.sections.domXSS.p1[language]}</p>
                                <p>{TEXT.sections.domXSS.p2[language]}</p>
                                <ol>
                                    {TEXT.sections.domXSS.steps[language].map((step, index) => <li key={index} dangerouslySetInnerHTML={{ __html: step }}/>)}
                                    <ul>
                                        {TEXT.sections.domXSS.subListItems[language].map((subItem, index) => <li key={index} dangerouslySetInnerHTML={{ __html: subItem }} />)}
                                    </ul>
                                </ol>
                            </DocSection>

                            <DocSection id="jwt-analyzer" title={TEXT.sections.jwtAnalyzer.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <JwtTokenIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.jwtAnalyzer.purposeTitle[language]}</h4></div>
                                <p>{TEXT.sections.jwtAnalyzer.purposeP[language]}</p>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.jwtAnalyzer.howToTitle[language]}</h4>
                                <ol>
                                    <li dangerouslySetInnerHTML={{ __html: TEXT.sections.jwtAnalyzer.steps[language][0] }} />
                                    <li>
                                        {TEXT.sections.jwtAnalyzer.steps[language][1]}
                                        <ul>
                                            <li dangerouslySetInnerHTML={{ __html: TEXT.sections.jwtAnalyzer.subListItems[language][0] }} />
                                            <li dangerouslySetInnerHTML={{ __html: TEXT.sections.jwtAnalyzer.subListItems[language][1] }} />
                                        </ul>
                                    </li>
                                    <li dangerouslySetInnerHTML={{ __html: TEXT.sections.jwtAnalyzer.steps[language][2] }} />
                                </ol>
                            </DocSection>
                            
                            <DocSection id="header-analysis" title={TEXT.sections.headerAnalysis.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <ShieldCheckIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.headerAnalysis.methodologyTitle[language]}</h4></div>
                                <p>{TEXT.sections.headerAnalysis.p1[language]}</p>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.headerAnalysis.p2[language] }} />
                            </DocSection>

                            <DocSection id="privesc-pathfinder" title={TEXT.sections.privEsc.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <KeyIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.privEsc.methodologyTitle[language]}</h4></div>
                                <p>{TEXT.sections.privEsc.p1[language]}</p>
                                <p>{TEXT.sections.privEsc.p2[language]}</p>
                            </DocSection>

                            <DocSection id="file-upload-auditor" title={TEXT.sections.fileUpload.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <ArrowUpTrayIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.fileUpload.methodologyTitle[language]}</h4></div>
                                <p>{TEXT.sections.fileUpload.p1[language]}</p>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.fileUpload.step1Title[language]}</h4>
                                <ol>
                                    {TEXT.sections.fileUpload.step1Steps[language].map((step, index) => <li key={index} dangerouslySetInnerHTML={{ __html: step }} />)}
                                </ol>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.fileUpload.step2Title[language]}</h4>
                                <p>{TEXT.sections.fileUpload.step2P[language]}</p>
                            </DocSection>

                            <DocSection id="discovery-tools" title={TEXT.sections.discoveryTools.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <MagnifyingGlassIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.discoveryTools.purposeTitle[language]}</h4></div>
                                <p>{TEXT.sections.discoveryTools.p1[language]}</p>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.discoveryTools.urlFinderTitle[language]}</h4>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.discoveryTools.urlFinderP[language] }} />
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.discoveryTools.subdomainFinderTitle[language]}</h4>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.discoveryTools.subdomainFinderP[language] }} />
                            </DocSection>

                            <DocSection id="payload-tools" title={TEXT.sections.payloadTools.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <PencilDocumentIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.payloadTools.purposeTitle[language]}</h4></div>
                                <p>{TEXT.sections.payloadTools.p1[language]}</p>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.payloadTools.forgeTitle[language]}</h4>
                                <p>{TEXT.sections.payloadTools.forgeP[language]}</p>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.payloadTools.sstiTitle[language]}</h4>
                                <p>{TEXT.sections.payloadTools.sstiP[language]}</p>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.payloadTools.oobTitle[language]}</h4>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.payloadTools.oobP[language] }} />
                            </DocSection>

                            <DocSection id="vulnerability-actions" title={TEXT.sections.vulnerabilityActions.title[language]}>
                                <p>{TEXT.sections.vulnerabilityActions.p1[language]}</p>
                                <div className="flex items-center gap-2 not-prose mt-4 mb-2"> <BeakerIcon className="w-5 h-5 text-purple-300"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.vulnerabilityActions.analyzeTitle[language]}</h4></div>
                                <p>{TEXT.sections.vulnerabilityActions.analyzeP[language]}</p>
                                <div className="flex items-center gap-2 not-prose mt-4 mb-2"> <ShieldExclamationIcon className="w-5 h-5 text-yellow-300"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.vulnerabilityActions.generateTitle[language]}</h4></div>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.vulnerabilityActions.generateP[language] }} />
                            </DocSection>

                            <DocSection id="api-config" title={TEXT.sections.apiConfig.title[language]}>
                                <div className="flex items-center gap-2 not-prose mb-2"> <CogIcon className="w-5 h-5"/> <h4 className="text-lg font-semibold text-cyan-400">{TEXT.sections.apiConfig.overviewTitle[language]}</h4></div>
                                <p>{TEXT.sections.apiConfig.p1[language]} <CogIcon className="inline h-4 w-4"/> {language === 'en' ? 'in the header.' : 'en el encabezado.'}</p>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.apiConfig.p2[language] }} />
                                <div className="p-4 bg-purple-900/30 border border-purple-700/50 text-purple-200 rounded-lg text-sm not-prose mt-4">
                                    <span dangerouslySetInnerHTML={{ __html: TEXT.sections.apiConfig.modelNote[language] }} />
                                </div>
                                <h4 className="text-lg font-semibold text-cyan-400 pt-4">{TEXT.sections.apiConfig.savingKeyTitle[language]}</h4>
                                <p dangerouslySetInnerHTML={{ __html: TEXT.sections.apiConfig.savingKeyP[language] }} />
                            </DocSection>
                            
                            <DocSection id="disclaimer" title={TEXT.sections.disclaimer.title[language]}>
                                <div className="p-4 bg-red-900/40 border border-red-700/50 text-red-200 rounded-lg text-sm not-prose">
                                    <p className="font-bold mb-2">{TEXT.sections.disclaimer.noteTitle[language]}</p>
                                    <p>{TEXT.sections.disclaimer.noteP1[language]}</p>
                                    <p className="mt-2">{TEXT.sections.disclaimer.noteP2[language]}</p>
                                </div>
                            </DocSection>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
