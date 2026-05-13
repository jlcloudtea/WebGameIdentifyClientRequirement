'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { getScenarioById } from '@/lib/game-data';
import type { Solution } from '@/lib/game-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  DollarSign,
  Shield,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SuitabilityStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-300 dark:text-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

function SupportLevelBadge({ level }: { level: Solution['supportLevel'] }) {
  const config = {
    basic: {
      label: 'Basic',
      className:
        'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
    },
    standard: {
      label: 'Standard',
      className:
        'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-700',
    },
    premium: {
      label: 'Premium',
      className:
        'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700',
    },
  };
  const c = config[level];
  return (
    <Badge className={`text-xs ${c.className}`}>
      <Shield className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  );
}

function CriterionCheck({
  label,
  meets,
}: {
  label: string;
  meets: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {meets ? (
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
      )}
      <span className={meets ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
        {meets ? label : `No ${label}`}
      </span>
    </div>
  );
}

export default function RecommendationEngine() {
  const {
    currentScenarioId,
    recommendationState,
    selectSolution,
    completeRecommendation,
    completeScenario,
  } = useGameStore();

  const scenario = currentScenarioId
    ? getScenarioById(currentScenarioId)
    : undefined;

  const [submitted, setSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [earnedScore, setEarnedScore] = useState(0);

  const solutions = scenario?.solutions ?? [];
  const selectedId = recommendationState.selectedSolutionId;

  const handleSelect = (solutionId: string) => {
    if (submitted) return;
    selectSolution(solutionId);
  };

  const handleSubmit = () => {
    if (!selectedId || !scenario) return;

    const chosen = solutions.find((s) => s.id === selectedId);
    if (!chosen) return;

    // Count how many criteria are met
    let criteriaMet = 0;
    if (chosen.meetsRequirements) criteriaMet++;
    if (chosen.meetsBudget) criteriaMet++;
    if (chosen.followsPolicy) criteriaMet++;

    // Score based on criteria
    let score = 10;
    if (criteriaMet === 3) score = 100;
    else if (criteriaMet === 2) score = 70;
    else if (criteriaMet === 1) score = 40;

    // Build feedback
    const lines: string[] = [];
    lines.push(
      `You recommended: "${chosen.name}" ($${chosen.cost})`
    );

    if (chosen.meetsRequirements && chosen.meetsBudget && chosen.followsPolicy) {
      lines.push(
        'This is the best choice! It meets all requirements, stays within budget, and follows organisational policy.'
      );
    } else {
      if (!chosen.meetsRequirements) {
        lines.push(
          'This solution does not fully meet the client\'s requirements. Consider whether all technical, training, and compatibility needs are addressed.'
        );
      }
      if (!chosen.meetsBudget) {
        lines.push(
          `This solution exceeds the client's budget. While it may have better features, budget compliance is important for client trust and project approval.`
        );
      }
      if (!chosen.followsPolicy) {
        lines.push(
          'This solution does not follow organisational policies. Policy compliance is non-negotiable in professional IT procurement.'
        );
      }
    }

    if (chosen.advantages.length > 0) {
      lines.push(
        `Advantages: ${chosen.advantages.join(', ')}`
      );
    }
    if (chosen.disadvantages.length > 0) {
      lines.push(
        `Disadvantages: ${chosen.disadvantages.join(', ')}`
      );
    }

    // Identify the best solution for comparison
    const bestSolution = solutions.find(
      (s) => s.meetsRequirements && s.meetsBudget && s.followsPolicy
    );
    if (bestSolution && bestSolution.id !== chosen.id) {
      lines.push(
        `Tip: The "${bestSolution.name}" would have been the ideal choice as it meets all criteria.`
      );
    }

    setFeedbackText(lines.join('\n'));
    setEarnedScore(score);
    setSubmitted(true);
    completeRecommendation(score);
  };

  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No scenario loaded.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 text-3xl"
        >
          💡
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Recommendation Engine
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Compare solutions and recommend the best one for your client
        </p>
      </div>

      {/* Solution cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {solutions.map((solution, idx) => {
          const isSelected = selectedId === solution.id;
          const isBest =
            solution.meetsRequirements &&
            solution.meetsBudget &&
            solution.followsPolicy;

          return (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.12, duration: 0.4 }}
            >
              <Card
                className={`relative transition-all duration-200 cursor-pointer h-full flex flex-col ${
                  isSelected
                    ? 'ring-2 ring-amber-400 shadow-lg border-amber-300'
                    : 'hover:border-amber-200 hover:shadow-md'
                } ${submitted && isBest ? 'ring-2 ring-emerald-400 border-emerald-300' : ''}`}
                onClick={() => handleSelect(solution.id)}
              >
                {/* Selected indicator */}
                {isSelected && !submitted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-md z-10"
                  >
                    <CheckCircle className="h-4 w-4 text-white" />
                  </motion.div>
                )}

                {/* Best solution indicator (after submit) */}
                {submitted && isBest && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md z-10"
                  >
                    <Star className="h-4 w-4 text-white fill-white" />
                  </motion.div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{solution.name}</span>
                    <SupportLevelBadge level={solution.supportLevel} />
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-3">
                  {/* Cost */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xl font-bold text-foreground">
                      {solution.cost}
                    </span>
                  </div>

                  {/* Suitability stars */}
                  <div className="flex items-center gap-2">
                    <SuitabilityStars rating={solution.suitability} />
                    <span className="text-xs text-muted-foreground">
                      {solution.suitability}/5
                    </span>
                  </div>

                  {/* Quick criteria checks */}
                  <div className="space-y-1.5 py-1">
                    <CriterionCheck
                      label="Meets Budget"
                      meets={solution.meetsBudget}
                    />
                    <CriterionCheck
                      label="Meets Requirements"
                      meets={solution.meetsRequirements}
                    />
                    <CriterionCheck
                      label="Follows Policy"
                      meets={solution.followsPolicy}
                    />
                  </div>

                  <Separator />

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {solution.description}
                  </p>

                  {/* Expandable details */}
                  <Accordion type="single" collapsible className="mt-auto">
                    <AccordionItem value="details" className="border-b-0">
                      <AccordionTrigger className="py-2 text-xs font-medium text-amber-600 hover:no-underline">
                        Full Details
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="space-y-3">
                          {/* Advantages */}
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                              ✅ Advantages
                            </p>
                            <ul className="space-y-1">
                              {solution.advantages.map((adv, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                                >
                                  <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                  {adv}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Disadvantages */}
                          <div>
                            <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                              ❌ Disadvantages
                            </p>
                            <ul className="space-y-1">
                              {solution.disadvantages.map((dis, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                                >
                                  <XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                                  {dis}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Select button */}
                  {!submitted && (
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`w-full mt-2 ${
                        isSelected
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(solution.id);
                      }}
                    >
                      {isSelected ? '✓ Selected' : 'Select'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex justify-center pt-2"
        >
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedId}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 disabled:opacity-50"
          >
            <Lightbulb className="h-5 w-5" />
            Submit Recommendation
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 150 }}
          >
            <Card
              className={`border-2 ${
                earnedScore >= 80
                  ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : earnedScore >= 50
                    ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-red-300 bg-red-50/50 dark:bg-red-950/20'
              }`}
            >
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  {earnedScore >= 80 ? (
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  ) : earnedScore >= 50 ? (
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  Recommendation Evaluation
                </CardTitle>
                <CardDescription>
                  Here&apos;s how your recommendation performed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Score display */}
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Recommendation Score
                  </div>
                  <div
                    className={`text-5xl font-bold ${
                      earnedScore >= 80
                        ? 'text-emerald-600'
                        : earnedScore >= 50
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  >
                    {earnedScore}
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      earnedScore >= 80
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : earnedScore >= 50
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                    }
                  >
                    {earnedScore >= 80
                      ? 'Excellent Choice!'
                      : earnedScore >= 50
                        ? 'Partial Match'
                        : 'Poor Recommendation'}
                  </Badge>
                </div>

                <Separator />

                {/* Detailed feedback */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Detailed Feedback</p>
                  <div className="bg-white/60 dark:bg-slate-900/40 rounded-lg p-4">
                    {feedbackText.split('\n').map((line, i) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;

                      // Detect different line types
                      if (trimmed.startsWith('You recommended:')) {
                        return (
                          <p key={i} className="text-sm font-medium text-foreground">
                            {trimmed}
                          </p>
                        );
                      }
                      if (trimmed.startsWith('Tip:')) {
                        return (
                          <p
                            key={i}
                            className="text-sm text-amber-700 dark:text-amber-400 mt-2 flex items-start gap-1.5"
                          >
                            <Zap className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{trimmed.replace('Tip: ', '')}</span>
                          </p>
                        );
                      }
                      if (trimmed.startsWith('Advantages:')) {
                        return (
                          <p
                            key={i}
                            className="text-sm text-emerald-700 dark:text-emerald-400 mt-2"
                          >
                            ✅ {trimmed}
                          </p>
                        );
                      }
                      if (trimmed.startsWith('Disadvantages:')) {
                        return (
                          <p
                            key={i}
                            className="text-sm text-red-700 dark:text-red-400 mt-1"
                          >
                            ❌ {trimmed}
                          </p>
                        );
                      }
                      return (
                        <p
                          key={i}
                          className="text-sm text-muted-foreground leading-relaxed"
                        >
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Criteria breakdown for chosen solution */}
                {(() => {
                  const chosen = solutions.find(
                    (s) => s.id === selectedId
                  );
                  if (!chosen) return null;
                  return (
                    <div className="grid grid-cols-3 gap-2">
                      <div
                        className={`rounded-lg p-3 text-center ${
                          chosen.meetsRequirements
                            ? 'bg-emerald-100 dark:bg-emerald-950/30'
                            : 'bg-red-100 dark:bg-red-950/30'
                        }`}
                      >
                        <div className="text-lg font-bold">
                          {chosen.meetsRequirements ? '✅' : '❌'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Requirements
                        </div>
                      </div>
                      <div
                        className={`rounded-lg p-3 text-center ${
                          chosen.meetsBudget
                            ? 'bg-emerald-100 dark:bg-emerald-950/30'
                            : 'bg-red-100 dark:bg-red-950/30'
                        }`}
                      >
                        <div className="text-lg font-bold">
                          {chosen.meetsBudget ? '✅' : '❌'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Budget
                        </div>
                      </div>
                      <div
                        className={`rounded-lg p-3 text-center ${
                          chosen.followsPolicy
                            ? 'bg-emerald-100 dark:bg-emerald-950/30'
                            : 'bg-red-100 dark:bg-red-950/30'
                        }`}
                      >
                        <div className="text-lg font-bold">
                          {chosen.followsPolicy ? '✅' : '❌'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Policy
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <Separator />

                {/* Complete Scenario button */}
                <div className="flex justify-center pt-2">
                  <Button
                    size="lg"
                    onClick={() => completeScenario()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                  >
                    Complete Scenario
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
