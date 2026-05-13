'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { getScenarioById } from '@/lib/game-data';
import type { GuidelineScenario } from '@/lib/game-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuidelinesChallenge() {
  const {
    currentScenarioId,
    guidelinesState,
    answerGuideline,
    nextGuideline,
    completeGuidelines,
    setPhase,
  } = useGameStore();

  const scenario = currentScenarioId
    ? getScenarioById(currentScenarioId)
    : undefined;

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);

  const guidelines = scenario?.guidelines ?? [];
  const currentIndex = guidelinesState.currentGuidelineIndex;
  const currentGuideline: GuidelineScenario | undefined = guidelines[currentIndex];

  const isLastGuideline = currentIndex >= guidelines.length - 1;

  const handleSelectAnswer = (optionId: string) => {
    if (showFeedback) return;
    setSelectedAnswer(optionId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer || !currentGuideline) return;
    answerGuideline(currentGuideline.id, selectedAnswer);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (isLastGuideline) {
      // All guidelines done - compute final score
      let totalPossible = 0;
      let totalEarned = 0;
      for (const g of guidelines) {
        const bestOption = g.options.reduce((best, opt) => {
          if (opt.followsGuidelines && opt.score > best.score) return opt;
          return best;
        }, g.options[0]);
        totalPossible += Math.max(bestOption.score, 1);
      }
      for (const [gId, aId] of Object.entries(guidelinesState.answers)) {
        const g = guidelines.find((gl) => gl.id === gId);
        if (g) {
          const opt = g.options.find((o) => o.id === aId);
          if (opt) totalEarned += opt.score;
        }
      }
      const finalScore = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
      completeGuidelines(finalScore);
      setCompleted(true);
    } else {
      // Advance to next guideline
      nextGuideline();
    }

    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const getOptionResult = (option: GuidelineScenario['options'][0]) => {
    if (!showFeedback) return null;
    const selectedOpt = currentGuideline?.options.find(
      (o) => o.id === selectedAnswer
    );
    const isThisSelected = option.id === selectedAnswer;
    const isCorrect = option.id === currentGuideline?.correctAnswer;

    if (isCorrect) return 'correct';
    if (isThisSelected && !isCorrect) return 'wrong';
    if (option.followsGuidelines) return 'follows';
    return 'neutral';
  };

  const getOptionBorderClass = (option: GuidelineScenario['options'][0]) => {
    const result = getOptionResult(option);
    if (!result) return 'border-slate-200 dark:border-slate-700 hover:border-amber-300';
    switch (result) {
      case 'correct':
        return 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30';
      case 'wrong':
        return 'border-red-400 bg-red-50/80 dark:bg-red-950/30';
      case 'follows':
        return 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/15';
      default:
        return 'border-slate-200 dark:border-slate-700 opacity-60';
    }
  };

  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No scenario loaded.</p>
      </div>
    );
  }

  // Completed state - show final results
  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto px-4 py-6"
      >
        <Card className="border-2 border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              📊 Guidelines Challenge Complete!
            </CardTitle>
            <CardDescription>
              Here&apos;s how you performed following organisational policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Summary of answers */}
            <div className="space-y-3">
              {guidelines.map((g, idx) => {
                const answerId = guidelinesState.answers[g.id];
                const chosen = g.options.find((o) => o.id === answerId);
                const correct = g.options.find(
                  (o) => o.id === g.correctAnswer
                );
                const isCorrect = answerId === g.correctAnswer;

                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      isCorrect
                        ? 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20'
                        : 'border-red-300 bg-red-50/60 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{g.title}</p>
                        {!isCorrect && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Your answer: {chosen?.text}
                          </p>
                        )}
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                          Best answer: {correct?.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Separator />

            {/* Score */}
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                Guidelines Score
              </div>
              <div className="text-5xl font-bold text-amber-600">
                {guidelinesState.score}
              </div>
              <Badge
                variant="secondary"
                className={
                  guidelinesState.score >= 80
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : guidelinesState.score >= 50
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                }
              >
                {guidelinesState.score >= 80
                  ? 'Policy Expert!'
                  : guidelinesState.score >= 50
                    ? 'Getting There!'
                    : 'Review the Policies'}
              </Badge>
            </div>

            <Separator />

            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                onClick={() => setPhase('documentation')}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8"
              >
                Continue to Documentation
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Active guideline question
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 py-6 space-y-5"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 text-3xl"
        >
          📜
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Organisational Guidelines
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Follow the rules! Make decisions that comply with policies.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {guidelines.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx < currentIndex
                ? 'bg-emerald-500 w-8'
                : idx === currentIndex
                  ? 'bg-amber-500 w-10'
                  : 'bg-slate-200 dark:bg-slate-700 w-6'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-2">
          {currentIndex + 1} / {guidelines.length}
        </span>
      </div>

      {currentGuideline && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGuideline.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            {/* Policy card */}
            <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/25">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                      Policy
                    </p>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100 leading-relaxed">
                      &ldquo;{currentGuideline.policy}&rdquo;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Situation */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{currentGuideline.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentGuideline.description}
                </p>
              </CardContent>
            </Card>

            {/* What should you do? */}
            <div>
              <p className="text-sm font-semibold mb-3 text-foreground">
                What should you do?
              </p>
              <div className="space-y-2.5">
                {currentGuideline.options.map((option, optIdx) => {
                  const result = getOptionResult(option);
                  const isSelected = selectedAnswer === option.id;
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: optIdx * 0.08 }}
                      onClick={() => handleSelectAnswer(option.id)}
                      disabled={showFeedback}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${getOptionBorderClass(option)} ${
                        !showFeedback && isSelected
                          ? 'ring-2 ring-amber-400 shadow-md'
                          : ''
                      } ${
                        !showFeedback
                          ? 'cursor-pointer active:scale-[0.98]'
                          : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected && !showFeedback
                              ? 'bg-amber-500 text-white'
                              : result === 'correct'
                                ? 'bg-emerald-500 text-white'
                                : result === 'wrong'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {result === 'correct' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : result === 'wrong' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            letter
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug">
                            {option.text}
                          </p>
                          {/* Badges after answering */}
                          {showFeedback && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2"
                            >
                              {option.followsGuidelines ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-700 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Follows Policy
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-700 text-xs">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Violates Policy
                                </Badge>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Feedback after answering */}
            <AnimatePresence>
              {showFeedback && selectedAnswer && currentGuideline && (() => {
                const chosen = currentGuideline.options.find(
                  (o) => o.id === selectedAnswer
                );
                const isCorrect = selectedAnswer === currentGuideline.correctAnswer;
                if (!chosen) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20'
                          : 'border-red-300 bg-red-50/60 dark:bg-red-950/20'
                      }`}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p
                              className={`font-semibold text-sm ${
                                isCorrect
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-amber-700 dark:text-amber-400'
                              }`}
                            >
                              {isCorrect
                                ? 'Correct! You followed the policy.'
                                : 'Not quite — this doesn\'t follow the policy correctly.'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {chosen.feedback}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex justify-center gap-3 pt-2">
              {!showFeedback ? (
                <Button
                  size="lg"
                  onClick={handleConfirmAnswer}
                  disabled={!selectedAnswer}
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 disabled:opacity-50"
                >
                  Confirm Answer
                  <ChevronRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8"
                >
                  {isLastGuideline ? 'See Results' : 'Next Guideline'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
