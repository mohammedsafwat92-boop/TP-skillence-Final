
import React, { useMemo } from 'react';
import { Agent } from '../types';
import { Brain, TrendingUp, AlertCircle, Users } from 'lucide-react';

interface Props {
  agents: Agent[];
}

const TeamInsights: React.FC<Props> = ({ agents }) => {
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
      ? { skill: lowestSkill[0], score: lowestSkill[1] } 
      : { skill: 'N/A', score: 0 };

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

  if (!stats) return null;

  return (
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
        <p className="text-xs text-slate-400 mt-3 italic">Recommended: Assign "{stats.topCoachingNeed.skill} Booster" module to team.</p>
      </div>
    </div>
  );
};

export default TeamInsights;
