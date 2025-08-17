// @author: Albert C | @yz9yt | github.com/yz9yt
// components/MainMenu.tsx
// version 0.1 Beta
import React from 'react';
import { View } from '../types.ts';
import { AiBrainIcon, HistoryIcon, XMarkIcon, LinkIcon, CodeBracketIcon, ChatIcon, ArrowUpTrayIcon, KeyIcon, PencilDocumentIcon, JwtTokenIcon, MagnifyingGlassIcon } from './Icons.tsx';

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  activeView: View;
}

const mainViews = [
  { id: View.WEB_SEC_AGENT, name: 'WebSec Agent', icon: <ChatIcon className="h-5 w-5" /> },
  { id: View.URL_ANALYSIS, name: 'URL Analysis', icon: <LinkIcon className="h-5 w-5" /> },
  { id: View.CODE_ANALYSIS, name: 'Code Analysis', icon: <CodeBracketIcon className="h-5 w-5" /> },
  { id: View.PAYLOAD_TOOLS, name: 'Payload Tools', icon: <PencilDocumentIcon className="h-5 w-5" /> },
  { id: View.JWT_ANALYZER, name: 'JWT Analyzer', icon: <JwtTokenIcon className="h-5 w-5" /> },
  { id: View.EXPLOIT_TOOLS, name: 'PrivEsc Pathfinder', icon: <KeyIcon className="h-5 w-5" /> },
  { id: View.FILE_UPLOAD_AUDITOR, name: 'File Upload Auditor', icon: <ArrowUpTrayIcon className="h-5 w-5" /> },
  { id: View.DISCOVERY_TOOLS, name: 'Discovery', icon: <MagnifyingGlassIcon className="h-5 w-5" /> },
];

const appViews = [
    { id: View.HISTORY, name: 'History', icon: <HistoryIcon className="h-5 w-5" /> },
];

export const MainMenu: React.FC<MainMenuProps> = ({ isOpen, onClose, onNavigate, activeView }) => {

  const NavLink: React.FC<{view: View, name: string, icon: React.ReactNode}> = ({ view, name, icon }) => (
    <button
      onClick={() => onNavigate(view)}
      title={`Navigate to ${name}`}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
        activeView === view ? 'bg-cyan-500/20 text-cyan-200' : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-semibold flex-grow">{name}</span>
    </button>
  );

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Main Menu */}
      <aside 
        className={`fixed top-0 left-0 w-72 h-full bg-glass-bg backdrop-blur-2xl border-r border-glass-border p-6 flex flex-col gap-8 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AiBrainIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl font-bold text-text-primary">BugTrace-AI</h1>
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors" title="Close menu">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex flex-col flex-grow overflow-hidden">
            {/* Tools Section */}
            <div className="mb-6">
                <h2 className="px-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Tools</h2>
                <div className="space-y-1">
                    {mainViews.map(item => <NavLink key={item.id} view={item.id} name={item.name} icon={item.icon} />)}
                </div>
            </div>
            
            {/* Divider */}
            <hr className="border-t border-glass-border my-2"/>

            {/* Application Section */}
             <div className="mt-4">
                <h2 className="px-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Application</h2>
                <div className="space-y-1">
                    {appViews.map(item => <NavLink key={item.id} view={item.id} name={item.name} icon={item.icon} />)}
                </div>
            </div>

        </nav>
      </aside>
    </>
  );
};