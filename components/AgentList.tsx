
import React, { useState, useMemo } from 'react';
import { Agent } from '../types';
import { Search, Filter, ChevronRight, Eye } from 'lucide-react';

interface Props {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
}

const AgentList: React.FC<Props> = ({ agents, onSelectAgent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cefrFilter, setCefrFilter] = useState('All');

  const filteredAgents = useMemo(() => {
    return agents.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            a.testId.includes(searchTerm);
      const matchesCefr = cefrFilter === 'All' || a.cefr === cefrFilter;
      return matchesSearch && matchesCefr;
    });
  }, [agents, searchTerm, cefrFilter]);

  const cefrLevels = ['All', ...Array.from(new Set(agents.map(a => a.cefr)))];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800">Agent Performance Directory</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={cefrFilter}
              onChange={(e) => setCefrFilter(e.target.value)}
            >
              {cefrLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Agent Details</th>
              <th className="px-6 py-4">CEFR</th>
              <th className="px-6 py-4">Skills (Avg)</th>
              <th className="px-6 py-4">Primary Opportunity</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAgents.map((agent) => (
              <tr key={agent.testId} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{agent.name}</p>
                      <p className="text-xs text-slate-400">ID: {agent.testId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    agent.cefr === 'C1' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {agent.cefr}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          agent.overallAvg > 75 ? 'bg-emerald-500' : agent.overallAvg > 60 ? 'bg-indigo-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${agent.overallAvg}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-600">{agent.overallAvg}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 truncate max-w-[200px] block">
                    {agent.primaryOpportunity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onSelectAgent(agent)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAgents.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-400 font-medium">No agents found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentList;
