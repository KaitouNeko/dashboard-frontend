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
} from "recharts";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ApiService } from "@/lib/api-service";

interface PredictionModelComparisonProps {
  historyData: any[];
  modelPredictions: {
    standard: any[];
    gemini: any[];
    openai: any[];
    [key: string]: any[];
  };
  selectedLLM: string;
  forecastHours: number;
  onModelDataRequest?: (modelName: string, data: any[]) => void;
}

export function PredictionModelComparison({
  historyData,
  modelPredictions,
  selectedLLM,
  forecastHours,
  onModelDataRequest
}: PredictionModelComparisonProps) {
  const [showModels, setShowModels] = useState({
    standard: true,
    gemini: true,
    openai: true,
  });
  
  // 追蹤各個模型的載入狀態
  const [loadingStates, setLoadingStates] = useState({
    gemini: false,
    openai: false
  });

  // 記錄不同時長的預測數據
  // key格式為 "modelName-forecastHours"，例如: "gemini-24"
  const [cachedPredictions, setCachedPredictions] = useState<{
    [key: string]: any[];
  }>({});

  // 組件掛載時初始化緩存
  useEffect(() => {
    // 將現有預測結果加入緩存
    const initialCache: {[key: string]: any[]} = {};
    Object.keys(modelPredictions).forEach(modelName => {
      if (modelPredictions[modelName].length > 0) {
        const cacheKey = `${modelName}-${forecastHours}`;
        initialCache[cacheKey] = modelPredictions[modelName];
      }
    });
    setCachedPredictions(initialCache);
  }, []);

  // 處理模型顯示切換
  const toggleModel = async (model: string) => {
    if (model !== 'standard' && !showModels[model as keyof typeof showModels]) {
      // 如果是啟用 LLM 模型且該模型沒有數據，則請求數據
      if (modelPredictions[model]?.length === 0 && !loadingStates[model as keyof typeof loadingStates]) {
        await requestModelPrediction(model);
      }
    }
    
    setShowModels((prev) => ({
      ...prev,
      [model]: !prev[model as keyof typeof prev],
    }));
  };
  
  // 請求特定模型的預測數據
  const requestModelPrediction = async (modelName: string) => {
    if (modelName === 'standard' || modelPredictions[modelName]?.length > 0) {
      return; // 標準模型或已有數據不需要請求
    }
    
    // 檢查緩存
    const cacheKey = `${modelName}-${forecastHours}`;
    if (cachedPredictions[cacheKey]?.length > 0) {
      console.log(`使用緩存的 ${modelName} 模型${forecastHours}小時預測數據`);
      if (onModelDataRequest) {
        // 回傳緩存數據給父組件更新
        onModelDataRequest(modelName, cachedPredictions[cacheKey]);
      }
      return;
    }
    
    // 設置載入狀態
    setLoadingStates(prev => ({
      ...prev,
      [modelName]: true
    }));
    
    try {
      console.log(`請求 ${modelName} 模型${forecastHours}小時預測數據...`);
      const predictions = await ApiService.predictEnergyUsageLLM(
        historyData,
        forecastHours,
        modelName
      );
      
      // 緩存結果
      setCachedPredictions(prev => ({
        ...prev,
        [cacheKey]: predictions
      }));
      
      // 通知父元件已請求的數據
      if (onModelDataRequest) {
        // 確保將結果傳回給父組件更新全局緩存
        onModelDataRequest(modelName, predictions);
      }
    } catch (error) {
      console.error(`獲取 ${modelName} 模型預測失敗:`, error);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [modelName]: false
      }));
    }
  };

  // 先對歷史數據進行排序，確保按時間順序
  const sortedHistoryData = historyData && Array.isArray(historyData) ? 
    [...historyData].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ) : [];

  // 為每個模型數據標準化處理
  const processModelData = (modelData: any[], modelName: string) => {
    // 確保 modelData 是有效的數組，否則返回空數組
    if (!modelData || !Array.isArray(modelData) || modelData.length === 0) {
      return [];
    }
    
    return modelData
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .map((item) => ({
        ...item,
        date: parseISO(item.timestamp),
        modelName,
        formattedTime: format(parseISO(item.timestamp), "MM/dd HH:00", {
          locale: zhTW,
        }),
      }));
  };

  // 處理歷史數據
  const processedHistoryData = sortedHistoryData.map((item) => ({
    ...item,
    date: parseISO(item.timestamp),
    modelName: "歷史數據",
    formattedTime: format(parseISO(item.timestamp), "MM/dd HH:00", {
      locale: zhTW,
    }),
  }));

  // 處理各模型預測數據
  const standardData = Array.isArray(modelPredictions.standard) ? 
    processModelData(modelPredictions.standard, "標準模型") : [];
  const geminiData = Array.isArray(modelPredictions.gemini) && modelPredictions.gemini.length > 0 ? 
    processModelData(modelPredictions.gemini, "Gemini") : [];
  const openaiData = Array.isArray(modelPredictions.openai) && modelPredictions.openai.length > 0 ? 
    processModelData(modelPredictions.openai, "OpenAI") : [];

  // 合併所有要顯示的數據
  let combinedData = [...processedHistoryData];
  if (showModels.standard) {
    combinedData = [...combinedData, ...standardData];
  }
  if (showModels.gemini && geminiData.length > 0) {
    combinedData = [...combinedData, ...geminiData];
  }
  if (showModels.openai && openaiData.length > 0) {
    combinedData = [...combinedData, ...openaiData];
  }

  // 確保數據按時間排序
  combinedData.sort((a, b) => a.date.getTime() - b.date.getTime());

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
          {payload.map((entry: any, index: number) => (
            <p key={index} className='text-sm mt-1' style={{ color: entry.color }}>
              <span className='font-medium'>{entry.name}: </span>
              <span>{entry.value.toLocaleString()} kWh</span>
            </p>
          ))}
          <p className='text-sm'>
            <span className='font-medium'>溫度: </span>
            <span>{data.temperature_celsius}°C</span>
          </p>
        </div>
      );
    }

    return null;
  };

  // 找出歷史數據和預測數據的分界點
  const predictionStartIndex = processedHistoryData.length > 0 
    ? combinedData.findIndex(
        (item) => item.date > processedHistoryData[processedHistoryData.length - 1].date
      )
    : -1;

  return (
    <div className='flex flex-col h-full'>
      <div className='flex justify-end gap-3 mb-3'>
        <div className='flex items-center gap-2'>
          <input
            type='checkbox'
            id='standard-model'
            checked={showModels.standard}
            onChange={() => toggleModel('standard')}
            className='h-4 w-4 rounded border-gray-300 text-indigo-600'
          />
          <label htmlFor='standard-model' className='text-sm'>
            標準模型
          </label>
        </div>
        <div className='flex items-center gap-2'>
          <input
            type='checkbox'
            id='gemini-model'
            checked={showModels.gemini}
            disabled={loadingStates.gemini}
            onChange={() => toggleModel('gemini')}
            className='h-4 w-4 rounded border-gray-300 text-indigo-600'
          />
          <label htmlFor='gemini-model' className='text-sm flex items-center'>
            Gemini
            {loadingStates.gemini && (
              <Loader2 className='ml-2 h-3 w-3 animate-spin' />
            )}
          </label>
        </div>
        <div className='flex items-center gap-2'>
          <input
            type='checkbox'
            id='openai-model'
            checked={showModels.openai}
            disabled={loadingStates.openai}
            onChange={() => toggleModel('openai')}
            className='h-4 w-4 rounded border-gray-300 text-indigo-600'
          />
          <label htmlFor='openai-model' className='text-sm flex items-center'>
            OpenAI
            {loadingStates.openai && (
              <Loader2 className='ml-2 h-3 w-3 animate-spin' />
            )}
          </label>
        </div>
        <div className='flex items-center'>
          <p className='text-xs text-muted-foreground ml-2'>
            {forecastHours}小時預測
          </p>
        </div>
      </div>
      <div className='flex-1'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
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
            <Tooltip content={renderTooltip} />
            <Legend />

            {/* 歷史能源使用 */}
            <Line
              type='monotone'
              dataKey='energy_kwh'
              name='歷史數據'
              stroke='#64748b' // 深灰色
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#64748b' }}
              connectNulls
              data={processedHistoryData}
            />

            {/* 標準模型預測 */}
            {showModels.standard && (
              <Line
                type='monotone'
                dataKey='energy_kwh'
                name='標準模型'
                stroke='#10b981' // 綠色
                strokeWidth={2}
                strokeDasharray='5 5'
                dot={false}
                activeDot={{ r: 6, fill: '#10b981' }}
                connectNulls
                data={standardData}
              />
            )}

            {/* Gemini 模型預測 */}
            {showModels.gemini && geminiData.length > 0 && (
              <Line
                type='monotone'
                dataKey='energy_kwh'
                name='Gemini'
                stroke='#8b5cf6' // 紫色
                strokeWidth={2}
                strokeDasharray='5 5'
                dot={false}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
                connectNulls
                data={geminiData}
              />
            )}

            {/* OpenAI 模型預測 */}
            {showModels.openai && openaiData.length > 0 && (
              <Line
                type='monotone'
                dataKey='energy_kwh'
                name='OpenAI'
                stroke='#3b82f6' // 藍色
                strokeWidth={2}
                strokeDasharray='5 5'
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6' }}
                connectNulls
                data={openaiData}
              />
            )}

            {/* 預測分界線 */}
            {predictionStartIndex > 0 && (
              <ReferenceLine
                x={combinedData[predictionStartIndex].date.getTime()}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 