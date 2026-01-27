
import React, { useMemo, lazy, Suspense } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Agent, AccessProfile } from '../types';
import { Target, Brain, TrendingUp, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import TeamInsights from './TeamInsights';
import { dataStore } from '../services/DataStore';
import AgentList from './AgentList';

// Lazy Load Heavy Detail View
const AgentDetail = lazy(() => import('./AgentDetail'));

interface Props {
  userProfile: AccessProfile;
}

const Dashboard: React.FC<Props> = ({ userProfile }) => {
  // Memoize View Data based on Role
  const { agents, classes, viewType } = useMemo(() => {
    if (userProfile.role === 'Admin') {
      return { 
        agents: dataStore.getAllAgents(), 
        classes: dataStore.getAllClasses(),
        viewType: 'ADMIN' as const 
      };
    } else if (userProfile.role === 'Coach') {
      return { 
        agents: dataStore.getAgentsByCoach(userProfile.email), 
        classes: [],
        viewType: 'COACH' as const 
      };
    } else {
      const me = dataStore.getAgentByEmail(userProfile.email);
      return { 
        agents: me ? [me] : [], 
        classes: [],
        viewType: 'AGENT' as const 
      };
    }
  }, [userProfile.role, userProfile.email]);

  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);

  if (selectedAgent) {
    return (
      <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>}>
        <AgentDetail agent={selectedAgent} onBack={() => setSelectedAgent(null)} />
      </Suspense>
    );
  }

  if (viewType === 'AGENT') {
    const me = agents[0];
    if (!me) return <div className="p-8">Agent profile not found in DataStore.</div>;

    return (
      <div className="space-y-6">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black mb-2">Welcome back, {me.name.split(' ')[0]}!</h2>
            <p className="text-slate-400">Your current proficiency level is <span className="text-orange-500 font-bold">{me.cefr}</span>.</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-2xl font-bold">
              {me.overallAvg}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-rose-500" />
                <h3 className="font-bold text-lg text-slate-800">Next Recommended Action</h3>
             </div>
             <p className="text-slate-600 mb-6">
               Your <b>{me.primaryOpportunity}</b> score has dipped slightly. We recommend running a targeted simulation.
             </p>
             <button className="w-full py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
               Start "Angry Customer" Sim <ChevronRight className="w-4 h-4" />
             </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                <h3 className="font-bold text-lg text-slate-800">Recent Progress</h3>
             </div>
             <div className="space-y-3">
               {(me.history || []).slice(-3).reverse().map((h, i) => (
                 <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs font-mono text-slate-400">{h.date}</span>
                    <span className="font-bold text-slate-700">{h.overallScore}% Overall</span>
                 </div>
               ))}
               {(!me.history || me.history.length === 0) && <p className="text-slate-400 italic">No simulation history yet.</p>}
             </div>
          </div>
        </div>

        <Suspense fallback={<Loader2 className="animate-spin mx-auto" />}>
          <AgentDetail agent={me} onBack={() => {}} /> 
        </Suspense>
      </div>
    );
  }

  if (viewType === 'COACH') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end mb-2">
           <h2 className="text-2xl font-bold text-slate-800">My Team Roster</h2>
           <p className="text-slate-400 font-medium">{agents.length} Agents Assigned</p>
        </div>
        
        <TeamInsights agents={agents} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard icon={<Brain className="w-6 h-6 text-indigo-600"/>} label="Team Avg" value={`${agents.length > 0 ? Math.round(agents.reduce((a,b)=>a+b.overallAvg,0)/agents.length) : 0}%`} color="bg-indigo-50" />
           <StatCard icon={<AlertCircle className="w-6 h-6 text-rose-600"/>} label="Critical Focus" value={agents.filter(a=>a.overallAvg<60).length} color="bg-rose-50" />
           <StatCard icon={<CheckCircle2 className="w-6 h-6 text-emerald-600"/>} label="Top Performers" value={agents.filter(a=>a.overallAvg>85).length} color="bg-emerald-50" />
        </div>

        <AgentList agents={agents} onSelectAgent={setSelectedAgent} />
      </div>
    );
  }

  // Memoize Class Performance Data for Admin
  const classData = useMemo(() => classes.map(c => {
    const classAgents = agents.filter(a => a.classId === c.id);
    const avg = classAgents.length ? classAgents.reduce((sum, a) => sum + a.overallAvg, 0) / classAgents.length : 0;
    return { name: c.name, score: Math.round(avg), agents: classAgents.length };
  }), [classes, agents]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Academy Organization Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="h-64">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Performance by Class</h3>
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px'}} />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
           </div>
           
           <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Coach Leaderboard</h3>
              <div className="space-y-4">
                 {[...classData].sort((a,b) => b.score - a.score).map((c, i) => (
                   <div key={c.name} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-slate-700">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.agents} Agents Assigned</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-indigo-600 text-lg">{c.score}%</p>
                        <p className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3" /> +2.4%
                        </p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mt-8">Global Agent Directory</h3>
      <AgentList agents={agents} onSelectAgent={setSelectedAgent} />
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

const CheckCircle2: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default React.memo(Dashboard);
