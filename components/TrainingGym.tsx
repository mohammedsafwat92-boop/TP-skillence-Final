
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, StopCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { generateCustomerResponse, analyzeSimulation } from '../services/geminiService';
import { SimulationResult } from '../types';

interface Props {
  agentName: string;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SCENARIO = "A customer is calling because their flight was cancelled due to bad weather, but they demand a refund despite it being a non-refundable ticket.";

export const TrainingGym: React.FC<Props> = ({ agentName, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "HELLO! I am extremely upset! My flight was cancelled and I need my money back right now!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isFinished) return;

    const userMsg = input;
    setInput('');
    const newHistory: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setTurnCount(prev => prev + 1);
    setIsTyping(true);

    try {
      const response = await generateCustomerResponse(newHistory, SCENARIO);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFinish = async () => {
    setIsFinished(true);
    setIsTyping(true);
    
    // Convert chat to single string transcript
    const transcript = messages.map(m => `${m.role === 'user' ? 'Agent' : 'Customer'}: ${m.text}`).join('\n');
    const analysis = await analyzeSimulation(transcript, 'Chat', 'Customer Service');
    setResult(analysis);
    setIsTyping(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-black italic tracking-tighter flex items-center gap-2">
              TP <span className="text-orange-500">GYM</span>
            </h2>
            <p className="text-xs text-slate-400">Active Roleplay Simulation • 5 Turns Max</p>
          </div>
          <button onClick={onClose} className="hover:bg-slate-800 p-2 rounded-full transition-colors">
            <StopCircle className="w-6 h-6 text-rose-500" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                 <Bot className="w-4 h-4 text-white" />
               </div>
               <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                 <div className="flex gap-1">
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             </div>
          )}
        </div>

        {/* Results Overlay */}
        {result && (
           <div className="bg-indigo-900/95 absolute inset-0 z-10 flex items-center justify-center p-8 text-white backdrop-blur-md animate-in fade-in">
             <div className="w-full max-w-md text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-indigo-900 font-black text-3xl shadow-xl">
                  {result.empathy}
                </div>
                <h3 className="text-2xl font-bold">Session Grade: {result.status}</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-indigo-800 p-3 rounded-xl">
                    <p className="text-indigo-300 text-xs uppercase mb-1">Empathy</p>
                    <p className="font-bold text-lg">{result.empathy}/100</p>
                  </div>
                  <div className="bg-indigo-800 p-3 rounded-xl">
                    <p className="text-indigo-300 text-xs uppercase mb-1">Accuracy</p>
                    <p className="font-bold text-lg">{result.accuracy}/100</p>
                  </div>
                  <div className="bg-indigo-800 p-3 rounded-xl">
                    <p className="text-indigo-300 text-xs uppercase mb-1">Compliance</p>
                    <p className="font-bold text-lg">{result.compliance}/100</p>
                  </div>
                </div>
                <div className="bg-indigo-800 p-4 rounded-xl text-left">
                  <p className="text-indigo-300 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    AI Feedback
                  </p>
                  <p className="text-sm leading-relaxed opacity-90">{result.feedback}</p>
                </div>
                <button onClick={onClose} className="px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                  Close Session
                </button>
             </div>
           </div>
        )}

        {/* Controls */}
        {!result && (
          <div className="p-4 bg-white border-t border-slate-100">
            {turnCount >= 5 && !isFinished ? (
              <button 
                onClick={handleFinish}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-100"
              >
                <CheckCircle className="w-5 h-5" />
                Finish & Analyze Session
              </button>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your response..."
                  disabled={isFinished || isTyping}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isFinished || isTyping}
                  className="p-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="mt-2 text-center">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Turns: {turnCount} / 5
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
