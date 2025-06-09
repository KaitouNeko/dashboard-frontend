"use client";

import { format, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { Info, LockKeyhole } from "lucide-react";
import { useState } from "react";

interface EnergyUsageChartProps {
  historyData: any[];
  predictedData: any[];
  height?: number;
  useLLM: boolean;
}

export function EnergyUsageChart({
  historyData,
  predictedData,
  height = 300,
  useLLM,
}: EnergyUsageChartProps) {
  const [showInsights, setShowInsights] = useState(false);

  // 先對歷史和預測數據進行排序，確保按時間順序
  const sortedHistoryData = [...historyData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const sortedPredictedData = [...predictedData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 合併歷史數據和預測數據
  const combinedData = [
    ...sortedHistoryData.map((item) => ({
      ...item,
      date: parseISO(item.timestamp),
      type: "歷史",
      formattedTime: format(parseISO(item.timestamp), "MM/dd HH:00", {
        locale: zhTW,
      }),
    })),
    ...sortedPredictedData.map((item) => ({
      ...item,
      date: parseISO(item.timestamp),
      type: "預測",
      formattedTime: format(parseISO(item.timestamp), "MM/dd HH:00", {
        locale: zhTW,
      }),
      // 加入置信區間計算
      upper_bound_kwh:
        item.energy_kwh * (1 + (1 - (item.confidence_level || 0.8)) * 0.5),
      lower_bound_kwh:
        item.energy_kwh * (1 - (1 - (item.confidence_level || 0.8)) * 0.5),
    })),
  ];

  // 確保數據按時間排序
  combinedData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // 格式化x軸標籤
  const formatXAxis = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      return format(date, "MM/dd HH:00", { locale: zhTW });
    } catch (e) {
      return timestamp;
    }
  };

  // 決定要顯示哪些X軸標籤，確保均勻分佈
  const totalPoints = combinedData.length;
  const maxLabels = 8; // 最多顯示的標籤數
  const step = Math.max(1, Math.floor(totalPoints / maxLabels));

  const ticks = [];
  for (let i = 0; i < totalPoints; i += step) {
    if (combinedData[i]) {
      ticks.push(combinedData[i].date.getTime());
    }
  }
  // 確保最後一個點也被包含
  if (
    combinedData.length > 0 &&
    ticks[ticks.length - 1] !== combinedData[totalPoints - 1].date.getTime()
  ) {
    ticks.push(combinedData[totalPoints - 1].date.getTime());
  }

  // 格式化工具提示
  const renderTooltip = (props: any) => {
    const { active, payload } = props;

    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div
          className='glass-effect border shadow-md p-3 rounded-md'
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p className='font-medium'>
            {format(data.date, "yyyy/MM/dd HH:00", { locale: zhTW })}
          </p>
          <p className='text-sm mt-1'>
            <span className='font-medium'>能源使用: </span>
            <span>{data.energy_kwh.toLocaleString()} kWh</span>
          </p>
          {data.type === "預測" && data.upper_bound_kwh && (
            <p className='text-sm'>
              <span className='font-medium'>預測區間: </span>
              <span>
                {data.lower_bound_kwh.toFixed(1)} -{" "}
                {data.upper_bound_kwh.toFixed(1)} kWh
              </span>
            </p>
          )}
          <p className='text-sm'>
            <span className='font-medium'>溫度: </span>
            <span>{data.temperature_celsius}°C</span>
          </p>
          <p className='text-sm'>
            <span className='font-medium'>濕度: </span>
            <span>{data.humidity_percent}%</span>
          </p>
          {data.is_prediction && (
            <p className='text-sm text-muted-foreground mt-1'>
              預測置信度: {(data.confidence_level * 100).toFixed(0)}%
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  // 找出歷史數據和預測數據的分界點
  const predictionStartIndex = combinedData.findIndex(
    (item) => item.is_prediction
  );

  // 模擬LLM生成的預測洞察
  const aiInsights = [
    "根據溫度預測的變化趨勢，未來24小時的能源消耗將保持在平均水平上下10%的範圍內",
    "能源使用高峰將出現在每日10:00-14:00，建議此時段進行負載均衡",
    "預測結果顯示週末能源使用量將下降約15%，可考慮調整冷卻系統參數",
  ];

  // 能源使用異常點識別
  const anomalyPoints = combinedData
    .filter((item) => item.type === "預測" && Math.random() > 0.8) // 隨機選取一些點作為異常點
    .map((item) => ({
      timestamp: item.timestamp,
      value: item.energy_kwh,
    }));

  return (
    <div className='relative'>
      {/* AI洞察顯示按鈕 */}
      <button
        className='absolute top-0 right-0 z-10 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary p-1 rounded-md'
        onClick={() => setShowInsights(!showInsights)}
      >
        {useLLM ? (
          <Info className='h-4 w-4' />
        ) : (
          <LockKeyhole className='h-4 w-4' />
        )}
        <span>AI 分析</span>
      </button>

      {/* AI洞察面板 */}
      {useLLM && showInsights && (
        <div
          className='absolute top-8 right-0 z-20 w-64 p-3 rounded-md glass-effect border shadow-md'
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h4 className='text-sm font-medium mb-2'>"LLM能源預測分析"</h4>
          <ul className='text-xs space-y-2'>
            {aiInsights.map((insight, index) => (
              <li key={index} className='flex items-start gap-2'>
                <span className='text-primary'>•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ResponsiveContainer width='100%' height={height}>
        <ComposedChart
          data={combinedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
          <XAxis
            dataKey='date'
            type='number'
            domain={["dataMin", "dataMax"]}
            tickFormatter={(unixTime) =>
              format(new Date(unixTime), "MM/dd HH:00", { locale: zhTW })
            }
            ticks={ticks}
            tick={{ fontSize: 11 }}
            angle={-15}
            tickMargin={10}
            height={60}
            stroke='var(--border)'
          />
          <YAxis
            yAxisId='left'
            tick={{ fontSize: 12 }}
            tickMargin={8}
            domain={["auto", "auto"]}
            label={{
              value: "能源使用 (kWh)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
              offset: 0,
              fontSize: 12,
            }}
            stroke='var(--border)'
          />
          <YAxis
            yAxisId='right'
            orientation='right'
            domain={[10, 40]}
            tick={{ fontSize: 12 }}
            tickMargin={8}
            label={{
              value: "溫度 (°C)",
              angle: 90,
              position: "insideRight",
              style: { textAnchor: "middle" },
              offset: 0,
              fontSize: 12,
            }}
            stroke='var(--border)'
          />
          <Tooltip content={renderTooltip} />
          <Legend />

          {/* 歷史能源使用 */}
          <Line
            yAxisId='left'
            type='monotone'
            dataKey='energy_kwh'
            name='歷史能源使用'
            stroke='var(--metrics-load-text)'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: "var(--metrics-load-text)" }}
            connectNulls
            data={combinedData.slice(
              0,
              predictionStartIndex > 0 ? predictionStartIndex : undefined
            )}
          />

          {/* 預測能源使用 (虛線) */}
          {predictionStartIndex > 0 && (
            <>
              {/* 預測能源使用置信區間 */}
              <Area
                yAxisId='left'
                type='monotone'
                dataKey='upper_bound_kwh'
                stroke='transparent'
                fill='var(--metrics-load-text)'
                fillOpacity={0.1}
                data={combinedData.slice(predictionStartIndex)}
              />
              <Area
                yAxisId='left'
                type='monotone'
                dataKey='lower_bound_kwh'
                stroke='transparent'
                fill='var(--metrics-load-text)'
                fillOpacity={0.1}
                data={combinedData.slice(predictionStartIndex)}
              />

              {/* 預測線 */}
              <Line
                yAxisId='left'
                type='monotone'
                dataKey='energy_kwh'
                name={`AI預測能源使用 ${useLLM && combinedData.slice(predictionStartIndex).length > 0 && combinedData.slice(predictionStartIndex)[0].llm ? `(${combinedData.slice(predictionStartIndex)[0].llm})` : ''}`}
                stroke='var(--metrics-load-text)'
                strokeWidth={2}
                strokeDasharray='5 5'
                dot={false}
                activeDot={{ r: 6, fill: "var(--metrics-load-text)" }}
                connectNulls
                data={combinedData.slice(predictionStartIndex)}
              />
            </>
          )}

          {/* 溫度 */}
          <Line
            yAxisId='right'
            type='monotone'
            dataKey='temperature_celsius'
            name='溫度'
            stroke='var(--metrics-temperature-text)'
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: "var(--metrics-temperature-text)" }}
          />

          {/* 預測分界線 */}
          {predictionStartIndex > 0 && (
            <ReferenceLine
              x={combinedData[predictionStartIndex].date.getTime()}
              yAxisId='left'
              stroke='var(--border)'
              strokeDasharray='3 3'
              label={{
                value: "預測開始",
                position: "top",
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
            />
          )}

          {/* 異常點標記 */}
          {anomalyPoints.map((point, index) => (
            <ReferenceLine
              key={index}
              x={parseISO(point.timestamp).getTime()}
              yAxisId='left'
              stroke='var(--destructive)'
              strokeWidth={1}
              strokeDasharray='3 3'
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
