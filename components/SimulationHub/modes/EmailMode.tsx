
import React, { useState, useRef } from 'react';
import { Mail, Send, Reply, User, Bot, AlertCircle, CheckCircle2, Paperclip, MoreHorizontal, StopCircle } from 'lucide-react';
import { runSimulationTurn, analyzeSimulation } from '../../../services/geminiService';
import { SimulationResult } from '../../../types';

interface Props {
  scenario: any;
  onClose: () => void;
}

interface EmailMessage {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  role: 'user' | 'model';
  timestamp: string;
}

export const EmailMode: React.FC<Props> = ({ scenario, onClose }) => {
  const [emails, setEmails] = useState<EmailMessage[]>([
    {
      id: 1,
      from: "customer@example.com",
      to: "support@tp-skillence.com",
      subject: `Urgent: ${scenario.title} Issue`,
      body: scenario.initialMessage,
      role: 'model',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [replyBody, setReplyBody] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSend = async () => {
    if (!replyBody.trim() || result) return;

    const newEmail: EmailMessage = {
      id: Date.now(),
      from: "agent@tp-skillence.com",
      to: "customer@example.com",
      subject: `Re: Urgent: ${scenario.title} Issue`,
      body: replyBody,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...emails, newEmail];
    setEmails(newHistory);
    setReplyBody('');
    setIsTyping(true);

    // Convert email history to generic history format for AI
    const historyForAI = newHistory.map(e => ({
      role: e.role,
      text: `Subject: ${e.subject}\nBody: ${e.body}`
    }));

    try {
      const response = await runSimulationTurn(historyForAI, scenario.context, 'email');
      
      const aiEmail: EmailMessage = {
        id: Date.now() + 1,
        from: "customer@example.com",
        to: "support@tp-skillence.com",
        subject: `Re: Urgent: ${scenario.title} Issue`,
        body: response,
        role: 'model',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setEmails(prev => [...prev, aiEmail]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFinish = async () => {
    setIsTyping(true);
    const transcript = emails.map(e => `[${e.role === 'user' ? 'Agent' : 'Customer'}] Subject: ${e.subject} \n Body: ${e.body}`).join('\n\n');
    const analysis = await analyzeSimulation(transcript, 'Email', scenario.title);
    setResult(analysis);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
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
              <h2 className="text-2xl font-black text-slate-900 mb-2">Email Audit {result.status}</h2>
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

      {/* Email Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {emails.map((email) => (
          <div key={email.id} className={`flex gap-4 max-w-4xl mx-auto animate-in slide-in-from-bottom-2 ${email.role === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${email.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                {email.role === 'user' ? <User className="w-5 h-5" /> : <User className="w-5 h-5" />}
             </div>
             <div className={`flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${email.role === 'user' ? 'border-indigo-100 bg-indigo-50/10' : ''}`}>
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{email.from}</h4>
                    <p className="text-xs text-slate-400">to {email.to}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{email.timestamp}</span>
                </div>
                <h5 className="font-bold text-slate-700 text-sm mb-2">{email.subject}</h5>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{email.body}</p>
             </div>
          </div>
        ))}
        {isTyping && (
           <div className="max-w-4xl mx-auto flex gap-4">
             <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                <Bot className="w-5 h-5 text-slate-400" />
             </div>
             <div className="text-sm text-slate-400 italic flex items-center gap-2">
               Customer is typing <span className="animate-pulse">...</span>
             </div>
           </div>
        )}
      </div>

      {/* Compose Area */}
      <div className="bg-white border-t border-slate-200 p-6 shadow-lg z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
              <Reply className="w-4 h-4" /> Reply to Customer
            </h4>
            <button onClick={handleFinish} className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1">
              <StopCircle className="w-4 h-4" /> End Simulation
            </button>
          </div>
          <textarea 
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-medium text-slate-700"
            placeholder="Type your email response here..."
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><Paperclip className="w-4 h-4" /></button>
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!replyBody.trim() || isTyping}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" /> Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
