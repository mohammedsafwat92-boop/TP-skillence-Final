
import React, { useState, useCallback, lazy, Suspense } from 'react';
import { 
  LayoutDashboard, Target, Languages, Globe, Briefcase, Users, Settings, 
  LogOut, Bell, Search, Lock, Unlock, ChevronRight, ShieldCheck, 
  ShieldAlert, History, Key, LogIn, Menu, X, MessageSquare, Loader2
} from 'lucide-react';
import { HubType, TabType, AuditEntry, AccessProfile, Role } from './types';
import { HubShell } from './components/HubShell';
import { LockOverlay } from './components/LockOverlay';
import { accessService } from './services/AccessService';
import { RequireRole } from './components/RequireRole';
import { AccessManagement } from './components/AccessManagement';
import { COUNTRIES } from './constants';

// Lazy Load Heavy Modules
const SimulationHub = lazy(() => import('./components/SimulationHub'));
const LanguageHub = lazy(() => import('./components/LanguageHub/LanguageHub').then(m => ({ default: m.LanguageHub })));
const Dashboard = lazy(() => import('./components/Dashboard'));
const BulkUploader = lazy(() => import('./components/BulkUploader').then(m => ({ default: m.BulkUploader })));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full p-20 space-y-4 animate-in fade-in">
    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Initialising Module...</p>
  </div>
);

