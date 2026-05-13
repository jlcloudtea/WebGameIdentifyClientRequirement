/**
 * Zustand Game Store for "Junior IT Consultant Adventure"
 * Manages all game state including current phase, scores, and progress
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GamePhase,
  ScoreBreakdown,
  ScenarioResult,
  Badge,
  DialogueState,
  ListeningGameState,
  QuestioningGameState,
  GuidelinesState,
  DocumentationState,
  RecommendationState,
  EmotionalState,
} from './game-types';
import { ALL_BADGES } from './game-data';

// ============================================================
// Store Interface
// ============================================================

interface GameStore {
  // Core game state
  currentPhase: GamePhase;
  currentScenarioId: string | null;
  
  // Sub-game states
  dialogueState: DialogueState;
  listeningState: ListeningGameState;
  questioningState: QuestioningGameState;
  guidelinesState: GuidelinesState;
  documentationState: DocumentationState;
  recommendationState: RecommendationState;
  
  // Persistent data
  completedScenarios: string[];
  scenarioResults: Record<string, ScenarioResult>;
  earnedBadges: Badge[];
  playerName: string;
  
  // UI state
  showHint: boolean;
  currentHint: string;
  showAchievement: Badge | null;
  isTransitioning: boolean;
  
  // Actions - Game Flow
  setPhase: (phase: GamePhase) => void;
  startScenario: (scenarioId: string) => void;
  resetCurrentScenario: () => void;
  completeScenario: () => void;
  
  // Actions - Dialogue
  selectDialogueOption: (optionId: string, score: number, clientResponse: string, clientEmotion: EmotionalState, feedback: string, unlocksInfo?: string) => void;
  nextDialogueNode: () => void;
  
  // Actions - Listening
  categorizeItem: (itemId: string, category: string) => void;
  completeListeningChallenge: (score: number) => void;
  
  // Actions - Questioning
  answerQuestion: (challengeId: string, answerId: string) => void;
  completeQuestioning: (score: number) => void;
  
  // Actions - Guidelines
  answerGuideline: (guidelineId: string, answerId: string) => void;
  nextGuideline: () => void;
  completeGuidelines: (score: number) => void;
  
  // Actions - Documentation
  updateDocumentField: (fieldId: string, value: string) => void;
  completeDocumentation: (score: number, completeness: number, clarity: number, professionalism: number) => void;
  
  // Actions - Recommendation
  selectSolution: (solutionId: string) => void;
  updateAnalysis: (solutionId: string, analysis: string) => void;
  completeRecommendation: (score: number) => void;
  
  // Actions - Hints & Achievements
  showHintMessage: (hint: string) => void;
  hideHint: () => void;
  dismissAchievement: () => void;
  checkAndAwardBadges: () => void;
  
  // Actions - Utilities
  setPlayerName: (name: string) => void;
  getTotalScore: () => number;
  resetGame: () => void;
}

// ============================================================
// Initial States
// ============================================================

const initialDialogueState: DialogueState = {
  currentNodeIndex: 0,
  history: [],
  trustLevel: 70,
  informationUnlocked: [],
};

const initialListeningState: ListeningGameState = {
  items: [],
  categorizedItems: {
    budget: [],
    timeline: [],
    technical: [],
    policy: [],
    support: [],
    compatibility: [],
    training: [],
  },
  score: 0,
  completed: false,
};

const initialQuestioningState: QuestioningGameState = {
  currentChallengeIndex: 0,
  answers: {},
  score: 0,
  completed: false,
};

const initialGuidelinesState: GuidelinesState = {
  currentGuidelineIndex: 0,
  answers: {},
  score: 0,
  completed: false,
};

const initialDocumentationState: DocumentationState = {
  fields: {},
  score: 0,
  completed: false,
  completeness: 0,
  clarity: 0,
  professionalism: 0,
};

const initialRecommendationState: RecommendationState = {
  selectedSolutionId: null,
  analysis: {},
  score: 0,
  completed: false,
};

// ============================================================
// Store Creation
// ============================================================

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Core state
      currentPhase: 'dashboard',
      currentScenarioId: null,
      
      // Sub-game states
      dialogueState: { ...initialDialogueState },
      listeningState: { ...initialListeningState },
      questioningState: { ...initialQuestioningState },
      guidelinesState: { ...initialGuidelinesState },
      documentationState: { ...initialDocumentationState },
      recommendationState: { ...initialRecommendationState },
      
      // Persistent data
      completedScenarios: [],
      scenarioResults: {},
      earnedBadges: [],
      playerName: '',
      
      // UI state
      showHint: false,
      currentHint: '',
      showAchievement: null,
      isTransitioning: false,
      
      // ============================================================
      // Game Flow Actions
      // ============================================================
      
      setPhase: (phase) => {
        set({ isTransitioning: true });
        setTimeout(() => {
          set({ currentPhase: phase, isTransitioning: false });
        }, 300);
      },
      
      startScenario: (scenarioId) => {
        set({
          currentScenarioId: scenarioId,
          currentPhase: 'scenario-intro',
          dialogueState: { ...initialDialogueState },
          listeningState: { ...initialListeningState },
          questioningState: { ...initialQuestioningState },
          guidelinesState: { ...initialGuidelinesState },
          documentationState: { ...initialDocumentationState },
          recommendationState: { ...initialRecommendationState },
        });
      },
      
      resetCurrentScenario: () => {
        const scenarioId = get().currentScenarioId;
        if (scenarioId) {
          get().startScenario(scenarioId);
        }
      },
      
      completeScenario: () => {
        const state = get();
        const scenarioId = state.currentScenarioId;
        if (!scenarioId) return;
        
        const dScore = state.dialogueState.trustLevel;
        const lScore = state.listeningState.score;
        const qScore = state.questioningState.score;
        const gScore = state.guidelinesState.score;
        const docScore = state.documentationState.score;
        const rScore = state.recommendationState.score;
        
        const total = Math.round((dScore + lScore + qScore + gScore + docScore + rScore) / 6);
        
        const clientSatisfaction = Math.min(100, Math.max(0, dScore));
        const professionalismScore = Math.min(100, Math.max(0, Math.round((gScore + docScore) / 2)));
        const communicationScore = Math.min(100, Math.max(0, Math.round((dScore + qScore) / 2)));
        const accuracyScore = Math.min(100, Math.max(0, Math.round((lScore + docScore + rScore) / 3)));
        
        const feedback: string[] = [];
        if (clientSatisfaction >= 80) feedback.push('🌟 Excellent client satisfaction! You built great rapport.');
        else if (clientSatisfaction >= 50) feedback.push('👍 Good client satisfaction. Keep working on communication.');
        else feedback.push('⚠️ Client satisfaction needs improvement. Focus on active listening and empathy.');
        
        if (communicationScore >= 80) feedback.push('💬 Strong communication skills demonstrated!');
        else feedback.push('📝 Communication could be improved. Practice different question types.');
        
        if (accuracyScore >= 80) feedback.push('🎯 Great accuracy in identifying requirements!');
        else feedback.push('🔍 Work on identifying all requirements more thoroughly.');
        
        if (professionalismScore >= 80) feedback.push('👔 Professional approach throughout!');
        else feedback.push('📊 Improve documentation and policy adherence.');
        
        const result: ScenarioResult = {
          scenarioId,
          score: {
            communication: communicationScore,
            listening: lScore,
            questioning: qScore,
            documentation: docScore,
            guidelines: gScore,
            recommendation: rScore,
            total,
          },
          badges: [],
          completedAt: new Date().toISOString(),
          attempts: 1,
          clientSatisfaction,
          professionalismScore,
          communicationScore,
          accuracyScore,
          feedback,
        };
        
        const completedScenarios = state.completedScenarios.includes(scenarioId)
          ? state.completedScenarios
          : [...state.completedScenarios, scenarioId];
        
        set({
          completedScenarios,
          scenarioResults: { ...state.scenarioResults, [scenarioId]: result },
          currentPhase: 'scenario-summary',
        });
        
        // Check for badges after completing
        setTimeout(() => get().checkAndAwardBadges(), 500);
      },
      
      // ============================================================
      // Dialogue Actions
      // ============================================================
      
      selectDialogueOption: (optionId, score, clientResponse, clientEmotion, feedback, unlocksInfo) => {
        const state = get();
        const { dialogueState } = state;
        
        const newTrust = Math.max(0, Math.min(100, dialogueState.trustLevel + score));
        const newUnlocks = unlocksInfo
          ? [...dialogueState.informationUnlocked, unlocksInfo]
          : dialogueState.informationUnlocked;
        
        set({
          dialogueState: {
            ...dialogueState,
            trustLevel: newTrust,
            informationUnlocked: newUnlocks,
            history: [
              ...dialogueState.history,
              {
                speaker: 'player',
                text: `Selected option: ${optionId}`,
                scoreChange: score,
              },
              {
                speaker: 'client',
                text: clientResponse,
                emotion: clientEmotion,
              },
            ],
          },
        });
      },
      
      nextDialogueNode: () => {
        const state = get();
        const { dialogueState } = state;
        set({
          dialogueState: {
            ...dialogueState,
            currentNodeIndex: dialogueState.currentNodeIndex + 1,
          },
        });
      },
      
      // ============================================================
      // Listening Actions
      // ============================================================
      
      categorizeItem: (itemId, category) => {
        const state = get();
        const { listeningState } = state;
        
        const currentItems = listeningState.categorizedItems[category as keyof typeof listeningState.categorizedItems] || [];
        if (currentItems.includes(itemId)) return;
        
        set({
          listeningState: {
            ...listeningState,
            categorizedItems: {
              ...listeningState.categorizedItems,
              [category]: [...currentItems, itemId],
            },
          },
        });
      },
      
      completeListeningChallenge: (score) => {
        set({
          listeningState: {
            ...get().listeningState,
            score,
            completed: true,
          },
        });
      },
      
      // ============================================================
      // Questioning Actions
      // ============================================================
      
      answerQuestion: (challengeId, answerId) => {
        const state = get();
        set({
          questioningState: {
            ...state.questioningState,
            answers: { ...state.questioningState.answers, [challengeId]: answerId },
            currentChallengeIndex: state.questioningState.currentChallengeIndex + 1,
          },
        });
      },
      
      completeQuestioning: (score) => {
        set({
          questioningState: {
            ...get().questioningState,
            score,
            completed: true,
          },
        });
      },
      
      // ============================================================
      // Guidelines Actions
      // ============================================================
      
      answerGuideline: (guidelineId, answerId) => {
        const state = get();
        set({
          guidelinesState: {
            ...state.guidelinesState,
            answers: { ...state.guidelinesState.answers, [guidelineId]: answerId },
            // NOTE: Do NOT increment currentGuidelineIndex here!
            // The component needs to show feedback for the current guideline first.
            // Incrementing is done via nextGuideline() when the user clicks "Next".
          },
        });
      },
      
      nextGuideline: () => {
        const state = get();
        set({
          guidelinesState: {
            ...state.guidelinesState,
            currentGuidelineIndex: state.guidelinesState.currentGuidelineIndex + 1,
          },
        });
      },
      
      completeGuidelines: (score) => {
        set({
          guidelinesState: {
            ...get().guidelinesState,
            score,
            completed: true,
          },
        });
      },
      
      // ============================================================
      // Documentation Actions
      // ============================================================
      
      updateDocumentField: (fieldId, value) => {
        const state = get();
        set({
          documentationState: {
            ...state.documentationState,
            fields: { ...state.documentationState.fields, [fieldId]: value },
          },
        });
      },
      
      completeDocumentation: (score, completeness, clarity, professionalism) => {
        set({
          documentationState: {
            ...get().documentationState,
            score,
            completeness,
            clarity,
            professionalism,
            completed: true,
          },
        });
      },
      
      // ============================================================
      // Recommendation Actions
      // ============================================================
      
      selectSolution: (solutionId) => {
        set({
          recommendationState: {
            ...get().recommendationState,
            selectedSolutionId: solutionId,
          },
        });
      },
      
      updateAnalysis: (solutionId, analysis) => {
        set({
          recommendationState: {
            ...get().recommendationState,
            analysis: { ...get().recommendationState.analysis, [solutionId]: analysis },
          },
        });
      },
      
      completeRecommendation: (score) => {
        set({
          recommendationState: {
            ...get().recommendationState,
            score,
            completed: true,
          },
        });
      },
      
      // ============================================================
      // Hints & Achievements
      // ============================================================
      
      showHintMessage: (hint) => {
        set({ showHint: true, currentHint: hint });
      },
      
      hideHint: () => {
        set({ showHint: false, currentHint: '' });
      },
      
      dismissAchievement: () => {
        set({ showAchievement: null });
      },
      
      checkAndAwardBadges: () => {
        const state = get();
        const newBadges: Badge[] = [];
        const earnedIds = state.earnedBadges.map((b) => b.id);
        
        // First scenario badge
        if (!earnedIds.includes('first-scenario') && state.completedScenarios.length >= 1) {
          const badge = ALL_BADGES.find((b) => b.id === 'first-scenario')!;
          newBadges.push(badge);
        }
        
        // All scenarios badge
        if (!earnedIds.includes('all-scenarios') && state.completedScenarios.length >= 5) {
          const badge = ALL_BADGES.find((b) => b.id === 'all-scenarios')!;
          newBadges.push(badge);
        }
        
        // Check scenario-based badges
        Object.values(state.scenarioResults).forEach((result) => {
          if (result.listening >= 80 && !earnedIds.includes('active-listener')) {
            newBadges.push(ALL_BADGES.find((b) => b.id === 'active-listener')!);
          }
          if (result.score.questioning >= 80 && !earnedIds.includes('investigation-expert')) {
            newBadges.push(ALL_BADGES.find((b) => b.id === 'investigation-expert')!);
          }
          if (result.score.documentation >= 80 && !earnedIds.includes('requirements-detective')) {
            newBadges.push(ALL_BADGES.find((b) => b.id === 'requirements-detective')!);
          }
          if (result.clientSatisfaction >= 90 && !earnedIds.includes('communication-master')) {
            newBadges.push(ALL_BADGES.find((b) => b.id === 'communication-master')!);
          }
          if (result.score.guidelines >= 100 && !earnedIds.includes('policy-pro')) {
            newBadges.push(ALL_BADGES.find((b) => b.id === 'policy-pro')!);
          }
          if (result.score.communication >= 90 && !earnedIds.includes('quick-thinker')) {
            newBadges.push(ALL_BADGES.find((b) => b.id === 'quick-thinker')!);
          }
          if (result.score.total >= 100 && !earnedIds.includes('perfect-score')) {
            newBadges.push(ALL_BADGES.find((b) => b.id === 'perfect-score')!);
          }
        });
        
        // Budget guardian - check recommendation choices
        const budgetFriendlyChoices = Object.values(state.scenarioResults).filter(
          (r) => r.score.recommendation >= 70
        );
        if (budgetFriendlyChoices.length >= 3 && !earnedIds.includes('budget-guardian')) {
          newBadges.push(ALL_BADGES.find((b) => b.id === 'budget-guardian')!);
        }
        
        if (newBadges.length > 0) {
          const allBadges = [...state.earnedBadges, ...newBadges];
          set({
            earnedBadges: allBadges,
            showAchievement: newBadges[0],
          });
        }
      },
      
      // ============================================================
      // Utilities
      // ============================================================
      
      setPlayerName: (name) => set({ playerName: name }),
      
      getTotalScore: () => {
        const results = get().scenarioResults;
        return Object.values(results).reduce((sum, r) => sum + r.score.total, 0);
      },
      
      resetGame: () => {
        set({
          currentPhase: 'dashboard',
          currentScenarioId: null,
          dialogueState: { ...initialDialogueState },
          listeningState: { ...initialListeningState },
          questioningState: { ...initialQuestioningState },
          guidelinesState: { ...initialGuidelinesState },
          documentationState: { ...initialDocumentationState },
          recommendationState: { ...initialRecommendationState },
          completedScenarios: [],
          scenarioResults: {},
          earnedBadges: [],
          playerName: '',
        });
      },
    }),
    {
      name: 'it-consultant-adventure-save',
      partialize: (state) => ({
        completedScenarios: state.completedScenarios,
        scenarioResults: state.scenarioResults,
        earnedBadges: state.earnedBadges,
        playerName: state.playerName,
      }),
    }
  )
);
