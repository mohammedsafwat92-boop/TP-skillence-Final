
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, StopCircle, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { runSimulationTurn, analyzeSimulation } from '../../../services/geminiService';
import { SimulationResult } from '../../../types';

interface Props {
  scenario: any;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatMode: React.FC<Props> = ({ scenario, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: scenario.initialMessage }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || result) return;

    const userMsg = input;
    setInput('');
    const newHistory: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const response = await runSimulationTurn(newHistory, scenario.context, 'chat');
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFinish = async () => {
    setIsTyping(true);
    const transcript = messages.map(m => `${m.role === 'user' ? 'Agent' : 'Customer'}: ${m.text}`).join('\n');
    const analysis = await analyzeSimulation(transcript, 'Chat', scenario.title);
    setResult(analysis);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Result Overlay */}
      {result && (
        <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-xl rounded-2xl p-8 shadow-2xl text-center">
              <div className="mb-6 flex justify-center">
                 {result.status === 'PASS' ? (
                   <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                 ) : (
                   <AlertCircle className="w-16 h-16 text-rose-500" />
                 )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Simulation {result.status}</h2>
              <div className="grid grid-cols-3 gap-4 mb-6 text-left">
                 <div className="bg-slate-50 p-3 rounded-xl border">
                   <p className="text-[10px] uppercase font-bold text-slate-400">Empathy</p>
                   <p className="text-xl font-black">{result.empathy}%</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border">
                   <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                   <p className="text-xl font-black">{result.accuracy}%</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border">
                   <p className="text-[10px] uppercase font-bold text-slate-400">Compliance</p>
                   <p className="text-xl font-black">{result.compliance}%</p>
                 </div>
              </div>
              <p className="text-slate-600 text-sm mb-6 bg-indigo-50 p-4 rounded-xl text-left">
                <strong>AI Feedback:</strong> {result.feedback}
              </p>
              <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">
                Return to Hub
              </button>
           </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
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
             <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
               <Bot className="w-4 h-4 text-white" />
             </div>
             <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type chat message..."
            disabled={!!result || isTyping}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || !!result || isTyping}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
          <button 
            onClick={handleFinish}
            className="p-3 bg-slate-200 text-slate-600 rounded-xl hover:bg-rose-100 hover:text-rose-500 transition-colors"
            title="End Simulation"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
