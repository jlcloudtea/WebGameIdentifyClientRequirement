'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { ALL_SCENARIOS, ALL_BADGES } from '@/lib/game-data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, RotateCcw, Play, Trophy, Star, Sparkles } from 'lucide-react';
import type { Difficulty } from '@/lib/game-types';

const difficultyConfig: Record<
  Difficulty,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  beginner: {
    label: 'Beginner',
    bgColor: 'bg-emerald-500/15',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
  },
  intermediate: {
    label: 'Intermediate',
    bgColor: 'bg-amber-500/15',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
  },
  advanced: {
    label: 'Advanced',
    bgColor: 'bg-rose-500/15',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
  },
};

const colorAccents: Record<
  string,
  { border: string; shadow: string; glow: string; bgGradient: string }
> = {
  amber: {
    border: 'border-amber-500/40',
    shadow: 'hover:shadow-amber-500/20',
    glow: 'group-hover:ring-amber-500/30',
    bgGradient: 'from-amber-500/10 to-amber-600/5',
  },
  rose: {
    border: 'border-rose-500/40',
    shadow: 'hover:shadow-rose-500/20',
    glow: 'group-hover:ring-rose-500/30',
    bgGradient: 'from-rose-500/10 to-rose-600/5',
  },
  teal: {
    border: 'border-teal-500/40',
    shadow: 'hover:shadow-teal-500/20',
    glow: 'group-hover:ring-teal-500/30',
    bgGradient: 'from-teal-500/10 to-teal-600/5',
  },
  violet: {
    border: 'border-violet-500/40',
    shadow: 'hover:shadow-violet-500/20',
    glow: 'group-hover:ring-violet-500/30',
    bgGradient: 'from-violet-500/10 to-violet-600/5',
  },
  sky: {
    border: 'border-sky-500/40',
    shadow: 'hover:shadow-sky-500/20',
    glow: 'group-hover:ring-sky-500/30',
    bgGradient: 'from-sky-500/10 to-sky-600/5',
  },
};

export default function GameDashboard() {
  const {
    playerName,
    setPlayerName,
    completedScenarios,
    scenarioResults,
    earnedBadges,
    startScenario,
    getTotalScore,
    resetGame,
  } = useGameStore();

  const [nameInput, setNameInput] = useState(playerName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const totalScore = getTotalScore();
  const earnedBadgeIds = earnedBadges.map((b) => b.id);

  const handleNameSubmit = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setPlayerName(trimmed);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  const handleStartScenario = (scenarioId: string) => {
    startScenario(scenarioId);
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetGame();
      setNameInput('');
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent mb-2">
            🎮 Junior IT Consultant Adventure
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Build your IT consulting skills by helping clients identify their
            requirements. Each mission teaches real-world skills!
          </p>

          {/* Player Name Input */}
          {!playerName ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex items-center justify-center gap-2 max-w-sm mx-auto"
            >
              <Input
                type="text"
                placeholder="Enter your name, consultant!"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleNameKeyDown}
                className="bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-600 focus-visible:ring-amber-400 text-center"
                maxLength={20}
                aria-label="Player name"
              />
              <Button
                onClick={handleNameSubmit}
                disabled={!nameInput.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
              >
                Start
              </Button>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-amber-600 dark:text-amber-400 font-medium"
            >
              Welcome, <span className="font-bold">{playerName}</span>! Ready
              for your next mission?
            </motion.p>
          )}
        </motion.div>

        {/* Total Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl px-5 py-3 shadow-md border border-amber-200 dark:border-amber-700/50 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Score
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {totalScore}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl px-5 py-3 shadow-md border border-emerald-200 dark:border-emerald-700/50 flex items-center gap-3">
            <Star className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Missions Complete
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {completedScenarios.length}/{ALL_SCENARIOS.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Choose Your Mission */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 text-center">
            🗺️ Choose Your Mission
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
            Select a client scenario to begin your consultation
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {ALL_SCENARIOS.map((scenario) => {
              const isCompleted = completedScenarios.includes(scenario.id);
              const result = scenarioResults[scenario.id];
              const diffConfig = difficultyConfig[scenario.difficulty];
              const accent = colorAccents[scenario.color] || colorAccents.amber;

              return (
                <motion.div key={scenario.id} variants={itemVariants}>
                  <Card
                    className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${accent.shadow} cursor-pointer border ${accent.border} bg-white dark:bg-slate-800/80`}
                    onClick={() => handleStartScenario(scenario.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStartScenario(scenario.id);
                      }
                    }}
                    aria-label={`Start scenario: ${scenario.title}`}
                  >
                    {/* Color accent gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${accent.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    />

                    <CardHeader className="pb-2 relative">
                      <div className="flex items-start justify-between">
                        <span
                          className="text-4xl sm:text-5xl block"
                          role="img"
                          aria-hidden="true"
                        >
                          {scenario.icon}
                        </span>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge
                            className={`${diffConfig.bgColor} ${diffConfig.textColor} ${diffConfig.borderColor} border text-[10px] sm:text-xs`}
                          >
                            {diffConfig.label}
                          </Badge>
                          {isCompleted && (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border text-[10px] sm:text-xs gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Done
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3 relative">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-0.5">
                        {scenario.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2">
                        {scenario.subtitle}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {scenario.description}
                      </p>
                      {isCompleted && result && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 rounded-full px-2.5 py-1">
                            <Trophy className="h-3 w-3 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                              {result.score.total} pts
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0 pb-4 relative">
                      <Button
                        className={`w-full text-sm font-medium transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                            : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                        }`}
                        size="sm"
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                            Replay Mission
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 mr-1.5" />
                            Start Mission
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Earned Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Achievements
            </h2>
            <Badge
              variant="secondary"
              className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs"
            >
              {earnedBadges.length}/{ALL_BADGES.length}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {ALL_BADGES.map((badge) => {
              const isEarned = earnedBadgeIds.includes(badge.id);

              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: isEarned ? 1.05 : 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <Card
                    className={`text-center p-3 sm:p-4 transition-all ${
                      isEarned
                        ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-600/50 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 opacity-50 grayscale'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span
                        className="text-2xl sm:text-3xl"
                        role="img"
                        aria-hidden="true"
                      >
                        {isEarned ? badge.icon : '🔒'}
                      </span>
                      <p
                        className={`text-xs sm:text-sm font-semibold leading-tight ${
                          isEarned
                            ? 'text-slate-800 dark:text-slate-100'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {badge.name}
                      </p>
                      {isEarned ? (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug hidden sm:block">
                          {badge.description}
                        </p>
                      ) : (
                        <div className="flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
                          <Lock className="h-2.5 w-2.5" />
                          <span className="text-[10px]">Locked</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Reset Progress Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 text-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className={`text-slate-400 hover:text-rose-500 transition-colors text-xs gap-1.5 ${
              showResetConfirm
                ? 'bg-rose-500/10 text-rose-500 hover:text-rose-600 hover:bg-rose-500/20'
                : ''
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {showResetConfirm
              ? 'Click again to confirm reset'
              : 'Reset Progress'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
