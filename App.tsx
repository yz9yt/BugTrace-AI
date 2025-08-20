// @author: Albert C | @yz9yt | github.com/yz9yt
// App.tsx
// version 0.1 Beta
import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { UrlAnalyzer } from './components/UrlAnalyzer.tsx';
import { CodeAnalyzer } from './components/CodeAnalyzer.tsx';
import { JsRecon } from './components/JsRecon.tsx';
import { DomXssPathfinder } from './components/DomXssPathfinder.tsx';
import { PayloadForge } from './components/PayloadForge.tsx';
import { SstiForge } from './components/SstiForge.tsx';
import { OobInteractionHelper } from './components/OobInteractionHelper.tsx';
import { JwtAnalyzer } from './components/JwtAnalyzer.tsx';
import { PrivEscPathfinder } from './components/PrivEscPathfinder.tsx';
import { FileUploadAuditor } from './components/FileUploadAuditor.tsx';
import { UrlListFinder } from './components/UrlListFinder.tsx';
import { SubdomainFinder } from './components/SubdomainFinder.tsx';
import { SubTabs } from './components/SubTabs.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { DevDocumentationModal } from './components/DevDocumentationModal.tsx';
import { UserDocumentationModal } from './components/UserDocumentationModal.tsx';
import { XssExploitationAssistant } from './components/XssExploitationAssistant.tsx';
import { SqlExploitationAssistant } from './components/SqlExploitationAssistant.tsx';
import { WebSecAgent } from './components/WebSecAgent.tsx';
import { DisclaimerModal } from './components/DisclaimerModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { ApiKeyWarningModal } from './components/ApiKeyWarningModal.tsx';
import { SecurityHeadersAnalyzer } from './components/SecurityHeadersAnalyzer.tsx';
import { NoLightModeModal } from './components/NoLightModeModal.tsx';
import { useWebSecAgent } from './hooks/useWebSecAgent.tsx';
import { View, Tool, VulnerabilityReport, Vulnerability, ExploitContext, Severity } from './types.ts';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.URL_ANALYSIS);
  const [activeSubTab, setActiveSubTab] = useState<Tool>(Tool.DAST);

  const [history, setHistory] = useState<VulnerabilityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<VulnerabilityReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDevDocModalOpen, setIsDevDocModalOpen] = useState<boolean>(false);
  const [isUserDocModalOpen, setIsUserDocModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isApiKeyWarningModalOpen, setIsApiKeyWarningModalOpen] = useState<boolean>(false);
  const [isNoLightModeModalOpen, setIsNoLightModeModalOpen] = useState<boolean>(false);
  
  const [payloadForForge, setPayloadForForge] = useState<string | null>(null);
  const [jwtForAnalyzer, setJwtForAnalyzer] = useState<string | null>(null);
  const [exploitAssistantContext, setExploitAssistantContext] = useState<ExploitContext | null>(null);
  const [sqlExploitAssistantContext, setSqlExploitAssistantContext] = useState<ExploitContext | null>(null);

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [disclaimerRejected, setDisclaimerRejected] = useState(false);
    
  useEffect(() => {
    try {
        const accepted = sessionStorage.getItem('disclaimerAccepted') === 'true';
        if (accepted) {
            setDisclaimerAccepted(true);
        }
    } catch (e) {
        console.error("Could not access sessionStorage:", e);
    }
  }, []);

  const handleShowApiKeyWarning = () => {
    setIsApiKeyWarningModalOpen(true);
  };
  
  // Use the new custom hook for all WebSec Agent logic
  const { 
    messages: agentMessages, 
    isLoading: isAgentLoading, 
    sendMessage: sendAgentMessage, 
    startAnalysisWithAgent,
    startReportAnalysisWithAgent
  } = useWebSecAgent(handleShowApiKeyWarning);

  const handleAcceptDisclaimer = () => {
    try {
        sessionStorage.setItem('disclaimerAccepted', 'true');
    } catch(e) {
         console.error("Could not write to sessionStorage:", e);
    }
    setDisclaimerAccepted(true);
    setDisclaimerRejected(false);
  };

  const handleRejectDisclaimer = () => {
    setDisclaimerRejected(true);
  };

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setSelectedReport(null);
    setAnalysisLog([]);
    setExploitAssistantContext(null);
    setSqlExploitAssistantContext(null);
  };

  const handleAnalysisComplete = (report: VulnerabilityReport) => {
    const severityOrder: Record<Severity, number> = {
      [Severity.CRITICAL]: 0,
      [Severity.HIGH]: 1,
      [Severity.MEDIUM]: 2,
      [Severity.LOW]: 3,
      [Severity.INFO]: 4,
      [Severity.UNKNOWN]: 5,
    };

    const sortedVulnerabilities = [...(report.vulnerabilities || [])].sort((a, b) => {
        const severityA = severityOrder[a.severity] ?? 99;
        const severityB = severityOrder[b.severity] ?? 99;
        return severityA - severityB;
    });
    
    const sortedReport = { ...report, vulnerabilities: sortedVulnerabilities };
    const reportWithId = { ...sortedReport, id: new Date().toISOString() };
    
    setHistory(prev => [reportWithId, ...prev]);
    setSelectedReport(reportWithId);
    setIsLoading(false);
  };
  
  const handleAnalysisError = (message: string) => {
    setIsLoading(false);
    setAnalysisLog(prev => [...prev, `Analysis failed: ${message}`]);
  }
  
  const handleShowSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleGoToSettings = () => {
    setIsApiKeyWarningModalOpen(false);
    setIsSettingsModalOpen(true);
  };

  const handleSelectReport = (report: VulnerabilityReport) => {
    setSelectedReport(report);
    setExploitAssistantContext(null);
    setSqlExploitAssistantContext(null);
    if (report.analyzedTarget.startsWith('http')) {
      setActiveView(View.URL_ANALYSIS);
      setActiveSubTab(Tool.DAST);
    } else if (report.analyzedTarget === 'JS Recon Analysis') {
      setActiveView(View.CODE_ANALYSIS);
      setActiveSubTab(Tool.JS_RECON);
    } else if (report.analyzedTarget.startsWith('JWT Analysis')) {
        setActiveView(View.JWT_ANALYZER);
    } else if (report.analyzedTarget.startsWith('PrivEsc')) {
        setActiveView(View.EXPLOIT_TOOLS);
    }
     else {
      setActiveView(View.CODE_ANALYSIS);
      setActiveSubTab(Tool.SAST);
    }
    setIsMenuOpen(false);
  }
  
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all analysis history? This action cannot be undone.')) {
        setHistory([]);
        setSelectedReport(null);
    }
  };

  const handleSendToPayloadForge = (payload: string) => {
    setPayloadForForge(payload);
    setActiveView(View.PAYLOAD_TOOLS);
    setActiveSubTab(Tool.PAYLOAD_FORGE);
  };
  
  const handleSendToJwtAnalyzer = (token: string) => {
    setJwtForAnalyzer(token);
    setActiveView(View.JWT_ANALYZER);
    setExploitAssistantContext(null);
    setSqlExploitAssistantContext(null);
  };

  const handlePayloadUsed = () => {
    setPayloadForForge(null);
  };

  const handleShowExploitAssistant = (vulnerability: Vulnerability, targetUrl?: string) => {
    setExploitAssistantContext({ vulnerability, targetUrl });
    setSqlExploitAssistantContext(null);
    setActiveView(View.XSS_EXPLOIT_ASSISTANT);
  };
  
  const handleShowSqlExploitAssistant = (vulnerability: Vulnerability, targetUrl: string) => {
    setSqlExploitAssistantContext({ vulnerability, targetUrl });
    setExploitAssistantContext(null);
    setActiveView(View.SQL_EXPLOIT_ASSISTANT);
  };

  const handleShowAgent = () => {
    setActiveView(View.WEB_SEC_AGENT);
    setExploitAssistantContext(null);
    setSqlExploitAssistantContext(null);
  };

  const handleLightModeClick = () => {
    setIsNoLightModeModalOpen(true);
  };
  
  const handleAnalyzeWithAgent = (vulnerability: Vulnerability, analyzedTarget: string) => {
    setActiveView(View.WEB_SEC_AGENT);
    setExploitAssistantContext(null);
    setSqlExploitAssistantContext(null);
    startAnalysisWithAgent(vulnerability, analyzedTarget);
  };

  const handleSendReportToAgent = (reportText: string, analysisType: string) => {
    setActiveView(View.WEB_SEC_AGENT);
    setExploitAssistantContext(null);
    setSqlExploitAssistantContext(null);
    startReportAnalysisWithAgent(reportText, analysisType);
  };

  const handleSubTabNavigation = (tool: Tool) => {
      setActiveSubTab(tool);
      setSelectedReport(null); // Clear previous report to prevent state leakage
  };
  
  const handleNavigate = (view: View) => {
    setActiveView(view);
    setSelectedReport(null); // ARCHITECTURAL FIX: Clear report when changing main view to prevent state leakage
    setIsMenuOpen(false);
    setExploitAssistantContext(null); // Clear context when navigating
    setSqlExploitAssistantContext(null);
    // Set default sub-tab for views that have them
    switch (view) {
        case View.URL_ANALYSIS:
            setActiveSubTab(Tool.DAST);
            break;
        case View.CODE_ANALYSIS:
            setActiveSubTab(Tool.SAST);
            break;
        case View.PAYLOAD_TOOLS:
            setActiveSubTab(Tool.PAYLOAD_FORGE);
            break;
        case View.DISCOVERY_TOOLS:
            setActiveSubTab(Tool.URL_LIST_FINDER);
            break;
    }
  };

  const handleGoHome = () => {
    handleNavigate(View.URL_ANALYSIS);
  };
  
  if (disclaimerRejected) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-4 text-center">
            <div>
                <h1 className="text-2xl font-bold text-red-400">Disclaimer Rejected</h1>
                <p className="mt-4">You must accept the disclaimer to use this application.</p>
                <p className="mt-2 text-sm text-gray-400">Please reload the page to review the disclaimer again.</p>
            </div>
        </div>
    );
  }
  
  if (!disclaimerAccepted) {
      return <DisclaimerModal onAccept={handleAcceptDisclaimer} onReject={handleRejectDisclaimer} />;
  }

  const renderActiveView = () => {
    const urlAnalysisTools = [
      { id: Tool.DAST, name: "DAST" },
      { id: Tool.SECURITY_HEADERS_ANALYZER, name: "Headers Analyzer" },
    ];
    const codeAnalysisTools = [
      { id: Tool.SAST, name: "SAST" },
      { id: Tool.JS_RECON, name: "JS Recon" },
      { id: Tool.DOM_XSS_PATHFINDER, name: "DOM XSS Pathfinder" },
    ];
    const payloadTools = [
      { id: Tool.PAYLOAD_FORGE, name: "Payload Forge" },
      { id: Tool.SSTI_FORGE, name: "SSTI Forge" },
      { id: Tool.OOB_INTERACTION_HELPER, name: "OOB Helper" },
    ];
     const discoveryTools = [
      { id: Tool.URL_LIST_FINDER, name: "URL Finder" },
      { id: Tool.SUBDOMAIN_FINDER, name: "Subdomain Finder" },
    ];
    
    switch (activeView) {
      case View.URL_ANALYSIS:
        return (
          <>
            <SubTabs tools={urlAnalysisTools} activeTool={activeSubTab} setTool={handleSubTabNavigation} />
            {activeSubTab === Tool.DAST && (
              <UrlAnalyzer
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisError={handleAnalysisError}
                onShowApiKeyWarning={handleShowApiKeyWarning}
                report={selectedReport}
                isLoading={isLoading}
                analysisLog={analysisLog}
                setAnalysisLog={setAnalysisLog}
                onSendToPayloadForge={handleSendToPayloadForge}
                onSendToJwtAnalyzer={handleSendToJwtAnalyzer}
                onShowExploitAssistant={handleShowExploitAssistant}
                onShowSqlExploitAssistant={handleShowSqlExploitAssistant}
                onAnalyzeWithAgent={handleAnalyzeWithAgent}
              />
            )}
            {activeSubTab === Tool.SECURITY_HEADERS_ANALYZER && (
                <SecurityHeadersAnalyzer 
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onAnalysisError={handleAnalysisError}
                    onShowApiKeyWarning={handleShowApiKeyWarning}
                    isLoading={isLoading}
                    report={selectedReport}
                />
            )}
          </>
        );
      case View.CODE_ANALYSIS:
        return (
          <>
            <SubTabs 
              tools={codeAnalysisTools} 
              activeTool={activeSubTab} 
              setTool={handleSubTabNavigation} 
            />
            {activeSubTab === Tool.SAST && (
              <CodeAnalyzer
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisError={handleAnalysisError}
                onShowApiKeyWarning={handleShowApiKeyWarning}
                report={selectedReport}
                isLoading={isLoading}
                analysisLog={analysisLog}
                setAnalysisLog={setAnalysisLog}
                onSendToPayloadForge={handleSendToPayloadForge}
                onSendToJwtAnalyzer={handleSendToJwtAnalyzer}
                onShowExploitAssistant={(vuln) => handleShowExploitAssistant(vuln, undefined)}
                onAnalyzeWithAgent={handleAnalyzeWithAgent}
              />
            )}
            {activeSubTab === Tool.JS_RECON && (
              <JsRecon
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisError={handleAnalysisError}
                onShowApiKeyWarning={handleShowApiKeyWarning}
                report={selectedReport}
                isLoading={isLoading}
                analysisLog={analysisLog}
                setAnalysisLog={setAnalysisLog}
                onAnalyzeWithAgent={handleAnalyzeWithAgent}
                onSendToJwtAnalyzer={handleSendToJwtAnalyzer}
              />
            )}
            {activeSubTab === Tool.DOM_XSS_PATHFINDER && (
                <DomXssPathfinder 
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onAnalysisError={handleAnalysisError}
                    onShowApiKeyWarning={handleShowApiKeyWarning}
                    isLoading={isLoading}
                    report={selectedReport}
                />
            )}
          </>
        );
      case View.PAYLOAD_TOOLS:
        return (
          <>
            <SubTabs tools={payloadTools} activeTool={activeSubTab} setTool={handleSubTabNavigation} />
            {activeSubTab === Tool.PAYLOAD_FORGE && <PayloadForge payloadForForge={payloadForForge} onPayloadUsed={handlePayloadUsed} onShowApiKeyWarning={handleShowApiKeyWarning} />}
            {activeSubTab === Tool.SSTI_FORGE && <SstiForge onShowApiKeyWarning={handleShowApiKeyWarning} />}
            {activeSubTab === Tool.OOB_INTERACTION_HELPER && <OobInteractionHelper />}
          </>
        );
      case View.DISCOVERY_TOOLS:
        return (
          <>
            <SubTabs tools={discoveryTools} activeTool={activeSubTab} setTool={handleSubTabNavigation} />
            {activeSubTab === Tool.URL_LIST_FINDER && <UrlListFinder />}
            {activeSubTab === Tool.SUBDOMAIN_FINDER && <SubdomainFinder />}
          </>
        );
      case View.JWT_ANALYZER:
        return <JwtAnalyzer
                    initialToken={jwtForAnalyzer}
                    report={selectedReport}
                    onTokenConsumed={() => setJwtForAnalyzer(null)}
                    onAnalysisComplete={handleAnalysisComplete}
                    onSendReportToAgent={handleSendReportToAgent}
                    onShowApiKeyWarning={handleShowApiKeyWarning}
                />;
      case View.EXPLOIT_TOOLS:
          return (
              <PrivEscPathfinder
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisComplete={handleAnalysisComplete}
                  onAnalysisError={handleAnalysisError}
                  report={selectedReport}
                  isLoading={isLoading}
                  onAnalyzeWithAgent={handleAnalyzeWithAgent}
                  onShowApiKeyWarning={handleShowApiKeyWarning}
              />
          );
      case View.FILE_UPLOAD_AUDITOR:
          return <FileUploadAuditor 
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onAnalysisError={handleAnalysisError}
                    onShowApiKeyWarning={handleShowApiKeyWarning}
                    isLoading={isLoading}
                  />;
      case View.WEB_SEC_AGENT:
          return (
              <WebSecAgent 
                messages={agentMessages} 
                onSendMessage={sendAgentMessage} 
                isLoading={isAgentLoading} 
              />
          );
       case View.XSS_EXPLOIT_ASSISTANT:
            return (
                <XssExploitationAssistant 
                    exploitContext={exploitAssistantContext} 
                    onShowApiKeyWarning={handleShowApiKeyWarning}
                />
            );
       case View.SQL_EXPLOIT_ASSISTANT:
            return (
                <SqlExploitationAssistant
                    exploitContext={sqlExploitAssistantContext}
                    onShowApiKeyWarning={handleShowApiKeyWarning}
                />
            );
      case View.HISTORY:
        return <HistoryView history={history} onSelectReport={handleSelectReport} onClearHistory={handleClearHistory} selectedReportId={selectedReport?.id} />;
      default:
        return <p>Select a tool from the menu.</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onSettingsClick={handleShowSettings}
        onUserDocsClick={() => setIsUserDocModalOpen(true)}
        onShowAgent={handleShowAgent}
        onGoHome={handleGoHome}
        onLightModeClick={handleLightModeClick}
      />
      <MainMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onNavigate={handleNavigate}
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-0">
        {renderActiveView()}
      </main>

      <Footer onDevDocsClick={() => setIsDevDocModalOpen(true)} />
      
      {/* Modals */}
      <DevDocumentationModal isOpen={isDevDocModalOpen} onClose={() => setIsDevDocModalOpen(false)} />
      <UserDocumentationModal isOpen={isUserDocModalOpen} onClose={() => setIsUserDocModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <ApiKeyWarningModal isOpen={isApiKeyWarningModalOpen} onClose={() => setIsApiKeyWarningModalOpen(false)} onGoToSettings={handleGoToSettings} />
      <NoLightModeModal isOpen={isNoLightModeModalOpen} onClose={() => setIsNoLightModeModalOpen(false)} />
    </div>
  );
};

export default App;
