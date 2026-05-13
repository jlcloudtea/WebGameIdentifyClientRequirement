'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { getScenarioById } from '@/lib/game-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, LayoutDashboard, Trophy, MessageSquare, Ear, Search, FileText, BookOpen, Lightbulb } from 'lucide-react';
import type { ScoreBreakdown, Badge } from '@/lib/game-types';
import AchievementPopup from './AchievementPopup';

// ============================================================
// Animated Counter Hook
// ============================================================

function useAnimatedCounter(target: number, duration: number = 1200, delay: number = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return count;
}

// ============================================================
// Score Category Config
// ============================================================

interface ScoreCategoryConfig {
  key: keyof ScoreBreakdown;
  label: string;
  icon: React.ReactNode;
  emoji: string;
}

const scoreCategories: ScoreCategoryConfig[] = [
  { key: 'communication', label: 'Communication', icon: <MessageSquare className="h-4 w-4" />, emoji: '💬' },
  { key: 'listening', label: 'Listening', icon: <Ear className="h-4 w-4" />, emoji: '👂' },
  { key: 'questioning', label: 'Questioning', icon: <Search className="h-4 w-4" />, emoji: '🔍' },
  { key: 'documentation', label: 'Documentation', icon: <FileText className="h-4 w-4" />, emoji: '📋' },
  { key: 'guidelines', label: 'Guidelines', icon: <BookOpen className="h-4 w-4" />, emoji: '📜' },
  { key: 'recommendation', label: 'Recommendation', icon: <Lightbulb className="h-4 w-4" />, emoji: '💡' },
];

// ============================================================
// Color Helper
// ============================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-rose-500';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

function getScoreBarTrackColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500/15';
  if (score >= 60) return 'bg-amber-500/15';
  return 'bg-rose-500/15';
}

function getSatisfactionEmoji(value: number): string {
  if (value >= 90) return '🤩';
  if (value >= 80) return '😊';
  if (value >= 60) return '🙂';
  if (value >= 40) return '😐';
  return '😟';
}

// ============================================================
// Confetti Particle Component
// ============================================================

function ConfettiParticle({ delay, color, left }: { delay: number; color: string; left: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color, left }}
      initial={{ y: -20, opacity: 0, scale: 0 }}
      animate={{
        y: [0, 120, 240],
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0.5],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2.5,
        delay,
        ease: 'easeOut',
        repeat: Infinity,
        repeatDelay: Math.random() * 3,
      }}
    />
  );
}

// ============================================================
// Confetti Celebration
// ============================================================

function ConfettiCelebration() {
  const colors = ['#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    left: `${Math.random() * 100}%`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} color={p.color} left={p.left} />
      ))}
    </div>
  );
}

// ============================================================
// Animated Score Bar
// ============================================================

