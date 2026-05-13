'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import { getScenarioById } from '@/lib/game-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  ChevronRight,
  SkipForward,
  Lock,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { EmotionalState, QuestionType, DialogueOption } from '@/lib/game-types';

// ============================================================
// Emotion Mapping
// ============================================================

const emotionConfig: Record<
  EmotionalState,
  { emoji: string; bgColor: string; borderColor: string; textColor: string; bubbleBg: string; label: string }
> = {
  happy: {
    emoji: '😊',
    bgColor: 'bg-green-50 dark:bg-green-950/40',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-700 dark:text-green-300',
    bubbleBg: 'bg-green-100 dark:bg-green-900/50',
    label: 'Happy',
  },
  frustrated: {
    emoji: '😤',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-300',
    bubbleBg: 'bg-red-100 dark:bg-red-900/50',
    label: 'Frustrated',
  },
  confused: {
    emoji: '😕',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/40',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    bubbleBg: 'bg-yellow-100 dark:bg-yellow-900/50',
    label: 'Confused',
  },
  worried: {
    emoji: '😟',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800',
    textColor: 'text-sky-700 dark:text-sky-300',
    bubbleBg: 'bg-sky-100 dark:bg-sky-900/50',
    label: 'Worried',
  },
  neutral: {
    emoji: '😐',
    bgColor: 'bg-gray-50 dark:bg-gray-900/40',
    borderColor: 'border-gray-200 dark:border-gray-700',
    textColor: 'text-gray-700 dark:text-gray-300',
    bubbleBg: 'bg-gray-100 dark:bg-gray-800/50',
    label: 'Neutral',
  },
  excited: {
    emoji: '🤩',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-700 dark:text-purple-300',
    bubbleBg: 'bg-purple-100 dark:bg-purple-900/50',
    label: 'Excited',
  },
};

// ============================================================
// Question Type Badge Mapping
// ============================================================

