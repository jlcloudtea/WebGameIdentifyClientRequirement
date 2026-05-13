'use client';

import { useGameStore } from '@/lib/game-store';
import { getScenarioById } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle2, BookOpen, Target, User, Building2, MessageSquare } from 'lucide-react';
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

const colorThemes: Record<
  string,
  { gradient: string; border: string; headerBg: string; buttonBg: string; buttonHover: string; accent: string }
> = {
  amber: {
    gradient: 'from-amber-500/10 via-amber-400/5 to-transparent',
    border: 'border-amber-500/30',
    headerBg: 'bg-amber-500/10',
    buttonBg: 'bg-amber-500',
    buttonHover: 'hover:bg-amber-600',
    accent: 'text-amber-500',
  },
  rose: {
    gradient: 'from-rose-500/10 via-rose-400/5 to-transparent',
    border: 'border-rose-500/30',
    headerBg: 'bg-rose-500/10',
    buttonBg: 'bg-rose-500',
    buttonHover: 'hover:bg-rose-600',
    accent: 'text-rose-500',
  },
  teal: {
    gradient: 'from-teal-500/10 via-teal-400/5 to-transparent',
    border: 'border-teal-500/30',
    headerBg: 'bg-teal-500/10',
    buttonBg: 'bg-teal-500',
    buttonHover: 'hover:bg-teal-600',
    accent: 'text-teal-500',
  },
  violet: {
    gradient: 'from-violet-500/10 via-violet-400/5 to-transparent',
    border: 'border-violet-500/30',
    headerBg: 'bg-violet-500/10',
    buttonBg: 'bg-violet-500',
    buttonHover: 'hover:bg-violet-600',
    accent: 'text-violet-500',
  },
  sky: {
    gradient: 'from-sky-500/10 via-sky-400/5 to-transparent',
    border: 'border-sky-500/30',
    headerBg: 'bg-sky-500/10',
    buttonBg: 'bg-sky-500',
    buttonHover: 'hover:bg-sky-600',
    accent: 'text-sky-500',
  },
};

export default function ScenarioIntro() {
  const { currentScenarioId, setPhase, startScenario } = useGameStore();

  const scenario = currentScenarioId
    ? getScenarioById(currentScenarioId)
    : undefined;

  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500">No scenario selected.</p>
      </div>
    );
  }

  const diffConfig = difficultyConfig[scenario.difficulty];
  const theme = colorThemes[scenario.color] || colorThemes.amber;

  const handleBegin = () => {
    setPhase('dialogue');
  };

  const handleBack = () => {
    setPhase('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        <Card
          className={`overflow-hidden border ${theme.border} bg-white dark:bg-slate-800/90 shadow-xl`}
        >
          {/* Header with gradient */}
          <div
            className={`bg-gradient-to-r ${theme.gradient} ${theme.headerBg} px-6 sm:px-8 pt-6 sm:pt-8 pb-4`}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              {/* Client Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="text-6xl sm:text-7xl mb-3"
                role="img"
                aria-label={`Client avatar: ${scenario.client.name}`}
              >
                {scenario.client.avatar}
              </motion.div>

              {/* Client Info */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <User className="h-4 w-4 text-slate-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {scenario.client.name}
                </h2>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>
                  {scenario.client.role}, {scenario.client.organization}
                </span>
              </div>

              {/* Difficulty Badge */}
              <div className="mt-3 flex items-center justify-center">
                <Badge
                  className={`${diffConfig.bgColor} ${diffConfig.textColor} ${diffConfig.borderColor} border`}
                >
                  {diffConfig.label} Mission
                </Badge>
              </div>
            </motion.div>
          </div>

          <CardContent className="px-6 sm:px-8 py-5 sm:py-6 space-y-5">
            {/* Client Personality */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className={`h-4 w-4 mt-0.5 shrink-0 ${theme.accent}`} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Client Personality
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {scenario.client.personality}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Scenario Description */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-2">
                <BookOpen className={`h-4 w-4 mt-0.5 shrink-0 ${theme.accent}`} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Mission Briefing
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Learning Objectives */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex items-start gap-2">
                <Target className={`h-4 w-4 mt-0.5 shrink-0 ${theme.accent}`} />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Learning Objectives
                  </h3>
                  <ul className="space-y-2">
                    {scenario.learningObjectives.map((objective, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.06 }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {objective}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Key Concepts */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Key Concepts You Will Practice
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {scenario.keyConcepts.map((concept, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.65 + index * 0.04 }}
                  >
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                    >
                      {concept}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Budget hint */}
            {scenario.client.budget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/40 rounded-lg px-3 py-2"
              >
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  💡 <strong>Tip:</strong> The client has a budget of{' '}
                  <strong>{scenario.client.budget}</strong>. Keep this in mind
                  when making recommendations!
                </p>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="px-6 sm:px-8 pb-6 pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={handleBegin}
              className={`w-full sm:flex-1 ${theme.buttonBg} ${theme.buttonHover} text-white shadow-md gap-1.5 text-sm font-semibold`}
              size="lg"
            >
              <Play className="h-4 w-4" />
              Begin Meeting
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
