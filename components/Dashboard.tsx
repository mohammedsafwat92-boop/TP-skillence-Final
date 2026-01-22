
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Agent, DashboardMetrics } from '../types';
import { Users, Target, Award, Brain } from 'lucide-react';

interface Props {
  agents: Agent[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const Dashboard: React.FC<Props> = ({ agents }) => {
  const metrics = useMemo<DashboardMetrics>(() => {
    const total = agents.length;
    return {
      totalAgents: total,
      avgWriting: agents.reduce((acc, a) => acc + a.writing, 0) / total,
      avgSpeaking: agents.reduce((acc, a) => acc + a.speaking, 0) / total,
      avgListening: agents.reduce((acc, a) => acc + a.listening, 0) / total,
      avgGrammar: agents.reduce((acc, a) => acc + a.grammar, 0) / total,
      avgAnalytical: agents.reduce((acc, a) => acc + a.analytical, 0) / total,
      avgOverall: agents.reduce((acc, a) => acc + a.overallAvg, 0) / total,
    };
  }, [agents]);

  const radarData = [
    { subject: 'Writing', A: metrics.avgWriting, fullMark: 100 },
    { subject: 'Speaking', A: metrics.avgSpeaking, fullMark: 100 },
    { subject: 'Listening', A: metrics.avgListening, fullMark: 100 },
    { subject: 'Grammar', A: metrics.avgGrammar, fullMark: 100 },
    { subject: 'Analytical', A: metrics.avgAnalytical, fullMark: 100 },
  ];

  const cefrDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    agents.forEach(a => counts[a.cefr] = (counts[a.cefr] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [agents]);

  const topPerformers = useMemo(() => {
    return [...agents].sort((a, b) => b.overallAvg - a.overallAvg).slice(0, 5);
  }, [agents]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          label="Total Agents"
          value={metrics.totalAgents}
          color="bg-indigo-50"
        />
        <StatCard 
          icon={<Target className="w-6 h-6 text-emerald-600" />}
          label="Avg Performance"
          value={`${metrics.avgOverall.toFixed(1)}%`}
          color="bg-emerald-50"
        />
        <StatCard 
          icon={<Award className="w-6 h-6 text-amber-600" />}
          label="Highest Score"
          value={`${Math.max(...agents.map(a => a.overallAvg))}%`}
          color="bg-amber-50"
        />
        <StatCard 
          icon={<Brain className="w-6 h-6 text-purple-600" />}
          label="Avg Grammar"
          value={`${metrics.avgGrammar.toFixed(1)}%`}
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proficiency Radar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Skill Proficiency Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Group Avg"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CEFR Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">CEFR Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cefrDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {cefrDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 5 Performers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm font-medium text-slate-500 border-b">
              <tr>
                <th className="pb-3 pl-2">Name</th>
                <th className="pb-3">CEFR</th>
                <th className="pb-3">Overall Avg</th>
                <th className="pb-3">Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topPerformers.map((agent, i) => (
                <tr key={agent.testId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-2 font-medium text-slate-800">{agent.name}</td>
                  <td className="py-3 text-slate-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
                      {agent.cefr}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{agent.overallAvg}%</td>
                  <td className="py-3 text-slate-600 text-sm truncate max-w-[200px]">{agent.primaryOpportunity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => (
  <div className={`p-5 rounded-xl flex items-center gap-4 ${color} border border-transparent hover:border-slate-200 transition-all cursor-default`}>
    <div className="p-3 bg-white rounded-lg shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;
