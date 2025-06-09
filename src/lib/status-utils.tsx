import React from "react";
import { cn } from "./utils";
import { Badge } from "@/components/ui/badge";

/**
 * 設備狀態類型定義
 */
export type EquipmentStatus = "normal" | "warning" | "critical";

/**
 * 取得設備狀態標籤的樣式
 * @param status 設備狀態 ("normal" | "warning" | "critical")
 * @returns 返回狀態對應的樣式類名
 */
export function getStatusBadge(status: EquipmentStatus) {
  switch (status) {
    case "normal":
      return "bg-[var(--status-normal-bg)] text-[var(--status-normal-text)] border-transparent";
    case "warning":
      return "bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-text)]";
    case "critical":
      return "bg-[var(--status-critical-bg)] text-[var(--status-critical-text)] border-transparent";
    default:
      return "bg-[var(--status-normal-bg)] text-[var(--status-normal-text)] border-transparent";
  }
}

/**
 * 狀態標籤元件
 * 用於顯示設備狀態標籤
 */
export function StatusBadge({
  status,
  className,
  children,
}: {
  status: EquipmentStatus;
  className?: string;
  children?: React.ReactNode;
}) {
  const badgeClass = getStatusBadge(status);
  const variant = status === "warning" ? "outline" : "default";
  
  return (
    <Badge 
      variant={variant} 
      className={cn(badgeClass, className)}
    >
      {children || getDefaultLabel(status)}
    </Badge>
  );
}

/**
 * 獲取默認標籤文字
 */
function getDefaultLabel(status: EquipmentStatus): string {
  switch (status) {
    case "normal":
      return "運行正常";
    case "warning":
      return "需要注意";
    case "critical":
      return "狀態危急";
    default:
      return "運行正常";
  }
} 