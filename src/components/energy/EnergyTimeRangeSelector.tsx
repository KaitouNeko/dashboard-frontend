import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronDown, CalendarDays } from "lucide-react";

interface EnergyTimeRangeSelectorProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  setDateRange: React.Dispatch<
    React.SetStateAction<{
      from: Date;
      to: Date;
    }>
  >;
  onSubmit: () => void;
}

export function EnergyTimeRangeSelector({
  dateRange,
  setDateRange,
  onSubmit,
}: EnergyTimeRangeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // 處理日期變更
  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;

    const currentFrom = dateRange.from;
    const currentTo = dateRange.to;

    if (!currentFrom || (currentFrom && currentTo)) {
      // 如果沒有起始日期或已經有完整的日期範圍，重新開始選擇
      setDateRange({
        from: date,
        to: date,
      });
    } else {
      // 如果已經有起始日期，設定結束日期
      if (date < currentFrom) {
        // 如果選擇的日期在起始日期之前，交換順序
        setDateRange({
          from: date,
          to: currentFrom,
        });
      } else {
        setDateRange({
          from: currentFrom,
          to: date,
        });
      }
    }
  };

  const handleSubmit = () => {
    setIsOpen(false);
    onSubmit();
  };

  // 快速選擇按鈕
  const predefinedRanges = [
    { label: "今天", days: 0 },
    { label: "昨天", days: 1 },
    { label: "過去 7 天", days: 7 },
    { label: "過去 30 天", days: 30 },
    { label: "過去 90 天", days: 90 },
  ];

  // 快速選擇處理
  const handlePredefinedRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    // 如果是今天或昨天，只顯示當天數據
    if (days <= 1) {
      to.setHours(23, 59, 59, 999);
      from.setHours(0, 0, 0, 0);
    }
    
    setDateRange({ from, to });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[240px] justify-start text-left font-normal"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>
              {format(dateRange.from, "yyyy/MM/dd")} -{" "}
              {format(dateRange.to, "yyyy/MM/dd")}
            </span>
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-2 p-3">
            <div className="grid grid-cols-5 gap-2">
              {predefinedRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handlePredefinedRange(range.days)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
            <div className="rounded-md border">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(value) => {
                  if (value?.from) {
                    setDateRange({
                      from: value.from,
                      to: value.to || value.from,
                    });
                  }
                }}
                numberOfMonths={2}
                defaultMonth={dateRange.from}
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSubmit}>
                套用
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 