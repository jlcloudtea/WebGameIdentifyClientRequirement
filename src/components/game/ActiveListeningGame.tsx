'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { getScenarioById } from '@/lib/game-data';
import type { ListeningItem, RequirementCategory } from '@/lib/game-types';
import {
  Headphones,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
} from 'lucide-react';

// ============================================================
// Category configuration
// ============================================================

interface CategoryConfig {
  id: RequirementCategory | 'not-important';
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'budget', label: 'Budget', emoji: '💰', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-300' },
  { id: 'timeline', label: 'Timeline', emoji: '⏰', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { id: 'technical', label: 'Technical', emoji: '🔧', color: 'text-slate-700', bgColor: 'bg-slate-50', borderColor: 'border-slate-300' },
  { id: 'policy', label: 'Policy', emoji: '📜', color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-300' },
  { id: 'support', label: 'Support', emoji: '🛟', color: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-300' },
  { id: 'compatibility', label: 'Compatibility', emoji: '🔗', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
  { id: 'training', label: 'Training', emoji: '📖', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300' },
  { id: 'not-important', label: 'Not Important', emoji: '❌', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
];

// ============================================================
// ActiveListeningGame Component
// ============================================================

export default function ActiveListeningGame() {
  const { currentScenarioId, categorizeItem, completeListeningChallenge, setPhase } = useGameStore();

  const scenario = useMemo(
    () => (currentScenarioId ? getScenarioById(currentScenarioId) : undefined),
    [currentScenarioId],
  );

  const listeningItems: ListeningItem[] = scenario?.listeningItems ?? [];

  // Local state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, string>>({}); // itemId -> category
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // ============================================================
  // Derived state
  // ============================================================

  const unplacedItems = listeningItems.filter((item) => !placements[item.id]);

  const getCategoryItems = (categoryId: string): ListeningItem[] =>
    listeningItems.filter((item) => placements[item.id] === categoryId);

  const allItemsPlaced = listeningItems.length > 0 && unplacedItems.length === 0;

  // ============================================================
  // Handlers
  // ============================================================

  const handleItemClick = (itemId: string) => {
    if (submitted) return;
    setSelectedItemId((prev) => (prev === itemId ? null : itemId));
  };

  const handleCategoryClick = (categoryId: string) => {
    if (submitted || !selectedItemId) return;

    const item = listeningItems.find((i) => i.id === selectedItemId);
    if (!item) return;

    // Check if already placed in this category
    if (placements[selectedItemId] === categoryId) {
      setSelectedItemId(null);
      return;
    }

    setPlacements((prev) => ({ ...prev, [selectedItemId]: categoryId }));
    categorizeItem(selectedItemId, categoryId);
    setSelectedItemId(null);
  };

  const handleRemoveFromCategory = (itemId: string) => {
    if (submitted) return;
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleSubmit = () => {
    let rawScore = 0;
    let maxPossible = 0;

    listeningItems.forEach((item) => {
      // Calculate max possible: +10 for each item
      maxPossible += 10;

      const placedCategory = placements[item.id];
      if (!placedCategory) return; // unplaced = 0 points

      if (item.isImportant) {
        // Important items should be placed in their correct category
        if (placedCategory === item.category) {
          rawScore += 10;
        } else {
          rawScore -= 3;
        }
      } else {
        // Non-important items (distractors) should be placed in "not-important"
        if (placedCategory === 'not-important') {
          rawScore += 10;
        } else {
          rawScore -= 3;
        }
      }
    });

    // Normalize to 0-100
    const normalizedScore = Math.max(0, Math.round((rawScore / maxPossible) * 100));

    setScore(normalizedScore);
    setSubmitted(true);

    // Show results with a slight delay for animation
    setTimeout(() => setShowResults(true), 300);
  };

  const handleContinue = () => {
    completeListeningChallenge(score);
    setPhase('questioning');
  };

  const handleReset = () => {
    setSelectedItemId(null);
    setPlacements({});
    setSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  // ============================================================
  // Helper: check if placement is correct
  // ============================================================

  const isPlacementCorrect = (itemId: string): boolean => {
    const item = listeningItems.find((i) => i.id === itemId);
    if (!item) return false;
    const placedCategory = placements[itemId];
    if (item.isImportant) {
      return placedCategory === item.category;
    } else {
      return placedCategory === 'not-important';
    }
  };

  if (!scenario) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">No scenario selected.</p>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Headphones className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-xl text-amber-900">
                  🎧 Active Listening Challenge
                </CardTitle>
                <p className="text-sm text-amber-700">
                  Categorize the client requirements you heard during the meeting.
                  Place distractors in &quot;Not Important&quot;.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {unplacedItems.length} items remaining
              </Badge>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                {Object.keys(placements).length} placed
              </Badge>
              {selectedItemId && (
                <Badge className="animate-pulse bg-amber-500 text-white">
                  ✋ Click a category to place selected item
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Information Cards - unplaced */}
      {!showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Information Cards
          </h3>
          {unplacedItems.length === 0 && !submitted ? (
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-6 text-center">
              <p className="text-muted-foreground">All items have been placed! Submit to check your score.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <AnimatePresence mode="popLayout">
                {unplacedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`
                        relative rounded-xl border-2 px-4 py-3 text-left text-sm transition-all
                        max-w-[260px] min-h-[60px] flex items-start gap-2
                        ${selectedItemId === item.id
                          ? 'border-amber-500 bg-amber-50 shadow-lg ring-2 ring-amber-400 ring-offset-2'
                          : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-md'
                        }
                      `}
                    >
                      <span className="mt-0.5 flex-shrink-0 text-amber-500">
                        {selectedItemId === item.id ? '✋' : '📌'}
                      </span>
                      <span className="leading-snug">{item.text}</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* Category Drop Zones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Drop Zones
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const catItems = getCategoryItems(cat.id);
            return (
              <motion.div
                key={cat.id}
                whileHover={selectedItemId ? { scale: 1.02 } : {}}
                className={`
                  rounded-xl border-2 p-3 transition-all cursor-pointer min-h-[140px]
                  ${cat.bgColor} ${cat.borderColor}
                  ${selectedItemId ? 'hover:shadow-lg hover:ring-2 hover:ring-amber-400' : ''}
                  ${cat.id === 'not-important' ? 'border-dashed' : ''}
                `}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className={`text-sm font-semibold ${cat.color}`}>{cat.label}</span>
                  </div>
                  {catItems.length > 0 && (
                    <Badge variant="secondary" className={`text-xs ${cat.color} ${cat.bgColor}`}>
                      {catItems.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5">
                  {catItems.map((item) => {
                    const correct = isPlacementCorrect(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          group relative flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-xs leading-snug
                          ${submitted
                            ? correct
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-white/80 text-slate-700 border border-white/50'
                          }
                        `}
                      >
                        {submitted && (
                          <span className="mt-0.5 flex-shrink-0">
                            {correct ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-600" />
                            )}
                          </span>
                        )}
                        <span className="flex-1">{item.text}</span>
                        {!submitted && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCategory(item.id);
                            }}
                            className="flex-shrink-0 rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                            aria-label={`Remove ${item.text} from ${cat.label}`}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {submitted && !correct && (
                          <span className="flex-shrink-0 text-[10px] text-red-500 italic">
                            → {item.isImportant ? item.category : 'not-important'}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Submit / Results / Continue */}
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between pt-2"
          >
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={Object.keys(placements).length === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Placements
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!allItemsPlaced}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Submit &amp; Check Score
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        ) : showResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <Award className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-emerald-900">
                      Listening Challenge Results
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Score display */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-300 bg-white"
                      >
                        <span className="text-3xl font-bold text-emerald-700">{score}</span>
                      </motion.div>
                      <p className="mt-1 text-xs font-medium text-emerald-600">out of 100</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-emerald-800">
                        {score >= 90
                          ? '🌟 Outstanding! You identified almost all requirements correctly!'
                          : score >= 70
                            ? '👍 Great job! You have good active listening skills.'
                            : score >= 50
                              ? '📝 Decent effort. Keep practicing your listening skills.'
                              : '💪 Keep trying! Active listening takes practice.'}
                      </p>
                      <div className="flex gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-emerald-700">
                            {listeningItems.filter((i) => isPlacementCorrect(i.id)).length} correct
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                          <span className="text-emerald-700">
                            {listeningItems.filter((i) => placements[i.id] && !isPlacementCorrect(i.id)).length} incorrect
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Continue button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleContinue}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Continue to Questioning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
