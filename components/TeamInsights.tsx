
import React, { useMemo, useState } from 'react';
import { Agent } from '../types';
import { Brain, TrendingUp, AlertCircle, Users, CheckSquare, X } from 'lucide-react';

interface Props {
  agents: Agent[];
}

const TeamInsights: React.FC<Props> = ({ agents }) => {
  const [showCohortModal, setShowCohortModal] = useState(false);

  const stats = useMemo(() => {
    if (agents.length === 0) return null;

    const total = agents.length;
    const skills = ['writing', 'speaking', 'listening', 'grammar', 'analytical'] as const;
    
    // Calculate Averages
    const avgScores: Record<string, number> = {};
    skills.forEach(skill => {
      avgScores[skill] = agents.reduce((sum, a) => sum + (a[skill] as number), 0) / total;
    });

    const overallAvg = agents.reduce((sum, a) => sum + a.overallAvg, 0) / total;

    // Determine Top Coaching Need (Lowest Scoring Skill)
    const sortedSkills = Object.entries(avgScores).sort(([, a], [, b]) => a - b);
    const lowestSkill = sortedSkills[0];
    const topCoachingNeed = lowestSkill 
      ? { skill: lowestSkill[0] as keyof Agent, score: lowestSkill[1] } 
      : { skill: 'writing' as keyof Agent, score: 0 };

    // Estimated Avg CEFR (Simple mode mapping)
    const cefrMap: Record<string, number> = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
    const revCefrMap: Record<number, string> = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
    
    const totalCefrWeight = agents.reduce((sum, a) => sum + (cefrMap[a.cefr] || 0), 0);
    const avgCefrWeight = Math.round(totalCefrWeight / total);
    const avgCefr = revCefrMap[avgCefrWeight] || 'B1';

    return {
      avgCefr,
      overallAvg,
      topCoachingNeed
    };
  }, [agents]);

  // Task 3: Filter agents for cohort
  const cohortAgents = useMemo(() => {
    if (!stats) return [];
    return agents.filter(a => (a[stats.topCoachingNeed.skill] as number) < 65);
  }, [agents, stats]);

  if (!stats) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in slide-in-from-top-4 duration-500">
        {/* Team Average CEFR */}
        <div className="bg-indigo-600 rounded-xl p-6 shadow-lg shadow-indigo-200 text-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Brain className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Team Baseline</span>
            </div>
            <h3 className="text-4xl font-black mb-1">{stats.avgCefr}</h3>
            <p className="text-sm font-medium opacity-90">Average CEFR Level</p>
          </div>
        </div>

        {/* Overall Performance */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Performance</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800">{stats.overallAvg.toFixed(1)}%</h3>
            <p className="text-sm text-slate-400 font-medium">Average Simulation Score</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.overallAvg}%` }}></div>
          </div>
        </div>

        {/* Coaching Need */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Priority Focus</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 capitalize">{stats.topCoachingNeed.skill}</h3>
            <p className="text-sm text-slate-400 font-medium">
              Lowest Avg Score: <span className="text-amber-600 font-bold">{stats.topCoachingNeed.score.toFixed(1)}%</span>
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
             <p className="text-xs text-slate-400 italic">Recommended Action:</p>
             <button 
               onClick={() => setShowCohortModal(true)}
               className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
             >
               Create Cohort ({cohortAgents.length})
             </button>
          </div>
        </div>
      </div>

      {/* Cohort Modal */}
      {showCohortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Training Cohort</h3>
                    <p className="text-xs text-slate-400 font-medium">Focus: {stats.topCoachingNeed.skill.toUpperCase()} Improvement</p>
                  </div>
                </div>
                <button onClick={() => setShowCohortModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto mb-6 border rounded-xl border-slate-100 bg-slate-50">
                {cohortAgents.length > 0 ? (
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-100 text-slate-500 font-semibold border-b">
                       <tr>
                         <th className="px-4 py-3">Agent</th>
                         <th className="px-4 py-3">{stats.topCoachingNeed.skill} Score</th>
                       </tr>
                     </thead>
                     <tbody>
                       {cohortAgents.map(a => (
                         <tr key={a.testId} className="border-b border-slate-100 last:border-0">
                           <td className="px-4 py-3 font-medium text-slate-700">{a.name}</td>
                           <td className="px-4 py-3 text-rose-500 font-bold">{a[stats.topCoachingNeed.skill]}%</td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-400">No agents require critical intervention for this skill.</div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCohortModal(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert(`Training assigned to ${cohortAgents.length} agents!`);
                    setShowCohortModal(false);
                  }}
                  disabled={cohortAgents.length === 0}
                  className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50"
                >
                  Assign Module
                </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default TeamInsights;
