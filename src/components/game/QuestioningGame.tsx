'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/lib/game-store';
import { getScenarioById } from '@/lib/game-data';
import type { QuestionChallenge, QuestionType } from '@/lib/game-types';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Award,
  MessageCircle,
} from 'lucide-react';

// ============================================================
// Question type configuration
// ============================================================

interface QuestionTypeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const QUESTION_TYPES: Record<QuestionType, QuestionTypeConfig> = {
  open: { label: 'Open Question', color: '🟢', bgColor: 'bg-green-50', borderColor: 'border-green-300', textColor: 'text-green-700' },
  closed: { label: 'Closed Question', color: '🔵', bgColor: 'bg-blue-50', borderColor: 'border-blue-300', textColor: 'text-blue-700' },
  clarification: { label: 'Clarification', color: '🟡', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300', textColor: 'text-yellow-700' },
  probing: { label: 'Probing', color: '🟠', bgColor: 'bg-orange-50', borderColor: 'border-orange-300', textColor: 'text-orange-700' },
  strategic: { label: 'Strategic', color: '🟣', bgColor: 'bg-purple-50', borderColor: 'border-purple-300', textColor: 'text-purple-700' },
  planning: { label: 'Planning', color: '🔵', bgColor: 'bg-teal-50', borderColor: 'border-teal-300', textColor: 'text-teal-700' },
  divergent: { label: 'Divergent', color: '🔵', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-300', textColor: 'text-cyan-700' },
  poor: { label: 'Poor Choice', color: '🔴', bgColor: 'bg-red-50', borderColor: 'border-red-300', textColor: 'text-red-700' },
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

// ============================================================
// QuestioningGame Component
// ============================================================

export default function QuestioningGame() {
  const { currentScenarioId, answerQuestion, completeQuestioning, setPhase } = useGameStore();

  const scenario = useMemo(
    () => (currentScenarioId ? getScenarioById(currentScenarioId) : undefined),
    [currentScenarioId],
  );

  const challenges: QuestionChallenge[] = scenario?.questionChallenges ?? [];

  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // challengeId -> answerId
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentChallenge = challenges[currentIndex] ?? null;
  const totalChallenges = challenges.length;
  const progressPercent = totalChallenges > 0 ? ((currentIndex) / totalChallenges) * 100 : 0;

  // ============================================================
  // Handlers
  // ============================================================

  const handleSelectAnswer = (answerId: string) => {
    if (isRevealed || !currentChallenge) return;
    setSelectedAnswerId(answerId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswerId || !currentChallenge) return;

    setIsRevealed(true);
    setAnswers((prev) => ({ ...prev, [currentChallenge.id]: selectedAnswerId }));
    answerQuestion(currentChallenge.id, selectedAnswerId);
  };

  const handleNextQuestion = () => {
    if (currentIndex >= totalChallenges - 1) {
      // All questions answered - calculate score
      let correctCount = 0;
      challenges.forEach((challenge) => {
        const userAnswer = answers[challenge.id];
        if (userAnswer === challenge.correctAnswer) {
          correctCount++;
        }
      });
      const normalizedScore = Math.round((correctCount / totalChallenges) * 100);
      setScore(normalizedScore);
      setShowResults(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setIsRevealed(false);
    }
  };

  const handleContinue = () => {
    completeQuestioning(score);
    setPhase('guidelines');
  };

  // ============================================================
  // Helper: check if answer is correct
  // ============================================================

  const isAnswerCorrect = (challengeId: string, answerId: string): boolean => {
    const challenge = challenges.find((c) => c.id === challengeId);
    return challenge?.correctAnswer === answerId;
  };

  const isAnswerBest = (challengeId: string, answerId: string): boolean => {
    const challenge = challenges.find((c) => c.id === challengeId);
    const option = challenge?.options.find((o) => o.id === answerId);
    return option?.isBest ?? false;
  };

  if (!scenario) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">No scenario selected.</p>
      </div>
    );
  }

  // ============================================================
  // Results Screen
  // ============================================================

  if (showResults) {
    const correctCount = challenges.filter((c) => answers[c.id] === c.correctAnswer).length;

    return (
      <div className="mx-auto max-w-2xl p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
                  <Award className="h-6 w-6 text-violet-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-violet-900">
                    🔍 Questioning Skills Results
                  </CardTitle>
                  <p className="text-sm text-violet-700">
                    Let&apos;s see how well you identified the best question types!
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {/* Score circle */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-violet-300 bg-white"
                    >
                      <span className="text-3xl font-bold text-violet-700">{score}</span>
                    </motion.div>
                    <p className="mt-1 text-xs font-medium text-violet-600">out of 100</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-violet-800">
                      {score >= 90
                        ? '🌟 Exceptional! You have mastered questioning techniques!'
                        : score >= 70
                          ? '👍 Well done! You understand most question types.'
                          : score >= 50
                            ? '📝 Good effort. Review the different question types to improve.'
                            : '💪 Keep practicing! Understanding question types is a key consulting skill.'}
                    </p>
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-violet-700">{correctCount} correct</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                        <span className="text-violet-700">
                          {totalChallenges - correctCount} incorrect
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer review */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-violet-900">Answer Review</h4>
                  {challenges.map((challenge, idx) => {
                    const userAnswer = answers[challenge.id];
                    const wasCorrect = userAnswer === challenge.correctAnswer;
                    const selectedOption = challenge.options.find((o) => o.id === userAnswer);
                    const correctOption = challenge.options.find((o) => o.id === challenge.correctAnswer);

                    return (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className={`
                          rounded-lg border-2 p-3 text-sm
                          ${wasCorrect
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-red-200 bg-red-50/50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-2">
                          {wasCorrect ? (
                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">
                              Q{idx + 1}: {challenge.situation}
                            </p>
                            {!wasCorrect && (
                              <p className="mt-1 text-xs text-red-700">
                                Your answer: &quot;{selectedOption?.text}&quot;
                              </p>
                            )}
                            <p className="mt-1 text-xs text-green-700">
                              Best answer: &quot;{correctOption?.text}&quot;
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Continue button */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleContinue}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    Continue to Guidelines
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // Question Screen
  // ============================================================

  if (!currentChallenge) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">No questions available for this scenario.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
                <HelpCircle className="h-6 w-6 text-violet-700" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-violet-900">
                  🔍 Questioning Skills Challenge
                </CardTitle>
                <p className="text-sm text-violet-700">
                  Identify the best question type for each situation
                </p>
              </div>
              <Badge className="bg-violet-100 text-violet-800">
                Question {currentIndex + 1} of {totalChallenges}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-violet-600">
                <span>Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress
                value={progressPercent}
                className="h-2 bg-violet-200 [&>[data-slot=progress-indicator]]:bg-violet-500"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Situation */}
      <motion.div
        key={`situation-${currentChallenge.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-slate-500" />
              <CardTitle className="text-base text-slate-700">Situation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-base leading-relaxed text-slate-800 italic">
                &quot;{currentChallenge.situation}&quot;
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Options */}
      <motion.div
        key={`options-${currentChallenge.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Choose the best response:
        </h3>
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {currentChallenge.options.map((option, idx) => {
              const letter = OPTION_LETTERS[idx];
              const typeConfig = QUESTION_TYPES[option.type];
              const isSelected = selectedAnswerId === option.id;
              const isCorrectOption = option.id === currentChallenge.correctAnswer;

              // Determine styling based on state
              let optionBorderClass = 'border-slate-200';
              let optionBgClass = 'bg-white';
              let letterBgClass = 'bg-slate-100 text-slate-700';

              if (isSelected && !isRevealed) {
                optionBorderClass = 'border-violet-400 ring-2 ring-violet-300 ring-offset-1';
                optionBgClass = 'bg-violet-50';
                letterBgClass = 'bg-violet-500 text-white';
              }

              if (isRevealed) {
                if (isCorrectOption) {
                  optionBorderClass = 'border-green-400';
                  optionBgClass = 'bg-green-50';
                  letterBgClass = 'bg-green-500 text-white';
                } else if (isSelected && !isCorrectOption) {
                  optionBorderClass = 'border-red-400';
                  optionBgClass = 'bg-red-50';
                  letterBgClass = 'bg-red-500 text-white';
                } else {
                  optionBorderClass = 'border-slate-200';
                  optionBgClass = 'bg-slate-50/50';
                  letterBgClass = 'bg-slate-200 text-slate-500';
                }
              }

              return (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectAnswer(option.id)}
                  disabled={isRevealed}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  whileHover={!isRevealed ? { scale: 1.01, x: 4 } : {}}
                  whileTap={!isRevealed ? { scale: 0.99 } : {}}
                  className={`
                    w-full rounded-xl border-2 p-4 text-left transition-all
                    ${optionBorderClass} ${optionBgClass}
                    ${!isRevealed ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Letter badge */}
                    <div
                      className={`
                        flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg
                        text-sm font-bold transition-colors
                        ${letterBgClass}
                      `}
                    >
                      {isRevealed && isCorrectOption ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isRevealed && isSelected && !isCorrectOption ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        letter
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <p className="text-sm leading-snug text-slate-800">{option.text}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`
                            text-[10px] px-1.5 py-0
                            ${typeConfig.bgColor} ${typeConfig.textColor} ${typeConfig.borderColor} border
                          `}
                        >
                          {typeConfig.color} {typeConfig.label}
                        </Badge>
                        {option.isBest && isRevealed && (
                          <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">
                            ★ Best Answer
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {isRevealed && selectedAnswerId && currentChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {(() => {
              const selectedOption = currentChallenge.options.find(
                (o) => o.id === selectedAnswerId,
              );
              const isCorrect = selectedAnswerId === currentChallenge.correctAnswer;

              return (
                <Card
                  className={`
                    border-2
                    ${isCorrect
                      ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                      : 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50'
                    }
                  `}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                      )}
                      <div>
                        <p
                          className={`font-semibold text-sm ${
                            isCorrect ? 'text-green-800' : 'text-red-800'
                          }`}
                        >
                          {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {selectedOption?.feedback}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        {!isRevealed ? (
          <Button
            onClick={handleConfirmAnswer}
            disabled={!selectedAnswerId}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Confirm Answer
            <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {currentIndex >= totalChallenges - 1 ? 'See Results' : 'Next Question'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
