"use client";

import { format, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LucideArrowUpRight, LucideChevronDown, LucideChevronUp } from 'lucide-react';

interface EnergyStatisticsPanelProps {
  statistics: any;
}

export function EnergyStatisticsPanel({ statistics }: EnergyStatisticsPanelProps) {
  if (!statistics) return null;
  
  // 格式化日期標籤
  const formatDateLabel = (date: string) => {
    try {
      return format(parseISO(date), 'M/d (EEE)', { locale: zhTW });
    } catch (e) {
      return date;
    }
  };
  
  // 格式化詳細日期時間
  const formatDateTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'yyyy/MM/dd HH:00', { locale: zhTW });
    } catch (e) {
      return timestamp;
    }
  };
  
  // 整理每日平均數據用於圖表
  const dailyData = statistics.daily_averages.map((day: any) => ({
    date: day.date,
    average: day.average
  }));
  
  return (
    <div className="space-y-6">
      {/* 效率指標 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-md p-3 glass-effect highlight-edge" style={{ 
          backgroundColor: 'var(--metrics-load-bg)',
          borderColor: 'var(--metrics-load-text)',
          borderWidth: '1px' 
        }}>
          <div className="text-sm mb-1" style={{ color: 'var(--metrics-load-text)', opacity: 0.8 }}>尖峰用電時間</div>
          <div className="text-lg font-semibold" style={{ color: 'var(--metrics-load-text)' }}>
            {formatDateTime(statistics.peak_usage.timestamp)}
          </div>
          <div className="flex items-center text-sm mt-1" style={{ color: 'var(--metrics-load-text)' }}>
            <LucideChevronUp className="h-4 w-4 mr-1" />
            高於平均 {((statistics.peak_usage.energy_kwh / statistics.average_hourly_kwh - 1) * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="border rounded-md p-3 glass-effect highlight-edge" style={{ 
          backgroundColor: 'var(--metrics-efficiency-bg)',
          borderColor: 'var(--metrics-efficiency-text)',
          borderWidth: '1px' 
        }}>
          <div className="text-sm mb-1" style={{ color: 'var(--metrics-efficiency-text)', opacity: 0.8 }}>最低用電時間</div>
          <div className="text-lg font-semibold" style={{ color: 'var(--metrics-efficiency-text)' }}>
            {formatDateTime(statistics.lowest_usage.timestamp)}
          </div>
          <div className="flex items-center text-sm mt-1" style={{ color: 'var(--metrics-efficiency-text)' }}>
            <LucideChevronDown className="h-4 w-4 mr-1" />
            低於平均 {((1 - statistics.lowest_usage.energy_kwh / statistics.average_hourly_kwh) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* 每日平均用電量圖表 */}
      <div className="card-hover-effect">
        <div className="text-sm font-medium gradient-text mb-2">每日平均用電量</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 0, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 12 }}
              tickMargin={8}
            />
            <YAxis 
              width={50}
              tick={{ fontSize: 12 }}
              tickMargin={8}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: any) => [`${value.toLocaleString()} kWh`, '平均用電']}
              labelFormatter={formatDateLabel}
            />
            <Bar 
              dataKey="average" 
              fill="var(--primary)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* 優化建議 */}
      <div>
        <div className="text-sm font-medium gradient-text mb-2">優化建議</div>
        <div className="border rounded-md overflow-hidden glass-effect">
          <div className="border-b p-3" style={{ 
            backgroundColor: 'var(--metrics-vibration-bg)', 
            borderColor: 'var(--metrics-vibration-text)',
            borderWidth: '0 0 1px 0'
          }}>
            <div className="flex items-start">
              <LucideArrowUpRight className="h-5 w-5 mr-2 mt-0.5" style={{ color: 'var(--metrics-vibration-text)' }} />
              <div>
                <div className="font-medium" style={{ color: 'var(--metrics-vibration-text)' }}>提高數據中心平均溫度1°C</div>
                <div className="text-sm mt-1" style={{ color: 'var(--metrics-vibration-text)', opacity: 0.8 }}>
                  可節省約 {(statistics.average_hourly_kwh * 0.03 * 24).toFixed(0)} kWh/天 (3%)
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3" style={{ 
            backgroundColor: 'var(--metrics-efficiency-bg)',
            borderColor: 'var(--metrics-efficiency-text)'
          }}>
            <div className="flex items-start">
              <LucideArrowUpRight className="h-5 w-5 mr-2 mt-0.5" style={{ color: 'var(--metrics-efficiency-text)' }} />
              <div>
                <div className="font-medium" style={{ color: 'var(--metrics-efficiency-text)' }}>優化非工作時間的伺服器配置</div>
                <div className="text-sm mt-1" style={{ color: 'var(--metrics-efficiency-text)', opacity: 0.8 }}>
                  夜間和週末可節省約 {(statistics.average_hourly_kwh * 0.15 * 10).toFixed(0)} kWh/週
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 