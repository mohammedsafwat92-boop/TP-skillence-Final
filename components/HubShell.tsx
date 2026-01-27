
import React from 'react';
import { TabType } from '../types';

interface HubShellProps {
  title: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
}

const TABS: TabType[] = ['Overview', 'Library', 'Assign', 'Progress', 'Upload', 'Export'];

export const HubShell: React.FC<HubShellProps> = ({ title, activeTab, onTabChange, children }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 w-full h-full flex flex-col">
      <div className="bg-slate-900 px-4 md:px-8 py-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-full border border-orange-500/20 uppercase tracking-widest">
             Production Live
           </div>
        </div>
      </div>
      
      <div className="border-b border-slate-100 flex overflow-x-auto no-scrollbar bg-slate-50/50 w-full shrink-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 md:px-8 py-4 text-sm font-bold transition-all border-b-2 flex-shrink-0 whitespace-nowrap ${
              activeTab === tab 
                ? 'border-orange-500 text-orange-600 bg-white' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {children}
      </div>
    </div>
  );
};
