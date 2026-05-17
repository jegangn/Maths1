"use client";
import { motion, AnimatePresence } from "framer-motion";

export function CorrectBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.4, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <div className="w-64 h-64 rounded-full bg-yellow/70" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GentleShake({
  children,
  trigger,
}: {
  children: React.ReactNode;
  trigger: number;
}) {
  return (
    <motion.div
      key={trigger}
      animate={{ rotate: [0, -8, 8, -4, 0] }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export function StuckHint({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-yellow/30 border-2 border-ink/60 rounded-xl p-4 text-lg"
    >
      {message}
    </motion.div>
  );
}