const questionTypeConfig: Record<
  QuestionType,
  { icon: string; label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  open: {
    icon: '🟢',
    label: 'Open Question',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  closed: {
    icon: '🔵',
    label: 'Closed Question',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  clarification: {
    icon: '🟡',
    label: 'Clarification',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  probing: {
    icon: '🟠',
    label: 'Probing',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  strategic: {
    icon: '🟣',
    label: 'Strategic',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    textColor: 'text-violet-700 dark:text-violet-300',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  planning: {
    icon: '🟤',
    label: 'Planning',
    bgColor: 'bg-stone-50 dark:bg-stone-950/40',
    textColor: 'text-stone-700 dark:text-stone-300',
    borderColor: 'border-stone-200 dark:border-stone-800',
  },
  divergent: {
    icon: '🔷',
    label: 'Divergent',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/40',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
  poor: {
    icon: '🔴',
    label: 'Poor Choice',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
  },
};

// ============================================================
// Learning Tips by Question Type
// ============================================================

const learningTipMap: Record<QuestionType, string> = {
  open: 'Open questions start with What, How, Why, or "Tell me about..." They encourage detailed responses and reveal information you might not have known to ask about.',
  closed: 'Closed questions can be answered with yes/no or a specific fact. Useful for confirming details but limit information flow. Use after open questions to nail down specifics.',
  clarification: 'Clarification questions help you understand exactly what the client means. "When you say X, what exactly do you mean?" prevents assumptions and misunderstandings.',
  probing: 'Probing questions dig deeper into a topic. "Can you tell me more about that?" or "What specifically causes the problem?" helps uncover hidden requirements.',
  strategic: 'Strategic questions guide the conversation toward important areas like budget, timeline, or constraints. They show you are thinking about the big picture.',
  planning: 'Planning questions focus on implementation, next steps, and practical considerations. They help bridge the gap between requirements and solutions.',
  divergent: 'Divergent questions explore alternative possibilities. While creative, they should be used after understanding core requirements, not instead of them.',
  poor: 'This type of response damages trust and fails to gather useful information. Always listen actively, show empathy, and ask thoughtful questions before jumping to solutions.',
};

// ============================================================
// Inner Panel Component - uses key for automatic state reset
// ============================================================

function DialoguePanel({ nodeIndex }: { nodeIndex: number }) {
  const {
    currentScenarioId,
    dialogueState,
    selectDialogueOption,
    nextDialogueNode,
    setPhase,
  } = useGameStore();

  const scenario = currentScenarioId ? getScenarioById(currentScenarioId) : undefined;
  const trustLevel = dialogueState.trustLevel;
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Local state resets automatically when key (nodeIndex) changes
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOptionData, setSelectedOptionData] = useState<DialogueOption | null>(null);

  // Auto-scroll history to bottom
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueState.history.length, showFeedback]);

  const currentNode = scenario?.dialogue[nodeIndex];
  const isDialogueComplete = scenario
    ? nodeIndex >= scenario.dialogue.length
    : false;

  const handleSelectOption = (option: DialogueOption) => {
    if (selectedOptionId) return;

    setSelectedOptionId(option.id);
    setSelectedOptionData(option);
    setShowFeedback(true);

    selectDialogueOption(
      option.id,
      option.score,
      option.clientResponse,
      option.clientEmotion,
      option.feedback,
      option.unlocksInfo
    );
  };

  const handleContinue = () => {
    if (!scenario) return;

    if (nodeIndex < scenario.dialogue.length - 1) {
      nextDialogueNode();
    } else {
      setPhase('active-listening');
    }
  };

  const handleSkipToEnd = () => {
    if (!scenario) return;
    setPhase('active-listening');
  };

  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500 dark:text-slate-400">No scenario selected.</p>
      </div>
    );
  }

  if (isDialogueComplete) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Conversation Complete!
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            You&apos;ve finished the dialogue with {scenario.client.name}.
          </p>
          <Button
            onClick={() => setPhase('active-listening')}
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <ArrowRight className="h-4 w-4" />
            Continue to Active Listening
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!currentNode) {
    return null;
  }

  const currentEmotion: EmotionalState = currentNode.emotion || 'neutral';
  const emotionCfg = emotionConfig[currentEmotion];
  const clientName = scenario.client.name;
  const clientAvatar = scenario.client.avatar;

  const trustColor =
    trustLevel >= 70
      ? 'bg-emerald-500'
      : trustLevel >= 40
        ? 'bg-amber-500'
        : 'bg-red-500';

  const trustLabel =
    trustLevel >= 80
      ? 'High Trust'
      : trustLevel >= 60
        ? 'Good Trust'
        : trustLevel >= 40
          ? 'Moderate Trust'
          : trustLevel >= 20
            ? 'Low Trust'
            : 'Very Low Trust';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      {/* Trust Meter - Sticky Top */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Client Trust
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${
                  trustLevel >= 70
                    ? 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                    : trustLevel >= 40
                      ? 'border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                      : 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
                }`}
              >
                {trustLabel}
              </Badge>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {trustLevel}/100
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${trustColor}`}
              initial={false}
              animate={{ width: `${trustLevel}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Dialogue History */}
          {dialogueState.history.length > 0 && (
            <ScrollArea className="max-h-64 rounded-lg">
              <div className="space-y-3 pr-2 pb-2">
                <AnimatePresence initial={false}>
                  {dialogueState.history.map((entry, index) => {
                    const isClient = entry.speaker === 'client';
                    const entryEmotion: EmotionalState = (entry as { emotion?: EmotionalState }).emotion || 'neutral';
                    const entryEmotionCfg = emotionConfig[entryEmotion];

                    return (
                      <motion.div
                        key={`history-${index}`}
                        initial={{ opacity: 0, x: isClient ? -20 : 20, y: 5 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-2.5 ${isClient ? 'justify-start' : 'justify-end'}`}
                      >
                        {isClient && (
                          <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm">
                            {clientAvatar}
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                            isClient
                              ? `${entryEmotionCfg.bubbleBg} rounded-tl-sm`
                              : 'bg-slate-600 dark:bg-slate-500 text-white rounded-tr-sm'
                          }`}
                        >
                          {isClient && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                {clientName}
                              </span>
                              <span className="text-xs" role="img" aria-label={entryEmotionCfg.label}>
                                {entryEmotionCfg.emoji}
                              </span>
                            </div>
                          )}
                          <p className={`${isClient ? 'text-slate-700 dark:text-slate-200' : 'text-white'} leading-relaxed`}>
                            {entry.text}
                          </p>
                          {!isClient && (entry as { scoreChange?: number }).scoreChange !== undefined && (
                            <div className="mt-1 text-right">
                              <span
                                className={`text-[10px] font-bold ${
                                  (entry as { scoreChange?: number }).scoreChange! > 0
                                    ? 'text-emerald-300'
                                    : (entry as { scoreChange?: number }).scoreChange! < 0
                                      ? 'text-red-300'
                                      : 'text-slate-300'
                                }`}
                              >
                                {(entry as { scoreChange?: number }).scoreChange! > 0 ? '+' : ''}
                                {(entry as { scoreChange?: number }).scoreChange} trust
                              </span>
                            </div>
                          )}
                        </div>
                        {!isClient && (
                          <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-sm">
                            🧑‍💻
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={historyEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Current Client Message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`client-msg-${currentNode.id}`}
              initial={{ opacity: 0, x: -30, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Card
                className={`overflow-hidden border ${emotionCfg.borderColor} ${emotionCfg.bgColor}`}
              >
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                      className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl border border-slate-200 dark:border-slate-700"
                      role="img"
                      aria-label={`Avatar of ${clientName}`}
                    >
                      {clientAvatar}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {clientName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {scenario.client.role}, {scenario.client.organization}
                      </p>
                    </div>
                    <Badge
                      className={`${emotionCfg.bgColor} ${emotionCfg.textColor} ${emotionCfg.borderColor} border text-xs gap-1`}
                    >
                      <span role="img" aria-label={emotionCfg.label}>
                        {emotionCfg.emoji}
                      </span>
                      {emotionCfg.label}
                    </Badge>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`${emotionCfg.bubbleBg} rounded-2xl rounded-tl-sm px-4 py-3 relative`}
                  >
                    <div
                      className={`absolute -left-1.5 top-3 w-3 h-3 ${emotionCfg.bubbleBg} rotate-45`}
                    />
                    <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
                      {currentNode.text}
                    </p>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Response Options */}
          {!showFeedback && currentNode.options && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  Your Response:
                </h4>
              </div>
              <div className="space-y-2.5">
                <AnimatePresence>
                  {currentNode.options.map((option, idx) => {
                    const typeCfg = questionTypeConfig[option.type];
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.08, duration: 0.3 }}
                        onClick={() => handleSelectOption(option)}
                        className="w-full text-left group"
                        aria-label={`Select option: ${option.text}`}
                      >
                        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md transition-all duration-200 px-4 py-3 cursor-pointer group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {option.text}
                              </p>
                            </div>
                            <Badge
                              className={`shrink-0 text-[10px] px-1.5 py-0.5 ${typeCfg.bgColor} ${typeCfg.textColor} ${typeCfg.borderColor} border gap-0.5`}
                            >
                              <span className="text-[9px]">{typeCfg.icon}</span>
                              {typeCfg.label}
                            </Badge>
                          </div>
                        </Card>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* After Selection: Feedback Panel */}
          <AnimatePresence>
            {showFeedback && selectedOptionData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-3"
              >
                {/* Player Response Bubble */}
                <div className="flex gap-2.5 justify-end">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-[75%] rounded-2xl rounded-tr-sm bg-slate-600 dark:bg-slate-500 text-white px-4 py-3 relative"
                  >
                    <div className="absolute -right-1.5 top-3 w-3 h-3 bg-slate-600 dark:bg-slate-500 rotate-45" />
                    <p className="text-sm leading-relaxed">{selectedOptionData.text}</p>
                    <div className="mt-1.5 text-right">
                      <span
                        className={`text-[11px] font-bold ${
                          selectedOptionData.score > 0
                            ? 'text-emerald-300'
                            : selectedOptionData.score < 0
                              ? 'text-red-300'
                              : 'text-slate-300'
                        }`}
                      >
                        {selectedOptionData.score > 0 ? '+' : ''}
                        {selectedOptionData.score} trust
                      </span>
                    </div>
                  </motion.div>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-sm">
                    🧑‍💻
                  </div>
                </div>

                {/* Client Response Bubble */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-2.5 justify-start"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm">
                    {clientAvatar}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl rounded-tl-sm ${
                      emotionConfig[selectedOptionData.clientEmotion].bubbleBg
                    } px-4 py-3 relative`}
                  >
                    <div
                      className={`absolute -left-1.5 top-3 w-3 h-3 ${
                        emotionConfig[selectedOptionData.clientEmotion].bubbleBg
                      } rotate-45`}
                    />
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {clientName}
                      </span>
                      <span className="text-xs" role="img" aria-label={emotionConfig[selectedOptionData.clientEmotion].label}>
                        {emotionConfig[selectedOptionData.clientEmotion].emoji}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {selectedOptionData.clientResponse}
                    </p>
                  </div>
                </motion.div>

                {/* Feedback Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.35 }}
                >
                  <Card
                    className={`overflow-hidden border-2 ${
                      selectedOptionData.isCorrect
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="px-4 py-3 sm:px-5 sm:py-4 space-y-3">
                      <div className="flex items-center gap-2">
                        {selectedOptionData.isCorrect ? (
                          <ThumbsUp className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <ThumbsDown className="h-5 w-5 text-red-500" />
                        )}
                        <h4
                          className={`font-bold text-sm ${
                            selectedOptionData.isCorrect
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-red-700 dark:text-red-300'
                          }`}
                        >
                          {selectedOptionData.isCorrect ? 'Great Choice!' : 'Not the Best Choice'}
                        </h4>
                        <Badge
                          className={`ml-auto text-[10px] ${
                            selectedOptionData.isCorrect
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                          } border`}
                        >
                          {selectedOptionData.score > 0 ? '+' : ''}
                          {selectedOptionData.score} pts
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedOptionData.feedback}
                      </p>

                      {/* Learning Tip */}
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg px-3 py-2.5">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                              Learning Tip — {questionTypeConfig[selectedOptionData.type].label}
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                              {learningTipMap[selectedOptionData.type]}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Unlocked Info */}
                      {selectedOptionData.unlocksInfo && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 }}
                          className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-lg px-3 py-2.5"
                        >
                          <div className="flex items-start gap-2">
                            <Lock className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 mb-0.5">
                                Information Unlocked!
                              </p>
                              <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
                                {selectedOptionData.unlocksInfo}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Continue Button */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          Node {nodeIndex + 1} of {scenario.dialogue.length}
                        </span>
                        <Button
                          onClick={handleContinue}
                          className={`gap-1.5 text-sm font-semibold ${
                            selectedOptionData.isCorrect
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : 'bg-slate-600 hover:bg-slate-700 text-white'
                          }`}
                          size="sm"
                        >
                          <ChevronRight className="h-4 w-4" />
                          {nodeIndex < scenario.dialogue.length - 1
                            ? 'Continue'
                            : 'Finish Dialogue'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Information Unlocked Cards */}
          {dialogueState.informationUnlocked.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Discovered Information ({dialogueState.informationUnlocked.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dialogueState.informationUnlocked.map((info, idx) => (
                  <motion.div
                    key={`info-${idx}`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Badge
                      variant="outline"
                      className="text-[10px] border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/30"
                    >
                      <Lock className="h-2.5 w-2.5 mr-0.5" />
                      {info}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Progress: {nodeIndex + 1}/{scenario.dialogue.length}
            </span>
            <Progress
              value={((nodeIndex + 1) / scenario.dialogue.length) * 100}
              className="h-1.5 w-20"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipToEnd}
            className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 gap-1"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Skip to End
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Component with Key-Based Reset
// ============================================================

export default function DialogueSystem() {
  const currentNodeIndex = useGameStore((s) => s.dialogueState.currentNodeIndex);

  // Using key prop on DialoguePanel ensures all local state
  // resets automatically when the dialogue node changes
  return <DialoguePanel key={currentNodeIndex} nodeIndex={currentNodeIndex} />;
}
