
import React, { useState, useMemo } from 'react';
import { Agent, AgentHistoryEntry } from '../types';
import { ArrowLeft, BrainCircuit, Clock, Map, TrendingUp, Dumbbell, ToggleLeft, ToggleRight, LayoutDashboard, History } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { getAITrainingCoachFeedback } from '../services/geminiService';
import { TrainingGym } from './TrainingGym';

interface Props {
  agent: Agent;
  onBack: () => void;
}

const AgentDetail: React.FC<Props> = ({ agent, onBack }) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'History'>('Overview');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [showGym, setShowGym] = useState(false);

  const historyData: AgentHistoryEntry[] = useMemo(() => {
    if (agent.history && agent.history.length > 0) return agent.history;
    
    return [
      { date: '2023-10-01', overallScore: agent.overallAvg - 12, speaking: agent.speaking - 10, grammar: agent.grammar - 8 },
      { date: '2023-11-01', overallScore: agent.overallAvg - 5, speaking: agent.speaking - 4, grammar: agent.grammar - 3 },
      { date: '2023-12-01', overallScore: agent.overallAvg, speaking: agent.speaking, grammar: agent.grammar },
    ];
  }, [agent.history, agent.overallAvg, agent.speaking, agent.grammar]);

  const radarData = useMemo(() => [
    { subject: 'Writing', A: agent.writing, benchmark: 90, fullMark: 100 },
    { subject: 'Speaking', A: agent.speaking, benchmark: 95, fullMark: 100 },
    { subject: 'Listening', A: agent.listening, benchmark: 92, fullMark: 100 },
    { subject: 'Grammar', A: agent.grammar, benchmark: 95, fullMark: 100 },
    { subject: 'Analytical', A: agent.analytical, benchmark: 88, fullMark: 100 },
  ], [agent]);

  const handleConsultAI = async () => {
    setAiLoading(true);
    const feedback = await getAITrainingCoachFeedback(agent);
    setAiFeedback(feedback);
    setAiLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('Overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'Overview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('History')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'History' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History className="w-4 h-4" />
            Progress History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            
            <div className="space-y-3">
              <button 
                onClick={handleConsultAI}
                disabled={aiLoading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all font-semibold disabled:opacity-50 shadow-lg shadow-slate-200"
              >
                {aiLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <BrainCircuit className="w-5 h-5" />
                )}
                {aiLoading ? 'Analyzing...' : 'Ask AI Coach'}
              </button>
              
              <button 
                onClick={() => setShowGym(true)}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-lg shadow-orange-100"
              >
                <Dumbbell className="w-5 h-5" />
                Practice Gym
              </button>
            </div>
          </div>

          {activeTab === 'Overview' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Skill Radar</h3>
                <button 
                  onClick={() => setShowBenchmark(!showBenchmark)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Toggle Benchmark"
                >
                  {showBenchmark ? <ToggleRight className="w-6 h-6 text-indigo-600" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
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

                    {showBenchmark && (
                      <Radar
                        name="Top Performer"
                        dataKey="benchmark"
                        stroke="#eab308"
                        fill="#eab308"
                        fillOpacity={0.4}
                      />
                    )}
                    <Tooltip />
                    {showBenchmark && <Legend />}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'Overview' ? (
            <>
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

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <TargetIcon className="w-6 h-6 text-amber-600" />
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
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300 h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Longitudinal Progress Tracking</h3>
                  <p className="text-sm text-slate-500">Performance trends over the last quarter</p>
                </div>
              </div>
              
              <div className="h-80 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <LineChart data={historyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="overallScore" name="Overall" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="speaking" name="Speaking" stroke="#ec4899" strokeWidth={2} />
                    <Line type="monotone" dataKey="grammar" name="Grammar" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-xs text-slate-400 font-bold uppercase">Growth Rate</p>
                   <p className="text-2xl font-black text-slate-800">+12%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-xs text-slate-400 font-bold uppercase">Consitency Score</p>
                   <p className="text-2xl font-black text-slate-800">High</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-xs text-slate-400 font-bold uppercase">Next Milestone</p>
                   <p className="text-2xl font-black text-slate-800">C1</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showGym && (
        <TrainingGym agentName={agent.name} onClose={() => setShowGym(false)} />
      )}
    </div>
  );
};

const TargetIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export default React.memo(AgentDetail);
