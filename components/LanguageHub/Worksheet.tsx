
import React, { useEffect, useState } from 'react';
import { generateWorksheetQuestions, QuizQuestion } from '../../services/geminiService';
import { Loader2, CheckCircle, XCircle, RefreshCw, Brain } from 'lucide-react';

interface Props {
  topic: string;
  onComplete: (score: number) => void;
}

export const Worksheet: React.FC<Props> = ({ topic, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [topic]);

  const loadQuestions = async () => {
    setLoading(true);
    const qs = await generateWorksheetQuestions(topic);
    setQuestions(qs);
    setLoading(false);
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return; // Prevent changing answer
    setSelectedAnswer(option);
    
    if (option === questions[currentQIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
      onComplete(score + (selectedAnswer === questions[currentQIndex].correctAnswer ? 1 : 0));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium">Generating a unique quiz for "{topic}" using Gemini AI...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-500 mb-4">Failed to generate questions.</p>
        <button onClick={loadQuestions} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center p-12 bg-indigo-50 rounded-2xl">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Worksheet Complete!</h3>
        <p className="text-lg text-slate-600 mb-6">You scored <span className="font-bold text-indigo-600">{score} / {questions.length}</span></p>
        <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
          <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${(score / questions.length) * 100}%` }} />
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentQIndex + 1} of {questions.length}</span>
        <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold">
           <Brain className="w-3 h-3" /> AI Generated
        </div>
      </div>
      
      <div className="p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6">{currentQ.question}</h3>
        
        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt, idx) => {
            let stateClass = "border-slate-200 hover:border-indigo-400 hover:bg-slate-50";
            if (selectedAnswer) {
              if (opt === currentQ.correctAnswer) stateClass = "border-emerald-500 bg-emerald-50 text-emerald-700";
              else if (opt === selectedAnswer) stateClass = "border-rose-500 bg-rose-50 text-rose-700";
              else stateClass = "border-slate-100 text-slate-400 opacity-50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                disabled={!!selectedAnswer}
                className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all flex justify-between items-center ${stateClass}`}
              >
                <span>{opt}</span>
                {selectedAnswer && opt === currentQ.correctAnswer && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                {selectedAnswer && opt === selectedAnswer && opt !== currentQ.correctAnswer && <XCircle className="w-5 h-5 text-rose-500" />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-indigo-800 font-medium">
              <span className="font-bold">Explanation:</span> {currentQ.explanation || "Correct answer logic provided by AI."}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {currentQIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};
