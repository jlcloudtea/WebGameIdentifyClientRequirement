'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import GameHeader from '@/components/game/GameHeader';
import GameDashboard from '@/components/game/GameDashboard';
import ScenarioIntro from '@/components/game/ScenarioIntro';
import DialogueSystem from '@/components/game/DialogueSystem';
import ActiveListeningGame from '@/components/game/ActiveListeningGame';
import QuestioningGame from '@/components/game/QuestioningGame';
import GuidelinesChallenge from '@/components/game/GuidelinesChallenge';
import DocumentationSystem from '@/components/game/DocumentationSystem';
import RecommendationEngine from '@/components/game/RecommendationEngine';
import ScenarioSummary from '@/components/game/ScenarioSummary';
import AchievementPopup from '@/components/game/AchievementPopup';

/**
 * Main Game Page - Junior IT Consultant Adventure
 * 
 * An interactive educational web game for vocational IT students
 * studying "Identify and Document Client Requirements"
 * 
 * Game Phases:
 * 1. dashboard - Choose a scenario
 * 2. scenario-intro - Meet the client
 * 3. dialogue - Conversation simulator
 * 4. active-listening - Categorize requirements
 * 5. questioning - Question type mini-game
 * 6. guidelines - Organisational policy challenges
 * 7. documentation - Fill out requirement forms
 * 8. recommendation - Compare and recommend solutions
 * 9. scenario-summary - Score breakdown and feedback
 */

export default function Home() {
  const currentPhase = useGameStore((s) => s.currentPhase);
  const showAchievement = useGameStore((s) => s.showAchievement);

  const renderPhase = () => {
    switch (currentPhase) {
      case 'dashboard':
        return <GameDashboard />;
      case 'scenario-intro':
        return <ScenarioIntro />;
      case 'dialogue':
        return <DialogueSystem />;
      case 'active-listening':
        return <ActiveListeningGame />;
      case 'questioning':
        return <QuestioningGame />;
      case 'guidelines':
        return <GuidelinesChallenge />;
      case 'documentation':
        return <DocumentationSystem />;
      case 'recommendation':
        return <RecommendationEngine />;
      case 'scenario-summary':
        return <ScenarioSummary />;
      default:
        return <GameDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Game Header - always visible */}
      <GameHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-slate-900 text-slate-400 py-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm">
            🎮 Junior IT Consultant Adventure — AQF Level 2-3
          </p>
          <p className="text-xs text-slate-500">
            Identify &amp; Document Client Requirements • Interactive Learning
          </p>
        </div>
      </footer>

      {/* Achievement Popup Overlay */}
      {showAchievement && <AchievementPopup />}
    </div>
  );
}
