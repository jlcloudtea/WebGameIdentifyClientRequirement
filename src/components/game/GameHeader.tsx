'use client';

import { useGameStore } from '@/lib/game-store';
import { getScenarioById } from '@/lib/game-data';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Home, Lightbulb, Trophy, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameHeader() {
  const {
    currentPhase,
    currentScenarioId,
    dialogueState,
    getTotalScore,
    showHint,
    currentHint,
    showHintMessage,
    hideHint,
    setPhase,
  } = useGameStore();

  const scenario = currentScenarioId
    ? getScenarioById(currentScenarioId)
    : undefined;

  const totalScore = getTotalScore();
  const trustLevel = dialogueState.trustLevel;
  const isInDialogue = currentPhase === 'dialogue';
  const isInScenario =
    currentPhase !== 'dashboard' && currentPhase !== 'achievements';

  const getHintForPhase = () => {
    switch (currentPhase) {
      case 'dialogue':
        return 'Try using open-ended questions first to gather more information. Look for clarification and probing opportunities!';
      case 'active-listening':
        return 'Carefully read each item and think about which category it belongs to. Watch out for red herrings!';
      case 'questioning':
        return 'Consider which question type would be most appropriate for each situation. Think about what information you still need.';
      case 'guidelines':
        return 'Always follow organisational policies, even if a shortcut seems tempting. Policies exist for important reasons!';
      case 'documentation':
        return 'Make sure your documentation is complete, clear, and professional. Include all the requirements you have identified.';
      case 'recommendation':
        return 'Consider which solution best meets ALL requirements: budget, policy, and client needs. The cheapest option is not always the best!';
      case 'scenario-intro':
        return 'Read the client profile carefully. Their personality will affect how you should communicate with them.';
      default:
        return 'Welcome! Choose a mission to begin your IT consultant adventure.';
    }
  };

  const handleHome = () => {
    setPhase('dashboard');
  };

  const handleHint = () => {
    if (showHint) {
      hideHint();
    } else {
      showHintMessage(getHintForPhase());
    }
  };

  const getTrustColor = (trust: number) => {
    if (trust >= 80) return 'text-emerald-400';
    if (trust >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getTrustLabel = (trust: number) => {
    if (trust >= 90) return 'Excellent Rapport';
    if (trust >= 70) return 'Good Relationship';
    if (trust >= 50) return 'Neutral';
    if (trust >= 30) return 'Tense';
    return 'Client Distrustful';
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg border-b border-slate-700/50"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left section: Home + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isInScenario && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleHome}
                className="text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                aria-label="Return to dashboard"
              >
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-white truncate">
                🎮 Junior IT Consultant
              </h1>
              {scenario && isInScenario && (
                <motion.p
                  key={scenario.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-amber-400 truncate hidden sm:block"
                >
                  {scenario.title}
                </motion.p>
              )}
            </div>
          </div>

          {/* Center section: Trust Meter (only in dialogue phase) */}
          <AnimatePresence>
            {isInDialogue && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="hidden md:flex flex-col items-center gap-1 min-w-[200px]"
              >
                <div className="flex items-center gap-2 w-full">
                  <Heart
                    className={`h-4 w-4 shrink-0 ${getTrustColor(trustLevel)}`}
                  />
                  <span
                    className={`text-xs font-medium ${getTrustColor(trustLevel)}`}
                  >
                    {getTrustLabel(trustLevel)}
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {trustLevel}%
                  </span>
                </div>
                <Progress
                  value={trustLevel}
                  className="h-2 bg-slate-700/50 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-amber-500 [&>[data-slot=progress-indicator]]:to-emerald-500"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right section: Score + Hint */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile trust indicator */}
            {isInDialogue && (
              <div className="md:hidden flex items-center gap-1">
                <Heart
                  className={`h-3.5 w-3.5 ${getTrustColor(trustLevel)}`}
                />
                <span
                  className={`text-xs font-bold ${getTrustColor(trustLevel)}`}
                >
                  {trustLevel}%
                </span>
              </div>
            )}

            <Badge
              variant="secondary"
              className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 gap-1 text-xs sm:text-sm px-2 sm:px-2.5"
            >
              <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{totalScore}</span>
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleHint}
              className={`shrink-0 h-8 w-8 sm:h-9 sm:w-9 transition-colors ${
                showHint
                  ? 'text-amber-400 bg-amber-500/20 hover:bg-amber-500/30'
                  : 'text-slate-300 hover:text-amber-400 hover:bg-slate-700/50'
              }`}
              aria-label={showHint ? 'Hide hint' : 'Show hint'}
            >
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Hint Banner */}
        <AnimatePresence>
          {showHint && currentHint && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pb-3 pt-1">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                    {currentHint}
                  </p>
                  <button
                    onClick={hideHint}
                    className="text-amber-400/60 hover:text-amber-300 text-xs ml-auto shrink-0"
                    aria-label="Close hint"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
