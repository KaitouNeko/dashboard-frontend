"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// 頁面變化的變體定義
const variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    filter: "blur(10px)",
    scale: 0.98
  },
  enter: { 
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1], // cubic-bezier
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0,
    y: -10,
    filter: "blur(8px)",
    scale: 0.98,
    transition: { 
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// 特殊頁面的簡單變體（用於資料儀表板等頁面）
const simpleVariants = {
  hidden: { 
    opacity: 0,
    y: 0,
  },
  enter: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    y: 0,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// 頁面切換特效，增加動態性
const pageTransitionEffect = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

export default function PageTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  
  // 判斷是否為需要特殊處理的頁面
  const isSpecialPage = 
    pathname.includes("/dashboard/energy-dashboard") || 
    pathname.includes("/dashboard/equipment-monitoring");
  
  // 根據頁面選擇不同的變體和過渡設定
  const currentVariants = isSpecialPage ? simpleVariants : variants;

  return (
    <>
      <AnimatePresence mode='wait' initial={false}>
        <motion.div
          key={pathname}
          initial="hidden"
          animate="enter"
          exit="exit"
          variants={currentVariants}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      
      {/* 頁面切換特效覆蓋層 - 僅用於非特殊頁面 */}
      {!isSpecialPage && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`overlay-${pathname}`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransitionEffect}
            className="pointer-events-none fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            style={{ display: 'none' }} // 在開發時先隱藏，需要時可啟用
          />
        </AnimatePresence>
      )}
    </>
  );
}
