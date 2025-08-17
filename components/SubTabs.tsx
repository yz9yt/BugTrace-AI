// components/SubTabs.tsx
import React from 'react';
import { Tool } from '../types.ts';

interface SubTab {
    id: Tool;
    name: string;
}

interface SubTabsProps {
  activeTool: Tool;
  setTool: (tool: Tool) => void;
  tools: SubTab[];
}

export const SubTabs: React.FC<SubTabsProps> = ({ activeTool, setTool, tools }) => {
  return (
    <div className="flex items-center gap-2 border-b border-glass-border pb-4 mb-6">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setTool(tool.id)}
          className={`
            py-2 px-4 font-semibold text-sm rounded-lg transition-all duration-300 flex items-center gap-2
            ${activeTool === tool.id
              ? 'bg-cyan-500/15 text-cyan-300 shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }
          `}
          aria-current={activeTool === tool.id ? 'page' : undefined}
        >
          {tool.name}
        </button>
      ))}
    </div>
  );
};