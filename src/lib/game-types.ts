/**
 * Game Types for "Junior IT Consultant Adventure"
 * An educational game teaching client requirements identification
 * for AQF Level 2-3 vocational IT students
 */

// ============================================================
// Core Game Types
// ============================================================

export type GamePhase =
  | 'dashboard'
  | 'scenario-intro'
  | 'dialogue'
  | 'active-listening'
  | 'questioning'
  | 'guidelines'
  | 'documentation'
  | 'recommendation'
  | 'scenario-summary'
  | 'achievements';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type QuestionType =
  | 'open'
  | 'closed'
  | 'clarification'
  | 'probing'
  | 'strategic'
  | 'planning'
  | 'divergent'
  | 'poor';

export type RequirementCategory =
  | 'budget'
  | 'timeline'
  | 'technical'
  | 'policy'
  | 'support'
  | 'compatibility'
  | 'training';

export type EmotionalState = 'happy' | 'frustrated' | 'confused' | 'worried' | 'neutral' | 'excited';

// ============================================================
// Client & Scenario Types
// ============================================================

export interface Client {
  id: string;
  name: string;
  role: string;
  organization: string;
  avatar: string; // emoji or icon identifier
  personality: string;
  emotionalState: EmotionalState;
  budget?: string;
  hiddenRequirements: string[];
}

export interface DialogueOption {
  id: string;
  text: string;
  type: QuestionType;
  score: number;
  clientResponse: string;
  clientEmotion: EmotionalState;
  unlocksInfo?: string;
  feedback: string;
  isCorrect: boolean;
}

export interface DialogueNode {
  id: string;
  speaker: 'client' | 'player';
  text: string;
  emotion?: EmotionalState;
  options?: DialogueOption[];
  isIntro?: boolean;
}

export interface ListeningItem {
  id: string;
  text: string;
  category: RequirementCategory;
  isImportant: boolean;
}

export interface QuestionChallenge {
  id: string;
  situation: string;
  options: {
    id: string;
    text: string;
    type: QuestionType;
    isBest: boolean;
    feedback: string;
  }[];
  correctAnswer: string;
}

export interface GuidelineScenario {
  id: string;
  title: string;
  description: string;
  policy: string;
  options: {
    id: string;
    text: string;
    followsGuidelines: boolean;
    feedback: string;
    score: number;
  }[];
  correctAnswer: string;
}

export interface DocumentationField {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  category: RequirementCategory;
  correctValues: string[]; // keywords that should be present
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  cost: string;
  advantages: string[];
  disadvantages: string[];
  suitability: number; // 1-5
  supportLevel: 'basic' | 'standard' | 'premium';
  meetsRequirements: boolean;
  meetsBudget: boolean;
  followsPolicy: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  icon: string; // emoji
  color: string; // tailwind color class
  client: Client;
  dialogue: DialogueNode[];
  listeningItems: ListeningItem[];
  questionChallenges: QuestionChallenge[];
  guidelines: GuidelineScenario[];
  documentationFields: DocumentationField[];
  solutions: Solution[];
  learningObjectives: string[];
  keyConcepts: string[];
}

// ============================================================
// Scoring & Achievement Types
// ============================================================

export interface ScoreBreakdown {
  communication: number;
  listening: number;
  questioning: number;
  documentation: number;
  guidelines: number;
  recommendation: number;
  total: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  requirement: string;
  unlockedAt?: number; // score threshold
}

export interface ScenarioResult {
  scenarioId: string;
  score: ScoreBreakdown;
  badges: Badge[];
  completedAt: string;
  attempts: number;
  clientSatisfaction: number; // 0-100
  professionalismScore: number; // 0-100
  communicationScore: number; // 0-100
  accuracyScore: number; // 0-100
  feedback: string[];
}

export interface GameSave {
  completedScenarios: string[];
  scenarioResults: Record<string, ScenarioResult>;
  totalBadges: Badge[];
  totalScore: number;
  playerName: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Game State Types
// ============================================================

export interface DialogueState {
  currentNodeIndex: number;
  history: Array<{
    speaker: 'client' | 'player';
    text: string;
    emotion?: EmotionalState;
    scoreChange?: number;
  }>;
  trustLevel: number; // 0-100
  informationUnlocked: string[];
}

export interface ListeningGameState {
  items: ListeningItem[];
  categorizedItems: Record<RequirementCategory, string[]>;
  score: number;
  completed: boolean;
}

export interface QuestioningGameState {
  currentChallengeIndex: number;
  answers: Record<string, string>;
  score: number;
  completed: boolean;
}

export interface GuidelinesState {
  currentGuidelineIndex: number;
  answers: Record<string, string>;
  score: number;
  completed: boolean;
}

export interface DocumentationState {
  fields: Record<string, string>;
  score: number;
  completed: boolean;
  completeness: number; // 0-100
  clarity: number; // 0-100
  professionalism: number; // 0-100
}

export interface RecommendationState {
  selectedSolutionId: string | null;
  analysis: Record<string, string>; // solutionId -> analysis text
  score: number;
  completed: boolean;
}