function AnimatedScoreBar({
  score,
  label,
  emoji,
  icon,
  delay,
}: {
  score: number;
  label: string;
  emoji: string;
  icon: React.ReactNode;
  delay: number;
}) {
  const animatedScore = useAnimatedCounter(score, 1000, delay);
  const barColor = getScoreBarColor(score);
  const trackColor = getScoreBarTrackColor(score);
  const textColor = getScoreColor(score);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base" role="img" aria-hidden="true">{emoji}</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
        </div>
        <span className={`text-sm font-bold ${textColor}`}>{animatedScore}%</span>
      </div>
      <div className={`h-3 w-full rounded-full overflow-hidden ${trackColor}`}>
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// ============================================================
// Stat Card
// ============================================================

function StatCard({
  label,
  value,
  emoji,
  delay,
}: {
  label: string;
  value: number;
  emoji: string;
  delay: number;
}) {
  const animatedValue = useAnimatedCounter(value, 1000, delay);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="text-center p-3 sm:p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl" role="img" aria-hidden="true">{emoji}</span>
          <span className={`text-lg sm:text-xl font-bold ${getScoreColor(value)}`}>
            {animatedValue}%
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
            {label}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Badge Card
// ============================================================

function BadgeRevealCard({ badge, delay }: { badge: Badge; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
    >
      <Card className="overflow-hidden border-amber-300 dark:border-amber-600/50 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 shadow-md">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col items-center gap-2 text-center">
            {/* Glow effect */}
            <div className="relative">
              <motion.span
                className="text-5xl sm:text-6xl block"
                role="img"
                aria-label={badge.name}
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {badge.icon}
              </motion.span>
              {/* Sparkle ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(245,158,11,0)',
                    '0 0 20px rgba(245,158,11,0.4)',
                    '0 0 0px rgba(245,158,11,0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400">
                {badge.name}
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-300/70 mt-0.5">
                {badge.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Circular Progress (Overall Score)
// ============================================================

function CircularScore({ score, delay }: { score: number; delay: number }) {
  const animatedScore = useAnimatedCounter(score, 1500, delay);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress */}
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className={color}
          style={{
            strokeDasharray: circumference,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ delay: delay + 0.3, duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-4xl sm:text-5xl font-bold ${color}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.5, type: 'spring', stiffness: 150 }}
        >
          {animatedScore}%
        </motion.span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          Overall
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Main ScenarioSummary Component
// ============================================================

export default function ScenarioSummary() {
  const {
    currentScenarioId,
    scenarioResults,
    earnedBadges,
    showAchievement,
    resetCurrentScenario,
    setPhase,
  } = useGameStore();

  const [showConfetti, setShowConfetti] = useState(false);

  const scenario = currentScenarioId
    ? getScenarioById(currentScenarioId)
    : undefined;

  const result = currentScenarioId
    ? scenarioResults[currentScenarioId]
    : undefined;

  // Trigger confetti for high scores
  useEffect(() => {
    if (result && result.score.total >= 80) {
      const timer = setTimeout(() => setShowConfetti(true), 800);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!scenario || !result) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500 dark:text-slate-400">No scenario results available.</p>
      </div>
    );
  }

  const totalScore = result.score.total;
  const isNewBadges = result.badges.length > 0;

  // Find badges that were earned for this scenario
  const scenarioBadges = earnedBadges.filter((badge) =>
    result.badges.some((rb) => rb.id === badge.id)
  );

  // If no badges in result but showAchievement is set, display it
  const displayBadges = scenarioBadges.length > 0
    ? scenarioBadges
    : showAchievement
      ? [showAchievement]
      : [];

  const handleRetry = () => {
    resetCurrentScenario();
  };

  const handleDashboard = () => {
    useGameStore.setState({ currentScenarioId: null });
    setPhase('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 relative">
      {/* Confetti for high scores */}
      {showConfetti && <ConfettiCelebration />}

      {/* Achievement Popup */}
      <AchievementPopup />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.span
            className="text-4xl sm:text-5xl block mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            role="img"
            aria-hidden="true"
          >
            {totalScore >= 80 ? '🎉' : totalScore >= 60 ? '👏' : '💪'}
          </motion.span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            {totalScore >= 80 ? 'Mission Complete!' : totalScore >= 60 ? 'Mission Finished!' : 'Mission Attempted!'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {scenario.title} &mdash; Attempt #{result.attempts}
          </p>
        </motion.div>

        {/* Overall Score Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <CircularScore score={totalScore} delay={0.3} />
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Score Breakdown
          </h2>
          <Card className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {scoreCategories.map((cat, index) => (
                <AnimatedScoreBar
                  key={cat.key}
                  score={result.score[cat.key]}
                  label={cat.label}
                  emoji={cat.emoji}
                  icon={cat.icon}
                  delay={0.6 + index * 0.1}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.4 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Client Satisfaction"
              value={result.clientSatisfaction}
              emoji={getSatisfactionEmoji(result.clientSatisfaction)}
              delay={1.4}
            />
            <StatCard
              label="Professionalism"
              value={result.professionalismScore}
              emoji="👔"
              delay={1.5}
            />
            <StatCard
              label="Communication"
              value={result.communicationScore}
              emoji="💬"
              delay={1.6}
            />
            <StatCard
              label="Accuracy"
              value={result.accuracyScore}
              emoji="🎯"
              delay={1.7}
            />
          </div>
        </motion.div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            Feedback
          </h2>
          <Card className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <ul className="space-y-3">
                {result.feedback.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.9 + index * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges Earned */}
        <AnimatePresence>
          {displayBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 2.2, duration: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                🏅 New Badge Earned!
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayBadges.map((badge, index) => (
                  <BadgeRevealCard
                    key={badge.id}
                    badge={badge}
                    delay={2.3 + index * 0.2}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: displayBadges.length > 0 ? 2.8 : 2.2, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <Button
            variant="outline"
            onClick={handleRetry}
            className="flex-1 gap-2 border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            size="lg"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Mission
          </Button>
          <Button
            onClick={handleDashboard}
            className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md"
            size="lg"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
