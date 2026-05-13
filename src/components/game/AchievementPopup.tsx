'use client';

import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, X } from 'lucide-react';

// ============================================================
// Sparkle Particle
// ============================================================

function SparkleParticle({ delay, size, angle, distance }: {
  delay: number;
  size: number;
  angle: number;
  distance: number;
}) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
        left: '50%',
        top: '50%',
      }}
      initial={{
        x: 0,
        y: 0,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        x: [0, x],
        y: [0, y],
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0],
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: 'easeOut',
        repeat: Infinity,
        repeatDelay: 2,
      }}
    />
  );
}

// ============================================================
// Sparkle Ring
// ============================================================

function SparkleRing() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.12,
    size: 4 + Math.random() * 4,
    angle: i * 30,
    distance: 60 + Math.random() * 20,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <SparkleParticle
          key={p.id}
          delay={p.delay}
          size={p.size}
          angle={p.angle}
          distance={p.distance}
        />
      ))}
    </div>
  );
}

// ============================================================
// Main AchievementPopup Component
// ============================================================

export default function AchievementPopup() {
  const { showAchievement, dismissAchievement } = useGameStore();

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (showAchievement) {
      const timer = setTimeout(() => {
        dismissAchievement();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAchievement, dismissAchievement]);

  const handleClick = useCallback(() => {
    dismissAchievement();
  }, [dismissAchievement]);

  return (
    <AnimatePresence>
      {showAchievement && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-label="Badge achievement unlocked"
          aria-modal="true"
        >
          {/* Semi-transparent dark overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Badge Card */}
          <motion.div
            className="relative z-10 w-full max-w-sm"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: 0.1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="overflow-visible border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-amber-900/30 dark:via-slate-800 dark:to-amber-900/30 shadow-2xl shadow-amber-500/20">
              <CardContent className="p-6 sm:p-8">
                {/* Close button */}
                <button
                  onClick={handleClick}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Dismiss achievement"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <motion.div
                  className="text-center mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="text-xs sm:text-sm font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                      Badge Unlocked!
                    </span>
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                </motion.div>

                {/* Badge Icon with sparkle ring */}
                <div className="relative flex items-center justify-center py-4">
                  <SparkleRing />

                  {/* Glow background */}
                  <motion.div
                    className="absolute w-24 h-24 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0) 70%)',
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Badge emoji */}
                  <motion.span
                    className="relative text-6xl sm:text-7xl block"
                    role="img"
                    aria-label={showAchievement.name}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      scale: {
                        delay: 0.5,
                        type: 'spring',
                        stiffness: 300,
                        damping: 10,
                      },
                      rotate: {
                        delay: 1.5,
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      },
                    }}
                  >
                    {showAchievement.icon}
                  </motion.span>
                </div>

                {/* Badge Name */}
                <motion.div
                  className="text-center mt-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 mb-1">
                    {showAchievement.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
                    {showAchievement.description}
                  </p>
                </motion.div>

                {/* Requirement info */}
                <motion.div
                  className="text-center mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="inline-block text-xs text-amber-600/70 dark:text-amber-400/60 bg-amber-100/50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                    🏆 {showAchievement.requirement}
                  </span>
                </motion.div>

                {/* Dismiss hint */}
                <motion.p
                  className="text-center mt-5 text-xs text-slate-400 dark:text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Click anywhere to continue
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
