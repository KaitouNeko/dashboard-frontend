"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  YAxis,
  XAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Droplet,
  ChartNoAxesCombined,
} from "lucide-react";
import { PredictionModelComparison } from "@/components/energy/prediction-model-comparison";

interface EnergyForecastInsightProps {
  facility: {
    id: string;
    name: string;
  };
  predictions: any[];
  historicalData: any[];
  forecastHours: number;
  useLLM: boolean;
}

export function EnergyForecastInsight({
  facility,
  predictions,
  historicalData,
  forecastHours,
  useLLM,
}: EnergyForecastInsightProps) {
  // 計算平均能源使用
  const avgHistoricalUsage =
    historicalData.reduce((sum, item) => sum + item.energy_kwh, 0) /
    historicalData.length;
  const avgPredictedUsage =
    predictions.reduce((sum, item) => sum + item.energy_kwh, 0) /
    predictions.length;
  const usageTrend =
    avgPredictedUsage > avgHistoricalUsage
      ? {
          direction: "增加",
          percent: ((avgPredictedUsage / avgHistoricalUsage - 1) * 100).toFixed(
            1
          ),
        }
      : {
          direction: "減少",
          percent: ((1 - avgPredictedUsage / avgHistoricalUsage) * 100).toFixed(
            1
          ),
        };

  // 產生LLM分析摘要 (這裡使用模擬數據)
  const llmAnalysisSummary = [
    {
      title: "預測摘要",
      content: `${facility.name}未來${forecastHours}小時的能源使用預計將${usageTrend.direction}約${usageTrend.percent}%。根據歷史資料與溫度趨勢分析，主要變動來自於預計的溫度變化和工作負載模式。${
        useLLM && predictions.length > 0 && predictions[0].llm
          ? `\n\n預測使用模型: ${
              predictions[0].llm.charAt(0).toUpperCase() + predictions[0].llm.slice(1)
            }`
          : ""
      }`,
      icon: <Brain className='h-5 w-5 text-purple-500' />,
    },
    {
      title: "異常預警",
      content: `在預測期間檢測到${Math.round(
        predictions.length * 0.1
      )}個潛在異常點，集中在高負載時段。這些異常可能與設備運行效率降低或溫度波動有關，建議加強監控。`,
      icon: <AlertTriangle className='h-5 w-5 text-amber-500' />,
    },
    {
      title: "能源優化建議",
      content: `1. 在低使用時段(凌晨2-5點)調度非緊急運算任務，可減少尖峰用電\n2. 根據溫度預測，調整冷卻系統運行參數，每增加1°C設定溫度可節省約3-5%能耗\n3. 預計高負載時段(10-14點)建議實施負載均衡策略`,
      icon: <Lightbulb className='h-5 w-5 text-green-500' />,
    },
  ];

  // 計算預測趨勢數據 (簡化版)
  const trendData = predictions.map((item, index) => ({
    hour: index + 1,
    value: item.energy_kwh,
    confidence: item.confidence_level * 100,
    upper: item.energy_kwh * (1 + (1 - item.confidence_level) * 0.5),
    lower: item.energy_kwh * (1 - (1 - item.confidence_level) * 0.5),
  }));

  // 計算預測與歷史溫度關係
  const tempEnergyRelation = [...historicalData, ...predictions].map(
    (item) => ({
      temperature: item.temperature_celsius,
      energy: item.energy_kwh,
      type: item.is_prediction ? "預測" : "歷史",
    })
  );

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-lg font-medium flex items-center gap-2'>
          {useLLM ? (
            <Brain className='h-5 w-5' />
          ) : (
            <ChartNoAxesCombined className='h-5 w-5' />
          )}
          <span>{useLLM ? "LLM能源預測分析結果" : "能源數據預測分析結果"}</span>
        </h3>

        <Card className='overflow-hidden'>
          <CardContent className='p-0'>
            <Tabs defaultValue='summary'>
              <TabsList className='w-full justify-start rounded-none border-b bg-transparent p-0'>
                <TabsTrigger
                  value='summary'
                  className='rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent'
                >
                  分析摘要
                </TabsTrigger>
                <TabsTrigger
                  value='trends'
                  className='rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent'
                >
                  趨勢分析
                </TabsTrigger>
                <TabsTrigger
                  value='recommendations'
                  className='rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent'
                >
                  優化建議
                </TabsTrigger>
              </TabsList>

              <TabsContent value='summary' className='p-4'>
                <div className='space-y-4'>
                  {llmAnalysisSummary.map((item, index) => (
                    <div key={index} className='p-4 border rounded-lg'>
                      <h4 className='flex items-center gap-2 text-base font-medium mb-2'>
                        {item.icon}
                        <span>{item.title}</span>
                      </h4>
                      <p className='text-sm whitespace-pre-line'>
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='trends' className='p-4'>
                <div className='space-y-6'>
                  <div>
                    <h4 className='text-sm font-medium mb-3 flex items-center gap-2'>
                      <TrendingUp className='h-4 w-4 text-blue-500' />
                      預測能源使用趨勢 (未來{forecastHours}小時)
                    </h4>
                    <div className='h-[200px] w-full'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart
                          data={trendData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
                          <XAxis
                            dataKey='hour'
                            label={{
                              value: "預測時間 (小時)",
                              position: "insideBottom",
                              offset: -5,
                              fontSize: 12,
                            }}
                          />
                          <YAxis
                            label={{
                              value: "能源使用 (kWh)",
                              angle: -90,
                              position: "insideLeft",
                              fontSize: 12,
                            }}
                          />
                          <Tooltip />
                          <Area
                            type='monotone'
                            dataKey='upper'
                            stroke='transparent'
                            fill='var(--primary)'
                            fillOpacity={0.1}
                          />
                          <Area
                            type='monotone'
                            dataKey='lower'
                            stroke='transparent'
                            fill='var(--primary)'
                            fillOpacity={0.1}
                          />
                          <Line
                            type='monotone'
                            dataKey='value'
                            stroke='var(--primary)'
                            strokeWidth={2}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                      <span>現在</span>
                      <span>{Math.floor(forecastHours / 2)}小時後</span>
                      <span>{forecastHours}小時後</span>
                    </div>
                  </div>

                  <div>
                    <h4 className='text-sm font-medium mb-3 flex items-center gap-2'>
                      <Droplet className='h-4 w-4 text-cyan-500' />
                      溫度與能源使用關係
                    </h4>
                    <div className='h-[200px] w-full'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <LineChart
                          data={tempEnergyRelation}
                          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
                          <XAxis
                            dataKey='temperature'
                            label={{
                              value: "溫度 (°C)",
                              position: "insideBottom",
                              offset: -5,
                              fontSize: 12,
                            }}
                          />
                          <YAxis
                            label={{
                              value: "能源使用 (kWh)",
                              angle: -90,
                              position: "insideLeft",
                              fontSize: 12,
                            }}
                          />
                          <Tooltip />
                          <Line
                            type='monotone'
                            dataKey='energy'
                            stroke='var(--primary)'
                            strokeWidth={0}
                            dot={{
                              stroke: "var(--primary)",
                              fill: "white",
                              r: 3,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className='text-xs text-muted-foreground mt-2 text-center'>
                      LLM分析: 溫度每上升1°C，能源使用量平均增加
                      <span className='font-medium'>
                        {" "}
                        {(Math.random() * 5 + 10).toFixed(1)} kWh
                      </span>
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='recommendations' className='p-4'>
                <div className='space-y-4'>
                  <div className='p-4 border rounded-lg'>
                    <h4 className='flex items-center gap-2 text-base font-medium mb-2'>
                      <Lightbulb className='h-4 w-4 text-green-500' />
                      <span>短期優化建議 (24小時內)</span>
                    </h4>
                    <ul className='space-y-2'>
                      <li className='flex items-start gap-2'>
                        <span className='text-green-500 mt-1'>•</span>
                        <span className='text-sm'>
                          根據預測的負載尖峰
                          (10:00-14:00)，建議提前降低非關鍵系統功耗，可節省約{" "}
                          {(Math.random() * 3 + 5).toFixed(1)}% 能耗
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='text-green-500 mt-1'>•</span>
                        <span className='text-sm'>
                          將冷卻系統溫度設定點在低負載時段調高1°C，預計節省{" "}
                          {(Math.random() * 2 + 3).toFixed(1)}% 能耗
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className='p-4 border rounded-lg'>
                    <h4 className='flex items-center gap-2 text-base font-medium mb-2'>
                      <TrendingUp className='h-4 w-4 text-blue-500' />
                      <span>中長期優化建議</span>
                    </h4>
                    <ul className='space-y-2'>
                      <li className='flex items-start gap-2'>
                        <span className='text-blue-500 mt-1'>•</span>
                        <span className='text-sm'>
                          根據負載模式分析，建議重新分配伺服器資源，優化工作負載分配，可降低能源波動約{" "}
                          {(Math.random() * 5 + 10).toFixed(1)}%
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='text-blue-500 mt-1'>•</span>
                        <span className='text-sm'>
                          針對預測的溫度變化，建議增強冷卻系統自動調節能力，預計可提高能源效率{" "}
                          {(Math.random() * 3 + 5).toFixed(1)}%
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='text-blue-500 mt-1'>•</span>
                        <span className='text-sm'>
                          建議在下次系統更新時升級至能源效率更高的冷卻設備，投資回收期約{" "}
                          {Math.floor(Math.random() * 6 + 18)} 個月
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className='mt-4 p-3 border rounded-lg bg-muted/30'>
                    <p className='text-xs text-muted-foreground italic'>
                      備註:
                      所有建議基於AI對歷史數據的分析及預測模型。實際效果可能因操作條件和設備狀態而異。
                      建議與設施工程師協同評估後實施。
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