const App: React.FC = () => {
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeHub, setActiveHub] = useState<HubType>('SHL');
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [unlockedScope, setUnlockedScope] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  const createAuditEntry = useCallback((action: AuditEntry['action'], scope: string, details: string) => {
    const entry: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      scope,
      user: profile?.email || 'unauthenticated',
      details
    };
    setAuditLogs(prev => [entry, ...prev]);
  }, [profile]);

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginError('');
    
    const p = await accessService.getProfile(loginEmail);
    
    if (p && p.status === 'ACTIVE') {
      setProfile(p);
      createAuditEntry('LOGIN', 'Auth', `User ${p.email} authenticated as ${p.role}`);
      
      if (p.role === 'Admin') {
        setActiveHub('SHL'); 
        setActiveTab('Overview');
      } else if (p.role === 'Coach') {
        setActiveHub('Coach');
        setActiveTab('Overview');
      } else {
        setActiveHub('Agent');
        setActiveTab('Overview');
      }
    } else if (p && p.status !== 'ACTIVE') {
      setLoginError(`Access Denied: Account status is ${p.status}`);
      createAuditEntry('LOGIN_DENIED', 'Auth', `Login attempted for ${loginEmail} (Status: ${p.status})`);
    } else {
      setLoginError('Access Denied: Gmail not found in registry.');
      createAuditEntry('LOGIN_DENIED', 'Auth', `Login attempted for unknown user ${loginEmail}`);
    }
    setIsLoading(false);
  };

  const handleUnlock = (scope: string) => {
    createAuditEntry('SNAPSHOT', scope, 'Pre-unlock system state snapshot captured.');
    createAuditEntry('UNLOCK', scope, `Scope ${scope} unlocked for modifications.`);
    setUnlockedScope(scope);
  };

  const handleRelock = () => {
    if (unlockedScope) {
      createAuditEntry('RELOCK', unlockedScope, `Scope ${unlockedScope} manually relocked.`);
      setUnlockedScope(null);
    }
  };

  const isScopeLocked = (hub: HubType) => unlockedScope !== hub && unlockedScope !== 'All';

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 w-full">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
           <div className="mb-10 text-center">
             <h1 className="text-3xl font-black italic tracking-tighter mb-2">
                <span className="text-slate-900">TP</span>
                <span className="text-orange-500 ml-1">SKILLENCE</span>
             </h1>
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Enterprise Talent Optimization</p>
           </div>
           
           <div className="space-y-6">
              <div className="p-4 bg-orange-50 rounded-2xl flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-orange-500" />
                 <p className="text-[10px] font-bold text-orange-700 leading-tight">GMAIL AUTHENTICATION REQUIRED.<br/>ONLY AUTHORIZED REGISTRY EMAILS ALLOWED.</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Gmail Address</label>
                <input 
                  type="email" 
                  placeholder="name@gmail.com"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-orange-100 transition-all"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              {loginError && (
                <p className="text-rose-500 text-xs font-bold text-center px-4">{loginError}</p>
              )}

              <button 
                onClick={handleLogin}
                disabled={isLoading || !loginEmail}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                Sign In with Gmail
              </button>
              
              <p className="text-[10px] text-slate-300 font-bold text-center uppercase tracking-widest">Powered by TP Intelligence</p>
           </div>
        </div>
      </div>
    );
  }

  const NavItem = ({ id, label, icon: Icon, roles }: { id: HubType, label: string, icon: any, roles: Role[] }) => {
    if (!roles.includes(profile.role)) return null;
    return (
      <button
        onClick={() => { 
          setActiveHub(id); 
          setActiveTab('Overview'); 
          setIsMobileMenuOpen(false); 
        }}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
          activeHub === id 
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-100 translate-x-1' 
            : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        <Icon className={`w-5 h-5 ${activeHub === id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span className="font-bold text-sm tracking-tight">{label}</span>
        {isScopeLocked(id) && id !== 'Agent' && id !== 'Coach' && id !== 'AccessManagement' && id !== 'Simulation' && (
          <Lock className="w-3.5 h-3.5 ml-auto opacity-30" />
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col p-6 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="mb-10 px-2 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter">
              <span className="text-slate-900">TP</span>
              <span className="text-orange-500 ml-1">SKILLENCE</span>
            </h1>
            <div className="h-0.5 w-12 bg-orange-500 mt-1"></div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Intelligence</p>
          <NavItem id="SHL" label="SHL Engine" icon={Target} roles={['Admin', 'Coach']} />
          <NavItem id="Simulation" label="Simulation Hub" icon={MessageSquare} roles={['Admin', 'Coach', 'Agent']} />
          
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-8 mb-3">Enhancement Hubs</p>
          <NavItem id="Language" label="Language Hub" icon={Languages} roles={['Admin', 'Coach']} />
          <NavItem id="Sales" label="Sales Hub" icon={ShieldCheck} roles={['Admin', 'Coach']} />
          <NavItem id="Culture" label="Culture Hub" icon={Globe} roles={['Admin', 'Coach']} />
          <NavItem id="WorkNature" label="Work Nature Hub" icon={Briefcase} roles={['Admin', 'Coach']} />
          
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-8 mb-3">Workspace</p>
          <NavItem id="Coach" label="Coach Desk" icon={Users} roles={['Admin', 'Coach']} />
          <NavItem id="Agent" label="My Dashboard" icon={LayoutDashboard} roles={['Admin', 'Coach', 'Agent']} />

          {profile.role === 'Admin' && (
            <>
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-8 mb-3">System</p>
              <NavItem id="AccessManagement" label="Access Registry" icon={Key} roles={['Admin']} />
            </>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black uppercase shadow-lg shadow-orange-100">
                {profile.name.charAt(0)}
             </div>
             <div>
                <p className="text-xs font-black text-slate-900 truncate max-w-[120px]">{profile.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{profile.role}</p>
             </div>
          </div>
          <button 
            onClick={() => setProfile(null)}
            className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative no-scrollbar flex flex-col w-full h-full">
        <div className={`sticky top-0 z-40 px-4 md:px-10 py-2 flex items-center justify-between transition-colors duration-300 ${unlockedScope ? 'bg-orange-500 text-white' : 'bg-slate-900 text-slate-400'}`}>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
            {unlockedScope ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            <span>{unlockedScope ? `UNLOCKED (${unlockedScope})` : 'SAFE MODE'}</span>
          </div>
          {unlockedScope && (
            <button 
              onClick={handleRelock}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-[10px] font-black uppercase transition-all"
            >
              Relock
            </button>
          )}
        </div>

        <header className="bg-slate-50/80 backdrop-blur-md px-4 md:px-10 py-4 md:py-6 flex justify-between items-center z-30 border-b border-slate-100 sticky top-8 md:top-8 w-full">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="md:hidden p-2 text-slate-500 hover:bg-white rounded-xl active:scale-95 transition-all"
             >
               <Menu className="w-6 h-6" />
             </button>
             <div>
               <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                 {activeHub === 'AccessManagement' ? 'Access Registry' : activeHub.replace(/([A-Z])/g, ' $1').trim() + ' Hub'}
               </h2>
               <p className="hidden md:flex text-xs font-bold text-slate-400 items-center gap-2">
                  TP Enterprise <ChevronRight className="w-3 h-3" /> {activeTab}
               </p>
             </div>
          </div>
          <div className="flex gap-2 md:gap-4">
             <div className="relative hidden lg:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="bg-white border border-slate-200 rounded-full pl-11 pr-6 py-2.5 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all w-64"
                />
             </div>
             <button 
               className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-orange-500 transition-colors"
               onClick={() => setActiveTab('Progress')} 
             >
                <History className="w-5 h-5" />
             </button>
          </div>
        </header>

        <div className="px-4 md:px-10 py-6 md:py-10 relative flex-1 flex flex-col w-full h-full">
          <HubShell 
            title={activeHub === 'SHL' ? "SHL Intelligence Engine" : activeHub === 'AccessManagement' ? "Security & Registry" : `${activeHub} Enhancement`}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            <Suspense fallback={<LoadingSpinner />}>
              {activeHub === 'AccessManagement' ? (
                <RequireRole userRole={profile.role} allowed={['Admin']}>
                  <AccessManagement 
                    currentUserEmail={profile.email} 
                    isLocked={isScopeLocked(activeHub)} 
                    onLogEvent={(action, details) => createAuditEntry(action as AuditEntry['action'], activeHub, details)} 
                  />
                </RequireRole>
              ) : activeHub === 'Simulation' ? (
                <SimulationHub currentUser={profile} />
              ) : activeHub === 'Language' && activeTab === 'Overview' ? (
                <LanguageHub currentUser={profile} />
              ) : activeTab === 'Upload' ? (
                <RequireRole userRole={profile.role} allowed={['Admin']}>
                  <BulkUploader 
                    hubType={activeHub} 
                    user={profile} 
                    isLocked={isScopeLocked(activeHub)}
                    onLogEvent={(action, details) => createAuditEntry(action as AuditEntry['action'], activeHub, details)}
                  />
                </RequireRole>
              ) : activeTab === 'Assign' && isScopeLocked(activeHub) ? (
                <LockOverlay currentScope={activeHub} onUnlock={handleUnlock} />
              ) : (
                <HubContent hub={activeHub} tab={activeTab} logs={auditLogs} user={profile} />
              )}
            </Suspense>
          </HubShell>
        </div>
      </main>
    </div>
  );
};

const HubContent: React.FC<{ hub: HubType, tab: TabType, logs: AuditEntry[], user: AccessProfile }> = ({ hub, tab, logs, user }) => {
  if (hub === 'SHL' && tab === 'Overview') {
    return <Dashboard userProfile={user} />;
  }
  
  if (hub === 'Agent' && tab === 'Overview') {
    return <Dashboard userProfile={user} />;
  }

  if (hub === 'Coach' && tab === 'Overview') {
     return <Dashboard userProfile={user} />;
  }

  if (tab === 'Progress') {
    return (
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold text-slate-800">Security & Modification Audit Log</h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Scope</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length > 0 ? logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        log.action === 'UNLOCK' ? 'bg-orange-100 text-orange-600' : 
                        log.action === 'SNAPSHOT' ? 'bg-blue-100 text-blue-600' :
                        log.action === 'UPLOAD' ? 'bg-emerald-100 text-emerald-600' :
                        log.action === 'LOGIN' ? 'bg-indigo-100 text-indigo-600' :
                        log.action === 'ACCESS_CHANGE' ? 'bg-purple-100 text-purple-600' :
                        log.action === 'RELOCK' ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{log.scope}</td>
                    <td className="px-6 py-4 text-slate-500">{log.user}</td>
                    <td className="px-6 py-4 text-slate-400 truncate max-w-xs">{log.details}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-300 font-medium italic">No security events logged in this session.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (hub === 'Culture' && tab === 'Overview') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500 w-full">
        {COUNTRIES.map(c => (
          <div key={c.name} className="group bg-white border border-slate-200 p-4 rounded-2xl hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all cursor-pointer">
             <div className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">{c.flag}</div>
             <p className="font-black text-slate-800 text-sm">{c.name}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.region}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-10 md:py-20 text-center space-y-4 w-full">
       <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center">
          <Target className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />
       </div>
       <div>
          <h3 className="text-xl font-bold text-slate-800">{hub} Hub - {tab}</h3>
          <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm md:text-base">This module is part of the enterprise TP Skillence baseline and is currently fetching production data for your role.</p>
       </div>
       <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-slate-200">
          Initialize Data Fetch
       </button>
    </div>
  );
};

export default App;
