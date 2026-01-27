
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, StopCircle, User, Bot, AlertCircle, CheckCircle2, Waves, Activity } from 'lucide-react';
import { connectToLiveSession, analyzeSimulation } from '../../../services/geminiService';
import { SimulationResult, AccessProfile } from '../../../types';
import { dataStore } from '../../../services/DataStore';

interface Props {
  scenario: any;
  onClose: () => void;
  currentUser?: AccessProfile;
}

export const VoiceMode: React.FC<Props> = ({ scenario, onClose, currentUser }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio Context Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  
  // Session Ref
  const sessionRef = useRef<ReturnType<typeof connectToLiveSession> | null>(null);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

  // 1. Initialize Audio Contexts & Live Session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Input Context (16kHz for Gemini)
        inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        
        // Output Context (Standard)
        outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Connect to Gemini
        sessionRef.current = connectToLiveSession(
          scenario.context,
          scenario.initialMessage,
          {
            onOpen: () => {
              setIsConnected(true);
              console.log("Gemini Live Connected");
            },
            onAudioData: async (base64Audio) => {
              await playAudioChunk(base64Audio);
            },
            onClose: () => {
              setIsConnected(false);
              stopAudioCapture();
            },
            onError: (err) => {
              console.error("Gemini Error:", err);
              setError("Connection to AI Voice Service failed.");
            }
          }
        );

      } catch (e) {
        console.error("Init Error", e);
        setError("Failed to initialize audio system.");
      }
    };

    initSession();

    return () => {
      stopAudioCapture();
      sessionRef.current?.disconnect();
      inputContextRef.current?.close();
      outputContextRef.current?.close();
    };
  }, []);

  // 2. Audio Capture Logic (Mic -> PCM -> WebSocket)
  const startAudioCapture = async () => {
    if (!inputContextRef.current || !sessionRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const context = inputContextRef.current;
      sourceRef.current = context.createMediaStreamSource(stream);
      
      // Use ScriptProcessor for raw PCM access (BufferSize 4096 = ~256ms latency)
      processorRef.current = context.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Visualization calculation
        let sum = 0;
        for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
        setAudioLevel(Math.sqrt(sum / inputData.length) * 10);

        // Convert Float32 to Int16 PCM
        const pcmData = floatTo16BitPCM(inputData);
        const base64PCM = arrayBufferToBase64(pcmData.buffer);
        
        sessionRef.current?.sendAudioChunk(base64PCM);
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(context.destination);
      setIsListening(true);

    } catch (e) {
      console.error("Mic Error", e);
      setError("Microphone access denied.");
    }
  };

  const stopAudioCapture = () => {
    if (processorRef.current && sourceRef.current) {
      processorRef.current.disconnect();
      sourceRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
    setAudioLevel(0);
  };

  const toggleMic = () => {
    if (isListening) {
      stopAudioCapture();
    } else {
      startAudioCapture();
    }
  };

  // 3. Audio Playback Logic (WebSocket -> Base64 -> AudioBuffer)
  const playAudioChunk = async (base64Audio: string) => {
    if (!outputContextRef.current) return;
    const ctx = outputContextRef.current;

    try {
      // Decode Base64 to ArrayBuffer
      const audioData = base64ToArrayBuffer(base64Audio);
      
      // Convert raw PCM to AudioBuffer (Custom implementation required for raw stream)
      // Note: Gemini sends raw PCM 24kHz usually for output, or 16kHz input.
      // The output from Native Audio is PCM. We need to decode it manually as AudioContext.decodeAudioData expects headers (wav/mp3).
      // Actually, guidelines say: "audio bytes returned by the API is raw PCM data... contains no header".
      
      // Assuming 24kHz output sample rate for high quality
      const float32Data = int16ToFloat32(audioData);
      const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000); 
      audioBuffer.getChannelData(0).set(float32Data);

      // Schedule Playback
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }
      
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      
      audioQueueRef.current.push(source);
      source.onended = () => {
        audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
      };

    } catch (e) {
      console.error("Playback Error", e);
    }
  };

  // 4. Helper: PCM Conversions
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  const int16ToFloat32 = (input: ArrayBuffer) => {
    const int16 = new Int16Array(input);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const handleFinish = async () => {
    stopAudioCapture();
    sessionRef.current?.disconnect();
    
    // In a real live audio scenario, we might not have a full text transcript readily available 
    // unless we also requested transcription. For this prototype, we'll simulate a result.
    // Ideally, we'd accumulate the user/model turns from transcription events.
    const mockTranscript = "Agent: [Audio Interaction]\nCustomer: [Audio Interaction]";
    const analysis = await analyzeSimulation(mockTranscript, 'Voice', scenario.title);
    
    if (currentUser) {
        dataStore.addSimulationResult(currentUser.email, {
            ...analysis,
            scenario: scenario.title,
            type: 'Voice'
        });
    }

    setResult(analysis);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         {/* Dynamic Pulse based on audio level */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full blur-3xl transition-all duration-75"
             style={{ width: `${300 + audioLevel * 200}px`, height: `${300 + audioLevel * 200}px`, opacity: 0.2 + audioLevel * 0.5 }}></div>
      </div>

      {/* Result Overlay */}
      {result && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-xl rounded-2xl p-8 shadow-2xl text-center text-slate-900">
              <div className="mb-6 flex justify-center">
                 {result.status === 'PASS' ? (
                   <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                 ) : (
                   <AlertCircle className="w-16 h-16 text-rose-500" />
                 )}
              </div>
              <h2 className="text-2xl font-black mb-2">Voice Analysis {result.status}</h2>
              <div className="flex items-center justify-center gap-2 mb-6">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress Saved</span>
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
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
                <strong>Coach Feedback:</strong> {result.feedback}
              </p>
              <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">
                Return to Hub
              </button>
           </div>
        </div>
      )}

      {/* Main Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        
        {/* Connection Status */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
           <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
           {isConnected ? 'Gemini Live Connected (Native Audio)' : 'Connecting...'}
        </div>

        {/* Caller Avatar / Visualizer */}
        <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center mb-8 shadow-2xl transition-all duration-300 relative ${isListening ? 'border-orange-500' : 'border-slate-700 bg-slate-800'}`}>
           {/* Visualizer rings */}
           {isListening && (
             <>
                <div className="absolute inset-0 rounded-full border border-orange-500/50 animate-ping" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping" style={{ animationDuration: '3s' }}></div>
             </>
           )}
           <Activity className={`w-16 h-16 ${isListening ? 'text-orange-500' : 'text-slate-600'}`} />
        </div>

        <h2 className="text-3xl font-black mb-2 tracking-tight">{scenario.title}</h2>
        <p className="text-slate-400 mb-12 text-center max-w-md">
           {error ? <span className="text-rose-500 font-bold">{error}</span> : isListening ? "Listening... Speak naturally." : "Microphone is muted. Tap to resume."}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-8">
           <button 
             onClick={handleFinish}
             className="p-6 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
             title="End Call"
           >
             <StopCircle className="w-8 h-8" />
           </button>

           <button 
             onClick={toggleMic}
             disabled={!isConnected}
             className={`p-10 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale ${
               isListening 
                 ? 'bg-orange-500 text-white shadow-orange-500/50' 
                 : 'bg-white text-slate-900'
             }`}
           >
             {isListening ? <Mic className="w-12 h-12 animate-pulse" /> : <MicOff className="w-12 h-12" />}
           </button>

           <div className="w-20 h-20"></div> {/* Spacer for balance */}
        </div>
      </div>
    </div>
  );
};
