'use client';

import { useState, useMemo } from 'react';
import { useGameStore } from '@/lib/game-store';
import { getScenarioById } from '@/lib/game-data';
import type { DocumentationField, RequirementCategory } from '@/lib/game-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, ClipboardList, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Category metadata: icon, label, color
const CATEGORY_META: Record<
  RequirementCategory,
  { icon: string; label: string; color: string }
> = {
  technical: { icon: '🔧', label: 'Technical Requirements', color: 'text-blue-600' },
  budget: { icon: '💰', label: 'Budget Information', color: 'text-emerald-600' },
  policy: { icon: '📜', label: 'Policy & Compliance', color: 'text-amber-600' },
  compatibility: { icon: '🔗', label: 'Compatibility', color: 'text-purple-600' },
  training: { icon: '📖', label: 'Training Needs', color: 'text-rose-600' },
  support: { icon: '🛟', label: 'Support Requirements', color: 'text-cyan-600' },
  timeline: { icon: '📅', label: 'Timeline', color: 'text-orange-600' },
};

// Slang / unprofessional words to check
const SLANG_PATTERNS = [
  /\bwanna\b/i,
  /\bgonna\b/i,
  /\bgotta\b/i,
  /\bkinda\b/i,
  /\bsorta\b/i,
  /\bdunno\b/i,
  /\bcool\b/i,
  /\bstuff\b/i,
  /\bthingy\b/i,
  /\bdude\b/i,
  /\bbro\b/i,
  /\bomg\b/i,
  /\blol\b/i,
  /\bidk\b/i,
  /\basap\b/i,
];

interface FieldEvaluation {
  fieldId: string;
  filled: boolean;
  hasCorrectKeywords: boolean;
  keywordMatches: string[];
  meaningful: boolean;
  professional: boolean;
}

function evaluateField(
  field: DocumentationField,
  value: string
): FieldEvaluation {
  const trimmed = value.trim();
  const filled = trimmed.length > 0;
  const meaningful = trimmed.length > 5;

  // Check for correct keywords
  const keywordMatches = field.correctValues.filter((keyword) =>
    trimmed.toLowerCase().includes(keyword.toLowerCase())
  );
  const hasCorrectKeywords =
    field.correctValues.length === 0 || keywordMatches.length > 0;

  // Check professionalism
  const hasSlang = SLANG_PATTERNS.some((p) => p.test(trimmed));
  const hasCapitalStart = trimmed.length === 0 || /^[A-Z]/.test(trimmed);
  const professional = !hasSlang && hasCapitalStart;

  return {
    fieldId: field.id,
    filled,
    hasCorrectKeywords,
    keywordMatches,
    meaningful,
    professional,
  };
}

