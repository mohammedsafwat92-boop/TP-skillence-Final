
import React, { useState } from 'react';
import { allTrainingModules, Lesson, Module } from '../../data/trainingData';
import { ChevronRight, PlayCircle, CheckCircle, Clock, Lock } from 'lucide-react';
import { LessonViewer } from './LessonViewer';
import { AccessProfile } from '../../types';
import { dataStore } from '../../services/DataStore';

interface Props {
  currentUser: AccessProfile;
}

export const LanguageHub: React.FC<Props> = ({ currentUser }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(allTrainingModules[0].id);

  const agent = dataStore.getAgentByEmail(currentUser.email);
  const completedLessons = agent?.completedLessonIds || [];

  const toggleModule = (id: string) => {
    setExpandedModuleId(prev => prev === id ? null : id);
  };

  if (activeLesson) {
    return <LessonViewer lesson={activeLesson} onClose={() => setActiveLesson(null)} currentUser={currentUser} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black mb-2">Language Excellence Center</h2>
          <p className="text-indigo-100 max-w-xl">Master business communication, cultural nuances, and soft skills with our AI-powered curriculum.</p>
        </div>
        <div className="flex gap-4">
           <div className="text-center">
             <div className="text-3xl font-black">{completedLessons.length}</div>
             <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Lessons Done</div>
           </div>
           <div className="w-px bg-indigo-500 h-12"></div>
           <div className="text-center">
             <div className="text-3xl font-black">B2</div>
             <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Current Level</div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {allTrainingModules.map((module) => (
          <div key={module.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
            <button 
              onClick={() => toggleModule(module.id)}
              className="w-full p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors text-left"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${
                module.level === 'B1' ? 'bg-indigo-500' : module.level === 'B2' ? 'bg-purple-500' : 'bg-rose-500'
              }`}>
                <module.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-slate-800">{module.title}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded tracking-widest">Level {module.level}</span>
                </div>
                <p className="text-slate-500 text-sm">{module.description}</p>
              </div>
              <div className={`transform transition-transform duration-300 ${expandedModuleId === module.id ? 'rotate-90' : ''}`}>
                <ChevronRight className="w-6 h-6 text-slate-300" />
              </div>
            </button>

            {expandedModuleId === module.id && (
              <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-2">
                {module.lessons.length > 0 ? module.lessons.map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  return (
                    <div key={lesson.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                           {isCompleted ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-700">{lesson.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {lesson.steps.reduce((acc, s) => acc + s.duration, 0)} min
                            </span>
                            <span className="text-xs text-slate-400">{lesson.steps.length} Steps</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveLesson(lesson)}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                      >
                        {isCompleted ? 'Review' : 'Start Lesson'}
                      </button>
                    </div>
                  );
                }) : (
                  <div className="text-center p-8 text-slate-400 text-sm font-medium italic">
                    <Lock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    Content for this module is currently locked or under development.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
