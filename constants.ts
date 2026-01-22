
import { Country, WorkNature, SHLData } from './types';

export const ADMIN_PASSWORD_HASH = "Aghoury007"; // In real app, this is hashed.

export const ADMIN_EMAILS = [
  "admin@gmail.com",
  "aaghoury@gmail.com"
];

export const COUNTRIES: Country[] = [
  { name: "Egypt", flag: "🇪🇬", region: "Middle East", personas: [], dosAndDonts: ["Value hospitality", "Be direct but polite"] },
  { name: "USA", flag: "🇺🇸", region: "Americas", personas: [], dosAndDonts: ["Time is money", "Informal but professional"] },
  { name: "United Kingdom", flag: "🇬🇧", region: "Europe", personas: [], dosAndDonts: ["Polite and indirect", "Understatement is common"] },
  { name: "UAE", flag: "🇦🇪", region: "Middle East", personas: [], dosAndDonts: ["High respect for hierarchy", "Relationship focused"] },
  { name: "Saudi Arabia", flag: "🇸🇦", region: "Middle East", personas: [], dosAndDonts: ["Formal greetings", "Patience is key"] },
  { name: "Philippines", flag: "🇵🇭", region: "Asia", personas: [], dosAndDonts: ["Respect for elders", "Indirect communication"] },
  { name: "India", flag: "🇮🇳", region: "Asia", personas: [], dosAndDonts: ["Strong family values", "Professional hierarchy"] },
  { name: "South Africa", flag: "🇿🇦", region: "Africa", personas: [], dosAndDonts: ["Diverse cultures", "Warm greetings"] },
  { name: "Nigeria", flag: "🇳🇬", region: "Africa", personas: [], dosAndDonts: ["Directness", "High energy interactions"] },
  { name: "France", flag: "🇫🇷", region: "Europe", personas: [], dosAndDonts: ["Value formality", "Appreciate the language"] },
  { name: "Germany", flag: "🇩🇪", region: "Europe", personas: [], dosAndDonts: ["Punctuality", "Strict directness"] },
  { name: "Italy", flag: "🇮🇹", region: "Europe", personas: [], dosAndDonts: ["Expressive", "Relationship driven"] },
  { name: "Spain", flag: "🇪🇸", region: "Europe", personas: [], dosAndDonts: ["Vibrant communication", "Later start times"] },
  { name: "Brazil", flag: "🇧🇷", region: "Americas", personas: [], dosAndDonts: ["Friendly and physical", "Late is often okay"] },
  { name: "Mexico", flag: "🇲🇽", region: "Americas", personas: [], dosAndDonts: ["Very polite", "Indirect negative feedback"] },
  { name: "Colombia", flag: "🇨🇴", region: "Americas", personas: [], dosAndDonts: ["Very formal", "Warm and hospitable"] },
  { name: "Canada", flag: "🇨🇦", region: "Americas", personas: [], dosAndDonts: ["Highly polite", "Value multiculturalism"] },
  { name: "Australia", flag: "🇦🇺", region: "Asia", personas: [], dosAndDonts: ["Equalitarianism", "No-nonsense attitude"] },
  { name: "Japan", flag: "🇯🇵", region: "Asia", personas: [], dosAndDonts: ["Extreme politeness", "Silence is respect"] },
  { name: "China", flag: "🇨🇳", region: "Asia", personas: [], dosAndDonts: ["Concept of 'Face'", "Harmony is prioritized"] },
  { name: "Greece", flag: "🇬🇷", region: "Europe", personas: [], dosAndDonts: ["Passionate debate", "Strong family ties"] },
  { name: "Turkey", flag: "🇹🇷", region: "Middle East", personas: [], dosAndDonts: ["Generous hospitality", "Respect for elders"] },
  { name: "Morocco", flag: "🇲🇦", region: "Africa", personas: [], dosAndDonts: ["Gift giving", "Slow-paced business"] },
  { name: "Jordan", flag: "🇯🇴", region: "Middle East", personas: [], dosAndDonts: ["Respect for tradition", "Indirect feedback"] },
  { name: "Kuwait", flag: "🇰🇼", region: "Middle East", personas: [], dosAndDonts: ["Formality", "Network oriented"] },
  { name: "Qatar", flag: "🇶🇦", region: "Middle East", personas: [], dosAndDonts: ["High prestige focused", "Formal protocol"] },
  { name: "Lebanon", flag: "🇱🇧", region: "Middle East", personas: [], dosAndDonts: ["Multilingual", "Value appearance"] }
];

export const WORK_NATURES: WorkNature[] = [
  { id: 'travel', name: 'Travel', icon: 'Plane' },
  { id: 'telecom', name: 'Telecom', icon: 'Phone' },
  { id: 'food', name: 'Food Delivery', icon: 'Utensils' },
  { id: 'shipping', name: 'Shipping', icon: 'Truck' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag' }
];

export const MOCK_SHL_DATA: SHLData[] = [
  {
    id: "SHL-001",
    agentEmail: "agent@gmail.com",
    listening: 85,
    speaking: 60,
    reading: 90,
    sales: 45,
    cefr: "B2",
    opportunities: ["Speaking Fluency", "Closing Sales"],
    confidenceScore: 0.98,
    parsedAt: new Date().toISOString()
  }
];