export default function DocumentationSystem() {
  const {
    currentScenarioId,
    documentationState,
    updateDocumentField,
    completeDocumentation,
    setPhase,
  } = useGameStore();

  const scenario = currentScenarioId
    ? getScenarioById(currentScenarioId)
    : undefined;

  const [submitted, setSubmitted] = useState(false);
  const [evaluations, setEvaluations] = useState<FieldEvaluation[]>([]);

  // Group fields by category
  const groupedFields = useMemo(() => {
    if (!scenario) return {};
    const groups: Record<string, DocumentationField[]> = {};
    for (const field of scenario.documentationFields) {
      if (!groups[field.category]) {
        groups[field.category] = [];
      }
      groups[field.category].push(field);
    }
    return groups;
  }, [scenario]);

  // Category order
  const categoryOrder: RequirementCategory[] = [
    'technical',
    'budget',
    'compatibility',
    'policy',
    'training',
    'support',
    'timeline',
  ];

  const handleSubmit = () => {
    if (!scenario) return;

    const evals = scenario.documentationFields.map((field) =>
      evaluateField(field, documentationState.fields[field.id] || '')
    );
    setEvaluations(evals);
    setSubmitted(true);

    // Calculate scores
    const requiredFields = scenario.documentationFields.filter((f) => f.required);
    const requiredEvals = evals.filter((e) =>
      requiredFields.some((f) => f.id === e.fieldId)
    );

    // Completeness: percentage of required fields filled
    const filledRequired = requiredEvals.filter((e) => e.filled).length;
    const completeness = Math.round(
      (filledRequired / Math.max(requiredFields.length, 1)) * 100
    );

    // Clarity: percentage of all fields with meaningful content
    const meaningfulFields = evals.filter((e) => e.meaningful).length;
    const clarity = Math.round(
      (meaningfulFields / Math.max(evals.length, 1)) * 100
    );

    // Professionalism: check for professional language across all filled fields
    const filledEvals = evals.filter((e) => e.filled);
    const professionalFields = filledEvals.filter((e) => e.professional).length;
    const professionalism = filledEvals.length > 0
      ? Math.round((professionalFields / filledEvals.length) * 100)
      : 0;

    // Overall score: average of completeness, clarity, professionalism
    const score = Math.round((completeness + clarity + professionalism) / 3);

    completeDocumentation(score, completeness, clarity, professionalism);
  };

  const getEvaluationForField = (fieldId: string): FieldEvaluation | undefined =>
    evaluations.find((e) => e.fieldId === fieldId);

  const getIndicatorColor = (evalResult: FieldEvaluation) => {
    if (!evalResult.filled) return 'red';
    if (evalResult.hasCorrectKeywords && evalResult.meaningful && evalResult.professional)
      return 'green';
    if (evalResult.filled) return 'yellow';
    return 'red';
  };

  const getIndicatorIcon = (color: string) => {
    switch (color) {
      case 'green':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'yellow':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'red':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
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
      className="max-w-3xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 text-3xl"
        >
          📋
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Requirement Documentation
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Document the client requirements you gathered during the meeting
        </p>
      </div>

      {/* Form sections grouped by category */}
      {categoryOrder.map((category, catIdx) => {
        const fields = groupedFields[category];
        if (!fields || fields.length === 0) return null;
        const meta = CATEGORY_META[category];

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: catIdx * 0.08, duration: 0.35 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg flex items-center gap-2 ${meta.color}`}>
                  <span>{meta.icon}</span>
                  {meta.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, fieldIdx) => {
                  const value = documentationState.fields[field.id] || '';
                  const evalResult = submitted
                    ? getEvaluationForField(field.id)
                    : undefined;
                  const indicatorColor = evalResult
                    ? getIndicatorColor(evalResult)
                    : null;

                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: catIdx * 0.08 + fieldIdx * 0.05,
                        duration: 0.3,
                      }}
                      className="space-y-1.5"
                    >
                      <label
                        htmlFor={field.id}
                        className="text-sm font-medium flex items-center gap-1.5"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 text-base leading-none">*</span>
                        )}
                        {evalResult && indicatorColor && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            {getIndicatorIcon(indicatorColor)}
                          </motion.span>
                        )}
                      </label>
                      {field.label.toLowerCase().includes('use case') ||
                      field.label.toLowerCase().includes('requirement') ||
                      field.label.toLowerCase().includes('training') ||
                      field.label.toLowerCase().includes('compatibility') ||
                      field.label.toLowerCase().includes('policy') ? (
                        <Textarea
                          id={field.id}
                          placeholder={field.placeholder}
                          value={value}
                          onChange={(e) =>
                            updateDocumentField(field.id, e.target.value)
                          }
                          disabled={submitted}
                          rows={3}
                          className={`resize-none transition-colors ${
                            evalResult
                              ? indicatorColor === 'green'
                                ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                                : indicatorColor === 'yellow'
                                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                                  : 'border-red-400 bg-red-50/50 dark:bg-red-950/20'
                              : ''
                          }`}
                        />
                      ) : (
                        <Input
                          id={field.id}
                          placeholder={field.placeholder}
                          value={value}
                          onChange={(e) =>
                            updateDocumentField(field.id, e.target.value)
                          }
                          disabled={submitted}
                          className={`transition-colors ${
                            evalResult
                              ? indicatorColor === 'green'
                                ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                                : indicatorColor === 'yellow'
                                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                                  : 'border-red-400 bg-red-50/50 dark:bg-red-950/20'
                              : ''
                          }`}
                        />
                      )}
                      {/* Show keyword hint after submission */}
                      {evalResult && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.2 }}
                          className="text-xs space-y-1"
                        >
                          {!evalResult.filled && (
                            <p className="text-red-500">
                              This required field was left empty.
                            </p>
                          )}
                          {evalResult.filled && !evalResult.hasCorrectKeywords && (
                            <p className="text-amber-600">
                              Some expected keywords may be missing. Expected
                              terms related to:{' '}
                              {scenario.documentationFields
                                .find((f) => f.id === field.id)
                                ?.correctValues.slice(0, 3)
                                .join(', ')}
                              ...
                            </p>
                          )}
                          {evalResult.filled &&
                            !evalResult.professional && (
                              <p className="text-amber-600">
                                Consider using more professional language and
                                proper formatting.
                              </p>
                            )}
                          {evalResult.filled &&
                            evalResult.hasCorrectKeywords &&
                            evalResult.professional && (
                              <p className="text-emerald-600">
                                Well documented!
                              </p>
                            )}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Submit / Results */}
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
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8"
          >
            <ClipboardList className="h-5 w-5" />
            Submit Documentation
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 150 }}
          >
            <Card className="border-2 border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  📊 Documentation Evaluation
                </CardTitle>
                <CardDescription>
                  Here&apos;s how your documentation performed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: 'Completeness',
                      value: documentationState.completeness,
                      icon: '📝',
                      color:
                        documentationState.completeness >= 80
                          ? 'text-emerald-600'
                          : documentationState.completeness >= 50
                            ? 'text-amber-600'
                            : 'text-red-600',
                      bg:
                        documentationState.completeness >= 80
                          ? 'bg-emerald-100 dark:bg-emerald-950/30'
                          : documentationState.completeness >= 50
                            ? 'bg-amber-100 dark:bg-amber-950/30'
                            : 'bg-red-100 dark:bg-red-950/30',
                    },
                    {
                      label: 'Clarity',
                      value: documentationState.clarity,
                      icon: '🔍',
                      color:
                        documentationState.clarity >= 80
                          ? 'text-emerald-600'
                          : documentationState.clarity >= 50
                            ? 'text-amber-600'
                            : 'text-red-600',
                      bg:
                        documentationState.clarity >= 80
                          ? 'bg-emerald-100 dark:bg-emerald-950/30'
                          : documentationState.clarity >= 50
                            ? 'bg-amber-100 dark:bg-amber-950/30'
                            : 'bg-red-100 dark:bg-red-950/30',
                    },
                    {
                      label: 'Professionalism',
                      value: documentationState.professionalism,
                      icon: '👔',
                      color:
                        documentationState.professionalism >= 80
                          ? 'text-emerald-600'
                          : documentationState.professionalism >= 50
                            ? 'text-amber-600'
                            : 'text-red-600',
                      bg:
                        documentationState.professionalism >= 80
                          ? 'bg-emerald-100 dark:bg-emerald-950/30'
                          : documentationState.professionalism >= 50
                            ? 'bg-amber-100 dark:bg-amber-950/30'
                            : 'bg-red-100 dark:bg-red-950/30',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`${item.bg} rounded-xl p-4 text-center space-y-1`}
                    >
                      <div className="text-2xl">{item.icon}</div>
                      <div className={`text-3xl font-bold ${item.color}`}>
                        {item.value}%
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Overall score */}
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Overall Documentation Score
                  </div>
                  <div className="text-5xl font-bold text-amber-600">
                    {documentationState.score}
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      documentationState.score >= 80
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : documentationState.score >= 50
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                    }
                  >
                    {documentationState.score >= 80
                      ? 'Excellent Documentation!'
                      : documentationState.score >= 60
                        ? 'Good Effort!'
                        : documentationState.score >= 40
                          ? 'Needs Improvement'
                          : 'Try Again'}
                  </Badge>
                </div>

                <Separator />

                {/* Continue button */}
                <div className="flex justify-center pt-2">
                  <Button
                    size="lg"
                    onClick={() => setPhase('recommendation')}
                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8"
                  >
                    Continue to Recommendation
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
