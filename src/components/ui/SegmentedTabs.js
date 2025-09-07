import React from 'react';
import { Shield, BrainCircuit } from 'lucide-react';

const SegmentedTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'insurance', label: 'Insurance Assistant', icon: Shield },
    { id: 'xmind', label: 'XMind Converter', icon: BrainCircuit }
  ];

  return (
    <div className="flex gap-1 p-1 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
              ${isActive 
                ? 'bg-white/10 backdrop-blur shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] text-white' 
                : 'text-text-muted hover:text-white hover:bg-white/5'
              }
            `}
            aria-pressed={isActive}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedTabs;
