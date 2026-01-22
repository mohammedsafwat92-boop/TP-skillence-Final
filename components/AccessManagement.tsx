
import React, { useState, useEffect } from 'react';
import { accessService } from '../services/AccessService';
import { AccessProfile, Role, AccessStatus } from '../types';
import { Users, UserPlus, ShieldCheck, Mail, Calendar, Search, Trash2, Ban } from 'lucide-react';

interface Props {
  currentUserEmail: string;
  isLocked: boolean;
  onLogEvent: (action: string, details: string) => void;
}

export const AccessManagement: React.FC<Props> = ({ currentUserEmail, isLocked, onLogEvent }) => {
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('Agent');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const p = await accessService.getAllProfiles();
    setProfiles(p);
  };

  const handleBulkAdd = async () => {
    if (isLocked) return;
    const emails = bulkInput.split(/[\n,]+/).map(e => e.trim()).filter(e => e);
    const added = await accessService.bulkAdd(emails, selectedRole, currentUserEmail);
    onLogEvent('ACCESS_CHANGE', `Bulk added ${added} users with role ${selectedRole}`);
    setBulkInput('');
    loadProfiles();
  };

  const handleUpdateStatus = async (email: string, status: AccessStatus) => {
    if (isLocked) return;
    await accessService.updateStatus(email, status, currentUserEmail);
    onLogEvent('ACCESS_CHANGE', `Updated ${email} status to ${status}`);
    loadProfiles();
  };

  const filtered = profiles.filter(p => 
    p.email.includes(searchTerm.toLowerCase()) || p.name.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bulk Add Card */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Add New Users</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Role Assignment</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
              >
                <option value="Admin">Admin</option>
                <option value="Coach">Coach</option>
                <option value="Agent">Agent</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Gmail Addresses (list/comma)</label>
              <textarea 
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-700 h-32 focus:ring-2 focus:ring-orange-200"
                placeholder="user1@gmail.com&#10;user2@gmail.com"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
              />
            </div>

            <button 
              onClick={handleBulkAdd}
              disabled={isLocked || !bulkInput.trim()}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
            >
              Add to Registry
            </button>
          </div>
        </div>

        {/* Registry Table Card */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">Access Registry ({profiles.length})</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter users..."
                className="bg-slate-50 border-none rounded-full pl-10 pr-4 py-2 text-xs font-bold w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                <tr>
                  <th className="px-4 py-3">User Profile</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => (
                  <tr key={p.email} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        p.role === 'Admin' ? 'bg-orange-100 text-orange-600' :
                        p.role === 'Coach' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`flex items-center gap-1.5 text-[10px] font-black ${
                        p.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {p.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => handleUpdateStatus(p.email, 'SUSPENDED')}
                            className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(p.email, 'ACTIVE')}
                            className="p-1.5 text-slate-300 hover:text-emerald-500 transition-colors"
                            title="Activate User"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleUpdateStatus(p.email, 'REMOVED')}
                          className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
