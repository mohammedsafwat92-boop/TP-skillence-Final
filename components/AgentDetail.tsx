
import React, { useState } from 'react';
import { Agent } from '../types';
import { ArrowLeft, BrainCircuit, FileText, CheckCircle, Clock, Map } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Tooltip
} from 'recharts';
import { getAITrainingCoachFeedback } from '../services/geminiService';

interface Props {
  agent: Agent;
  onBack: () => void;
}

const AgentDetail: React.FC<Props> = ({ agent, onBack }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const radarData = [
    { subject: 'Writing', A: agent.writing, fullMark: 100 },
    { subject: 'Speaking', A: agent.speaking, fullMark: 100 },
    { subject: 'Listening', A: agent.listening, fullMark: 100 },
    { subject: 'Grammar', A: agent.grammar, fullMark: 100 },
    { subject: 'Analytical', A: agent.analytical, fullMark: 100 },
  ];

  const handleConsultAI = async () => {
    setAiLoading(true);
    const feedback = await getAITrainingCoachFeedback(agent);
    setAiFeedback(feedback);
    setAiLoading(false);
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
              {agent.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{agent.name}</h2>
            <p className="text-slate-400 mb-4">Test ID: {agent.testId}</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
                Level: {agent.cefr}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
                Score: {agent.overallAvg}%
              </span>
            </div>
            <button 
              onClick={handleConsultAI}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all font-semibold disabled:opacity-50"
            >
              {aiLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <BrainCircuit className="w-5 h-5" />
              )}
              {aiLoading ? 'Analyzing Performance...' : 'Ask AI Coach'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Skill Radar</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name={agent.name}
                    dataKey="A"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Training Details */}
        <div className="lg:col-span-2 space-y-6">
          {aiFeedback && (
            <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="w-6 h-6 text-indigo-300" />
                <h3 className="text-lg font-bold">AI Coach Recommendations</h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-indigo-100 whitespace-pre-line">
                {aiFeedback}
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Primary Opportunity</h3>
                <p className="text-sm text-slate-500">Identified focus area for improvement</p>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-8">
              <p className="text-amber-800 font-bold text-lg">{agent.primaryOpportunity}</p>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Map className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Recommended 20h Training Roadmap</h3>
                <p className="text-sm text-slate-500">Structured learning path based on test results</p>
              </div>
            </div>

            <div className="space-y-4">
              {agent.recommendedPlan.split(';').map((phase, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors bg-slate-50/50">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-slate-800 font-medium">{phase.trim()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">Duration verified via scorecard profile</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-slate-600 font-medium">Currently Assigned Modules: <span className="text-slate-400 italic">{agent.assignedModules}</span></p>
              </div>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold">
                Assign Path
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Target: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export default AgentDetail;
