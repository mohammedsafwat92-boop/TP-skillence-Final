
import React, { useState } from 'react';
import { MessageSquare, Mail, Mic, ChevronRight, Play, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { ChatMode } from './SimulationHub/modes/ChatMode';
import { EmailMode } from './SimulationHub/modes/EmailMode';
import { VoiceMode } from './SimulationHub/modes/VoiceMode';

type Mode = 'chat' | 'email' | 'voice' | null;

interface Scenario {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  initialMessage: string;
  context: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'refund-dispute',
    title: 'Refund Dispute',
    difficulty: 'Intermediate',
    description: 'Customer is demanding a refund for a non-refundable flight due to weather.',
    initialMessage: "I don't care about your policy! It was a hurricane! I want my money back now!",
    context: "You are a customer service agent for an airline. The customer is angry about a weather cancellation on a non-refundable ticket. Goal: Empathize, explain policy, offer voucher.",
  },
  {
    id: 'tech-support',
    title: 'Technical Support',
    difficulty: 'Beginner',
    description: 'Elderly customer struggling to reset their email password.',
    initialMessage: "Hello? I can't get into my mail. It keeps saying wrong words. I didn't change anything!",
    context: "You are tech support. An elderly customer is confused about a password error. Be patient, avoid jargon, and guide them step-by-step.",
  },
  {
    id: 'upsell-premium',
    title: 'Premium Upsell',
    difficulty: 'Advanced',
    description: 'Convert a satisfied customer to the Premium tier plan.',
    initialMessage: "Yeah, the basic service has been great so far. Just calling to update my billing address.",
    context: "You are a sales agent. The customer is happy. Pivot to offering the Premium plan which includes 24/7 support and higher speeds.",
  }
];

export const SimulationHub: React.FC = () => {
  const [activeMode, setActiveMode] = useState<Mode>(null);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  const reset = () => {
    setActiveMode(null);
    setActiveScenario(null);
  };

  const handleModeSelect = (mode: Mode) => {
    setActiveMode(mode);
  };

  const handleScenarioSelect = (scenario: Scenario) => {
    setActiveScenario(scenario);
  };

  // 1. Mode Selection View
  if (!activeMode) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 w-full h-full flex flex-col items-center justify-center">
         <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl font-black italic tracking-tighter mb-4 text-slate-900">
              SIMULATION <span className="text-orange-500">HUB</span>
            </h2>
            <p className="text-slate-500 text-lg">
              Select a communication channel to begin your AI-powered training session.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
            <ModeCard 
              title="Live Chat" 
              icon={<MessageSquare className="w-12 h-12 text-white" />} 
              description="Practice rapid text responses and multitasking handling."
              color="bg-indigo-500"
              onClick={() => handleModeSelect('chat')}
            />
            <ModeCard 
              title="Email Support" 
              icon={<Mail className="w-12 h-12 text-white" />} 
              description="Master formal writing, ticket resolution, and structure."
              color="bg-emerald-500"
              onClick={() => handleModeSelect('email')}
            />
            <ModeCard 
              title="Voice Call" 
              icon={<Mic className="w-12 h-12 text-white" />} 
              description="Train verbal de-escalation and active listening skills."
              color="bg-rose-500"
              onClick={() => handleModeSelect('voice')}
            />
         </div>
      </div>
    );
  }

  // 2. Scenario Selection View
  if (activeMode && !activeScenario) {
    return (
      <div className="w-full h-full animate-in slide-in-from-right-4">
        <button onClick={reset} className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Modes
        </button>
        
        <h2 className="text-3xl font-black text-slate-900 mb-8 capitalize flex items-center gap-3">
          {activeMode === 'chat' && <MessageSquare className="w-8 h-8 text-indigo-500" />}
          {activeMode === 'email' && <Mail className="w-8 h-8 text-emerald-500" />}
          {activeMode === 'voice' && <Mic className="w-8 h-8 text-rose-500" />}
          Select {activeMode} Scenario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {SCENARIOS.map((scenario) => (
            <div 
              key={scenario.id}
              className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-orange-500 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => handleScenarioSelect(scenario)}
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-10 h-10 text-orange-500 fill-orange-500" />
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  scenario.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-600' :
                  scenario.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {scenario.difficulty}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 5m
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-3">{scenario.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{scenario.description}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center text-orange-600 font-bold text-sm group-hover:gap-2 transition-all">
                Start Simulation <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Active Simulation Wrapper
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      {/* Universal Header */}
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl ${
            activeMode === 'chat' ? 'bg-indigo-500' : 
            activeMode === 'email' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}>
             {activeMode === 'chat' && <MessageSquare className="w-5 h-5" />}
             {activeMode === 'email' && <Mail className="w-5 h-5" />}
             {activeMode === 'voice' && <Mic className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-lg">{activeScenario?.title}</h3>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Live {activeMode} Simulation</p>
          </div>
        </div>
        <button 
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white text-sm font-bold"
        >
          <XCircle className="w-5 h-5" /> Quit
        </button>
      </div>

      {/* Render Mode Component */}
      <div className="flex-1 overflow-hidden relative">
        {activeMode === 'chat' && <ChatMode scenario={activeScenario} onClose={reset} />}
        {activeMode === 'email' && <EmailMode scenario={activeScenario} onClose={reset} />}
        {activeMode === 'voice' && <VoiceMode scenario={activeScenario} onClose={reset} />}
      </div>
    </div>
  );
};

// Helper Component for Mode Selection
const ModeCard: React.FC<{title: string, icon: React.ReactNode, description: string, color: string, onClick: () => void}> = ({ title, icon, description, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`relative overflow-hidden rounded-3xl p-8 h-80 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl group flex flex-col justify-between ${color}`}
  >
    <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
    
    <div className="bg-white/20 w-fit p-4 rounded-2xl backdrop-blur-sm">
      {icon}
    </div>

    <div>
      <h3 className="text-3xl font-black text-white mb-2">{title}</h3>
      <p className="text-white/80 font-medium leading-relaxed">{description}</p>
    </div>

    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
      <div className="bg-white text-slate-900 p-3 rounded-full shadow-lg">
        <ChevronRight className="w-6 h-6" />
      </div>
    </div>
  </button>
);

export default SimulationHub;
