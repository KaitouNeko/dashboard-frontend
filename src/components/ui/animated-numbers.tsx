"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';

/**
 * 簡單的數字動畫組件，具有淡入淡出和移動效果
 */
export const AnimatedNumber = ({ 
  value, 
  suffix = '' 
}: { 
  value: string | number, 
  suffix?: string
}) => {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
      >
        {value}{suffix}
      </motion.span>
    </AnimatePresence>
  );
};

/**
 * 帶有計數效果的數字動畫組件，數字從初始值平滑過渡到目標值
 */
export const CountUpNumber = ({ 
  value, 
  suffix = '', 
  decimals = 1,
  duration = 1
}: { 
  value: number, 
  suffix?: string,
  decimals?: number,
  duration?: number 
}) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    duration: duration * 1000,
    bounce: 0
  });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionValue.set(Number(value) || 0);
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.onChange(latest => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <span>
      {displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

/**
 * 數字切換效果組件，適合價格、計數器等變化顯示
 */
export const SwitchingNumber = ({ 
  value, 
  suffix = '',
  prefix = '',
}: { 
  value: string | number,
  suffix?: string,
  prefix?: string,
}) => {
  return (
    <div className="flex items-center">
      {prefix && <span>{prefix}</span>}
      <AnimatePresence mode="popLayout">
        {String(value).split('').map((digit, index) => (
          <motion.span
            key={`${index}-${digit}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="inline-block"
          >
            {digit}
          </motion.span>
        ))}
      </AnimatePresence>
      {suffix && <span>{suffix}</span>}
    </div>
  );
};

/**
 * 漸進式統計數字組件，從零增長到目標值，具有彈性效果
 */
export const StatNumber = ({
  value,
  suffix = '',
  duration = 1.5,
  delay = 0
}: {
  value: number,
  suffix?: string,
  duration?: number,
  delay?: number
}) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    duration: duration * 1000,
    bounce: 0.25
  });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // 添加延遲以協調多個元素的動畫
    const timer = setTimeout(() => {
      motionValue.set(Number(value) || 0);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [motionValue, value, delay]);

  useEffect(() => {
    const unsubscribe = springValue.onChange(latest => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      {displayValue}{suffix}
    </motion.div>
  );
}; 