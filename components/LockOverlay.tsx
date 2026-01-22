
import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import { ADMIN_PASSWORD_HASH } from '../constants';

interface LockOverlayProps {
  onUnlock: (scope: string) => void;
  currentScope: string;
}

export const LockOverlay: React.FC<LockOverlayProps> = ({ onUnlock, currentScope }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleUnlock = () => {
    if (password === ADMIN_PASSWORD_HASH) {
      onUnlock(currentScope);
      setShowPrompt(false);
      setPassword('');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="relative group">
       {!showPrompt ? (
         <div 
          onClick={() => setShowPrompt(true)}
          className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] cursor-pointer flex items-center justify-center transition-opacity hover:bg-slate-900/50 rounded-xl"
         >
           <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 transform group-hover:scale-105 transition-transform">
             <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
               <Lock className="w-6 h-6" />
             </div>
             <p className="font-bold text-slate-800">Locked: {currentScope}</p>
             <p className="text-xs text-slate-400">Click to authenticate</p>
           </div>
         </div>
       ) : (
         <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 rounded-xl">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
               <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Authentication</h3>
               <p className="text-sm text-slate-500 mb-6">Enter password to unlock <b>{currentScope} Hub</b> modifications.</p>
               
               <input 
                 type="password"
                 placeholder="••••••••"
                 className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-center text-lg tracking-widest focus:outline-none focus:ring-2 transition-all ${
                   error ? 'border-rose-500 ring-rose-200 animate-shake' : 'border-slate-100 focus:ring-orange-200 focus:border-orange-500'
                 }`}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
               />
               
               <div className="flex gap-3 mt-6">
                 <button 
                  onClick={() => setShowPrompt(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                 >
                   Cancel
                 </button>
                 <button 
                  onClick={handleUnlock}
                  className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                 >
                   Unlock Scope
                 </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};
