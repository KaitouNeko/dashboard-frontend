"use client";

import { ReactNode } from "react";
import { motion } from 'framer-motion';

/**
 * 淡入淡出動畫容器
 */
export const FadeIn = ({ 
  children,
  duration = 0.5,
  delay = 0,
  className = ""
}: { 
  children: ReactNode,
  duration?: number,
  delay?: number,
  className?: string
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 滑入動畫容器
 */
export const SlideIn = ({ 
  children,
  direction = "left",
  duration = 0.5,
  delay = 0,
  distance = 20,
  className = ""
}: { 
  children: ReactNode,
  direction?: "left" | "right" | "up" | "down",
  duration?: number,
  delay?: number,
  distance?: number,
  className?: string
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "left": return { x: -distance, y: 0 };
      case "right": return { x: distance, y: 0 };
      case "up": return { x: 0, y: -distance };
      case "down": return { x: 0, y: distance };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...getInitialPosition() }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 縮放動畫容器
 */
export const ScaleIn = ({ 
  children,
  duration = 0.5,
  delay = 0,
  initialScale = 0.8,
  className = ""
}: { 
  children: ReactNode,
  duration?: number,
  delay?: number,
  initialScale?: number,
  className?: string
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: initialScale }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 動畫卡片組件
 */
export const AnimatedCard = ({ 
  children,
  duration = 0.5,
  delay = 0,
  className = ""
}: { 
  children: ReactNode,
  duration?: number,
  delay?: number,
  className?: string
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 動畫列表項組件，用於列表的每個項目，提供層疊動畫效果
 */
export const AnimatedListItem = ({ 
  children,
  index = 0,
  staggerDuration = 0.1,
  baseDuration = 0.5,
  className = ""
}: { 
  children: ReactNode,
  index?: number,
  staggerDuration?: number,
  baseDuration?: number,
  className?: string
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ 
        duration: baseDuration,
        delay: index * staggerDuration
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}; 