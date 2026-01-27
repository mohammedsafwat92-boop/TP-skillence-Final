
import { BookOpen, Phone, MessageSquare, Shield, Globe, Award } from 'lucide-react';

export interface Step {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'audio';
  content: string; // URL for video, markdown for text, or topic key for quiz
  duration: number; // minutes
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}

export interface Module {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  description: string;
  icon: any;
  lessons: Lesson[];
}

export const allTrainingModules: Module[] = [
  {
    id: 'mod_english_b1',
    title: 'Business English B1',
    level: 'B1',
    description: 'Essential vocabulary and phrasing for professional customer service environments.',
    icon: BookOpen,
    lessons: [
      {
        id: 'les_greeting',
        title: 'Professional Greetings',
        description: 'Master the art of the first impression. Learn standard openings and tone.',
        steps: [
          { 
            id: 's1', 
            title: 'Introduction', 
            type: 'text', 
            content: '# Welcome to Professional Greetings\n\nThe first 5 seconds of a call determine the customer\'s sentiment. In this lesson, we will cover:\n\n* Standard Corporate Openings\n* Tone matching\n* Avoiding "Robot Voice"', 
            duration: 2 
          },
          { 
            id: 's2', 
            title: 'Good vs Bad Examples', 
            type: 'text', 
            content: '### Scenario A: The Robot\n"Thank you for calling [Company]. My name is [Name]. How can I help you?" (Said in a monotone voice)\n\n**Verdict:** ❌ Cold and unwelcoming.\n\n### Scenario B: The Professional\n"Hi! Thank you for choosing [Company], this is [Name]. I can definitely help you with that today!"\n\n**Verdict:** ✅ Warm, confident, and assuring.', 
            duration: 3 
          },
          { 
            id: 's3', 
            title: 'Greeting Quiz', 
            type: 'quiz', 
            content: 'Professional Greetings and Opening Statements', 
            duration: 5 
          }
        ]
      },
      {
        id: 'les_deescalation',
        title: 'De-escalation 101',
        description: 'Key phrases to calm down upset customers.',
        steps: [
          { id: 'd1', title: 'The Empathy Bridge', type: 'text', content: '# The Empathy Bridge\n\nNever start with "Calm down". Instead, use bridging statements:\n\n1. "I can hear that this has been frustrating for you..."\n2. "I completely understand why you are upset..."', duration: 3 },
          { id: 'd2', title: 'Knowledge Check', type: 'quiz', content: 'De-escalation and Empathy Statements', duration: 5 }
        ]
      }
    ]
  },
  {
    id: 'mod_soft_skills',
    title: 'Empathy & Soft Skills',
    level: 'B2',
    description: 'Advanced techniques for handling complex emotional situations.',
    icon: Shield,
    lessons: [
       {
        id: 'les_active_listening',
        title: 'Active Listening',
        description: 'Prove you are listening without interrupting.',
        steps: [
          { id: 'al1', title: 'Verbal Nods', type: 'text', content: '# Verbal Nods\n\nUse short affirmations to keep the customer talking:\n\n* "I see..."\n* "Go on..."\n* "That makes sense..."\n\nAvoid dead air!', duration: 2 },
          { id: 'al2', title: 'Soft Skills Assessment', type: 'quiz', content: 'Active Listening Techniques', duration: 10 }
        ]
      }
    ]
  },
  {
    id: 'mod_culture',
    title: 'Cultural Nuances',
    level: 'C1',
    description: 'Understanding idioms and regional communication styles.',
    icon: Globe,
    lessons: []
  },
  {
    id: 'mod_sales',
    title: 'Sales Psychology',
    level: 'B2',
    description: 'Transitioning from support to sales naturally.',
    icon: Award,
    lessons: []
  }
];
