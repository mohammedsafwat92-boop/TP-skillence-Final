
import React, { useState } from 'react';
import { Upload, X, FileCheck, ShieldAlert, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { HubType, User } from '../types';
import { bulkUploadService, UploadResult } from '../services/BulkUploadService';
import { accessService } from '../services/AccessService';

interface BulkUploaderProps {
  hubType: HubType;
  user: User;
  isLocked: boolean;
  onUploadComplete?: (results: any[]) => void;
  onLogEvent?: (action: string, details: string) => void;
}

interface FileStatus {
  file: File;
  status: 'PENDING' | 'UPLOADING' | 'SUCCESS' | 'ERROR';
  error?: string;
}

export const BulkUploader: React.FC<BulkUploaderProps> = ({ hubType, user, isLocked, onUploadComplete, onLogEvent }) => {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).map(f => ({
        file: f,
        status: 'PENDING' as const
      }));
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startUpload = async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const pendingFiles = files.filter(f => f.status !== 'SUCCESS').map(f => f.file);
    const results: UploadResult[] = [];

    // Mark pending as uploading
    setFiles(prev => prev.map(f => 
      f.status === 'SUCCESS' ? f : { ...f, status: 'UPLOADING' }
    ));

    await bulkUploadService.processBatch(
      pendingFiles,
      hubType,
      user.email,
      isLocked,
      async (result) => {
        results.push(result);
        
        // Update individual file status in UI
        setFiles(prev => prev.map(f => {
          if (f.file === result.originalFile) {
            return {
              ...f,
              status: result.success ? 'SUCCESS' : 'ERROR',
              error: result.error
            };
          }
          return f;
        }));

        if (result.success) {
          onLogEvent?.('UPLOAD', `File ${result.originalFile?.name} successfully pushed to ${hubType}`);
          
          // Auto-add SHL Agents to Registry (Simulated)
          if (hubType === 'SHL') {
            const simulatedEmail = `agent_${Math.floor(Math.random()*1000)}@gmail.com`;
            await accessService.autoAddAgent(simulatedEmail);
          }
        }
      }
    );

    setIsProcessing(false);
    onUploadComplete?.(results);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`p-10 border-2 border-dashed rounded-3xl transition-all text-center ${
        isLocked 
          ? 'bg-slate-50 border-slate-200 opacity-60' 
          : 'bg-white border-slate-200 hover:border-orange-500 hover:bg-orange-50/10'
      }`}>
        {isLocked ? (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-100 rounded-full text-slate-400">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">System Locked</h3>
            <p className="text-slate-400 text-sm max-w-xs">Uploads are disabled while in Global Safe Mode. Unlock the <b>{hubType} Hub</b> to proceed.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-orange-100 rounded-full text-orange-600">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Drag & Drop Materials</h3>
            <p className="text-slate-400 text-sm">PDF, DOCX, XLSX, CSV up to 50MB</p>
            <label className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-slate-800 transition-colors">
              Browse Files
              <input type="file" multiple className="hidden" onChange={handleFileSelection} />
            </label>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Queue: {files.length} items</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => setFiles([])}
                className="text-xs font-bold text-slate-400 hover:text-rose-500"
              >
                Clear All
              </button>
              <button 
                onClick={startUpload}
                disabled={isProcessing || isLocked}
                className="px-6 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-100 disabled:opacity-50 hover:bg-orange-600 transition-all"
              >
                {isProcessing ? 'Processing Batch...' : 'Push to Hub'}
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto no-scrollbar">
            {files.map((item, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  {item.status === 'UPLOADING' ? <Loader2 className="w-4 h-4 text-orange-500 animate-spin" /> : 
                   item.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                   item.status === 'ERROR' ? <AlertCircle className="w-4 h-4 text-rose-500" /> :
                   <FileCheck className="w-4 h-4 text-slate-400" />}
                  <div>
                    <p className="text-sm font-bold text-slate-700 truncate max-w-xs">{item.file.name}</p>
                    {item.error && <p className="text-[10px] text-rose-500 font-bold">{item.error}</p>}
                  </div>
                </div>
                {!isProcessing && item.status !== 'SUCCESS' && (
                  <button onClick={() => removeFile(idx)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
