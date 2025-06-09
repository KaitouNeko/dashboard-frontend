"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// 容器變體
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// 項目變體 - 用於內容中的子元素
const itemVariants = {
  hidden: { 
    y: 20,
    opacity: 0,
    filter: "blur(3px)"
  },
  show: { 
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

// 頁面內容包裝器 - 將頁面內容分成可以有序動畫的部分
export function TransitionWrapper({ 
  children,
  className = ""
}: { 
  children: ReactNode,
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

// 可以用來包裝頁面中的各個區塊，如標題、卡片等
export function TransitionItem({ 
  children,
  className = "",
  delay = 0
}: { 
  children: ReactNode,
  className?: string,
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      transition={{
        delay
      }}
    >
      {children}
    </motion.div>
  );
} 