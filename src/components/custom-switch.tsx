import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CustomSwitchProps {
  labelOn: string;
  labelOff: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  className?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  labelOn,
  labelOff,
  value,
  onValueChange,
  className
}) => {
  return (
    <motion.button
      onClick={() => onValueChange(!value)}
      className={cn(
        "relative flex items-center justify-between",
        "w-32 h-12 rounded-full p-1",
        "bg-gradient-to-br from-slate-200 to-slate-300",
        "dark:from-slate-800 dark:to-slate-900",
        "border-2 border-slate-300/50 dark:border-slate-700/50",
        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.1)]",
        "dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)]",
        "transition-all duration-300 ease-out",
        "hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),0_6px_12px_rgba(0,0,0,0.15)]",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2",
        "active:scale-95",
        className
      )}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      data-state={value ? "on" : "off"}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        animate={{
          opacity: value ? 0.2 : 0,
          background: value 
            ? "linear-gradient(135deg, rgba(34,197,94,0.3), rgba(16,185,129,0.3))"
            : "transparent"
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Inner track */}
      <motion.div
        className={cn(
          "absolute inset-1 rounded-full",
          "bg-gradient-to-br transition-colors duration-500"
        )}
        animate={{
          background: value
            ? "linear-gradient(135deg, rgb(34,197,94), rgb(16,185,129))"
            : "linear-gradient(135deg, rgb(248,250,252), rgb(241,245,249))"
        }}
      />

      {/* Labels */}
      <AnimatePresence mode="wait">
        <motion.span
          key={value ? "on" : "off"}
          className={cn(
            "relative z-10 font-mono text-sm font-semibold tracking-wider",
            "select-none pointer-events-none",
            value ? "text-white/90 ml-2" : "text-slate-600 dark:text-slate-400 mr-2"
          )}
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -5 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            delay: 0.1 
          }}
        >
          {value ? labelOn : labelOff}
        </motion.span>
      </AnimatePresence>

      {/* Knob */}
      <motion.div
        className={cn(
          "relative z-20 w-10 h-10 rounded-full",
          "bg-gradient-to-br from-white to-slate-100",
          "dark:from-slate-100 dark:to-slate-200",
          "border border-slate-200/50 dark:border-slate-300/50",
          "shadow-[0_4px_8px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.8)]",
          "dark:shadow-[0_4px_8px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.9)]"
        )}
        animate={{
          x: value ? 80 : 0,
          rotate: value ? 180 : 0,
          boxShadow: value 
            ? "0 6px 12px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.9)"
            : "0 4px 8px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8)"
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 28,
          mass: 0.8
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Knob highlight */}
        <motion.div
          className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white/60 blur-sm"
          animate={{
            opacity: value ? 0.8 : 0.4
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Knob center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            background: value 
              ? "linear-gradient(135deg, rgb(34,197,94), rgb(16,185,129))"
              : "linear-gradient(135deg, rgb(148,163,184), rgb(100,116,139))"
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={{ scale: 0, opacity: 0.3 }}
        animate={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1.2, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          background: value 
            ? "radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(148,163,184,0.3) 0%, transparent 70%)"
        }}
      />
    </motion.button>
  );
};

export default CustomSwitch;
