
import React, { useState } from 'react';
import { Lesson } from '../../data/trainingData';
import { ChevronRight, ChevronLeft, CheckCircle, X, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { Worksheet } from './Worksheet';
import ReactMarkdown from 'react-markdown';
import { dataStore } from '../../services/DataStore';
import { AccessProfile } from '../../types';

interface Props {
  lesson: Lesson;
  onClose: () => void;
  currentUser: AccessProfile;
}

export const LessonViewer: React.FC<Props> = ({ lesson, onClose, currentUser }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = lesson.steps[stepIndex];

  const handleNext = () => {
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      // Complete Lesson
      dataStore.markLessonComplete(currentUser.email, lesson.id);
      onClose();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex animate-in fade-in duration-200">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <button onClick={onClose} className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 text-sm font-bold">
            <X className="w-4 h-4" /> Exit Lesson
          </button>
          <h2 className="text-white font-bold text-lg leading-tight">{lesson.title}</h2>
          <p className="text-slate-400 text-xs mt-1">{lesson.description}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {lesson.steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setStepIndex(idx)}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                idx === stepIndex 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                idx === stepIndex ? 'border-white text-white' : 'border-slate-500 text-slate-500'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{step.title}</p>
                <div className="flex items-center gap-2 text-[10px] opacity-70 uppercase tracking-wider">
                  {step.type === 'video' && <PlayCircle className="w-3 h-3" />}
                  {step.type === 'text' && <FileText className="w-3 h-3" />}
                  {step.type === 'quiz' && <HelpCircle className="w-3 h-3" />}
                  <span>{step.duration} min</span>
                </div>
              </div>
              {idx < stepIndex && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-200 w-full">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500" 
            style={{ width: `${((stepIndex + 1) / lesson.steps.length) * 100}%` }} 
          />
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 flex justify-center">
          <div className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Content Renderers */}
            {currentStep.type === 'text' && (
              <div className="prose prose-lg max-w-none prose-headings:font-black prose-indigo bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
                <ReactMarkdown>{currentStep.content}</ReactMarkdown>
              </div>
            )}

            {currentStep.type === 'video' && (
              <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
                 <iframe 
                   width="100%" 
                   height="100%" 
                   src={currentStep.content} 
                   title={currentStep.title} 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 ></iframe>
              </div>
            )}

            {currentStep.type === 'quiz' && (
              <Worksheet 
                topic={currentStep.content} 
                onComplete={(score) => {
                  console.log("Quiz completed with score:", score);
                }} 
              />
            )}
            
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
          <button 
            onClick={handlePrev}
            disabled={stepIndex === 0}
            className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl disabled:opacity-30 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>
          
          <button 
            onClick={handleNext}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
          >
            {stepIndex === lesson.steps.length - 1 ? 'Finish Lesson' : 'Next Step'} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
