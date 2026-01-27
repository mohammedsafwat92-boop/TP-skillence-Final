
import { Agent, ClassGroup, SimulationResult, User, SHLData, Course } from '../types';

interface StoreData {
  classes: ClassGroup[];
  agents: Agent[];
  simulations: SimulationResult[];
}

const STORAGE_KEY = 'tp_skillence_store_v1';

class DataStore {
  private data: StoreData;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      this.data = this.seedData();
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  // --- SEEDING ---
  private seedData(): StoreData {
    const coaches = ['coach@gmail.com', 'jessica.coach@tp.com'];
    
    // Create Classes
    const classes: ClassGroup[] = [
      { id: 'C-Alpha', name: 'Alpha Wave', coachId: coaches[0], agentIds: [] },
      { id: 'C-Beta', name: 'Beta Wave', coachId: coaches[1], agentIds: [] }
    ];

    // Create Agents
    const agents: Agent[] = Array.from({ length: 10 }).map((_, i) => {
      const isAlpha = i < 5;
      const id = `AGT-${1000 + i}`;
      const email = `agent${i}@gmail.com`;
      
      // Link to class
      if (isAlpha) classes[0].agentIds.push(id);
      else classes[1].agentIds.push(id);

      return {
        testId: id,
        name: isAlpha ? `Alpha Agent ${i+1}` : `Beta Agent ${i-4}`,
        email: email,
        coachId: isAlpha ? coaches[0] : coaches[1],
        classId: isAlpha ? 'C-Alpha' : 'C-Beta',
        writing: 60 + Math.random() * 30,
        speaking: 50 + Math.random() * 40,
        listening: 70 + Math.random() * 20,
        grammar: 60 + Math.random() * 30,
        analytical: 50 + Math.random() * 30,
        overallAvg: 0, // Will calc below
        cefr: Math.random() > 0.5 ? 'B2' : 'B1',
        primaryOpportunity: Math.random() > 0.5 ? 'Empathy' : 'Accuracy',
        recommendedPlan: 'Module 1; Module 2',
        assignedModules: '',
        courses: [],
        history: [],
        completedLessonIds: []
      };
    });

    // Calculate initial averages
    agents.forEach(a => {
      a.overallAvg = Math.round((a.writing + a.speaking + a.listening + a.grammar + a.analytical) / 5);
    });

    // Specific Override for the logged in demo agent
    const demoAgent = agents[0];
    demoAgent.email = 'agent@gmail.com';
    demoAgent.name = 'Alex Agent';

    return {
      classes,
      agents,
      simulations: []
    };
  }

  // --- GETTERS ---

  getAgentsByCoach(coachEmail: string): Agent[] {
    return this.data.agents.filter(a => a.coachId === coachEmail);
  }

  getAllAgents(): Agent[] {
    return this.data.agents;
  }

  getAgentByEmail(email: string): Agent | undefined {
    return this.data.agents.find(a => a.email.toLowerCase() === email.toLowerCase());
  }

  getAllClasses(): ClassGroup[] {
    return this.data.classes;
  }

  getSimulationsForAgent(email: string): SimulationResult[] {
    return this.data.simulations.filter(s => s.agentEmail === email);
  }

  // --- ACTIONS ---

  upsertAgentFromSHL(shlData: SHLData): Agent {
    let agent = this.getAgentByEmail(shlData.agentEmail);

    if (!agent) {
      // Create new Agent
      agent = {
        testId: `SHL-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        name: shlData.agentEmail.split('@')[0], // Fallback name
        email: shlData.agentEmail,
        writing: 50, // Default if missing
        speaking: shlData.speaking || 0,
        listening: shlData.listening || 0,
        grammar: 50, // Default if missing
        analytical: 50,
        overallAvg: shlData.overall || 0,
        cefr: shlData.cefr || 'B1',
        primaryOpportunity: shlData.opportunities?.[0] || 'General Improvement',
        recommendedPlan: 'Automated Onboarding Plan',
        assignedModules: '',
        courses: [],
        history: [],
        completedLessonIds: []
      };
      this.data.agents.push(agent);
    } else {
      // Update existing
      agent.speaking = shlData.speaking || agent.speaking;
      agent.listening = shlData.listening || agent.listening;
      agent.overallAvg = shlData.overall || agent.overallAvg;
      agent.cefr = shlData.cefr || agent.cefr;
    }

    // Auto-Assign Courses logic
    this.assignCoursesBasedOnSkills(agent, shlData);

    this.save();
    return agent;
  }

  private assignCoursesBasedOnSkills(agent: Agent, scores: SHLData) {
    if (!agent.courses) agent.courses = [];

    const addCourse = (id: string, title: string, reason: string) => {
      if (!agent.courses!.some(c => c.id === id)) {
        agent.courses!.push({
          id,
          title,
          status: 'Pending',
          assignedAt: new Date().toISOString(),
          reason
        });
      }
    };

    if ((scores.speaking || 0) < 60) {
      addCourse('crs_speak_101', 'Basic Phone Skills', 'Low Speaking Score');
    }

    if (scores.cefr === 'A1' || scores.cefr === 'A2') {
      addCourse('crs_eng_bootcamp', 'Intensive English Bootcamp', 'CEFR Level Requirement');
    }

    // Default onboarding course
    addCourse('crs_ob_01', 'TP Culture & Values', 'Standard Onboarding');
  }

  addSimulationResult(email: string, result: SimulationResult) {
    const fullResult = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      agentEmail: email,
      timestamp: new Date().toISOString()
    };
    
    this.data.simulations.push(fullResult);

    // Update Agent Stats (Simple Moving Average simulation)
    const agent = this.getAgentByEmail(email);
    if (agent) {
      // Simulate impact of training
      const improvement = 0.5; 
      if (result.status === 'PASS') {
        agent.speaking = Math.min(100, agent.speaking + improvement);
        agent.grammar = Math.min(100, agent.grammar + improvement);
        agent.overallAvg = Math.round((agent.writing + agent.speaking + agent.listening + agent.grammar + agent.analytical) / 5);
        
        // Add history entry
        if (!agent.history) agent.history = [];
        agent.history.push({
          date: new Date().toISOString().split('T')[0],
          overallScore: agent.overallAvg,
          speaking: agent.speaking,
          grammar: agent.grammar
        });
      }
    }

    this.save();
    return fullResult;
  }

  markLessonComplete(agentEmail: string, lessonId: string) {
    const agent = this.getAgentByEmail(agentEmail);
    if (agent) {
      if (!agent.completedLessonIds) agent.completedLessonIds = [];
      if (!agent.completedLessonIds.includes(lessonId)) {
        agent.completedLessonIds.push(lessonId);
        this.save();
      }
    }
  }
}

export const dataStore = new DataStore();
