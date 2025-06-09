"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  facilities,
  generateHistoricalEnergyData,
  predictEnergyUsage,
  getEnergyAnomalies,
  generateEnergyStatistics,
} from "@/lib/mock-data";
import { EnergyUsageChart } from "@/components/energy/energy-usage-chart";
import { TemperatureChart } from "@/components/energy/temperature-chart";
import { EnergyStatisticsPanel } from "@/components/energy/energy-statistics-panel";
import {
  AlertCircle,
  BarChart4,
  Lightbulb,
  RefreshCw,
  ThermometerSun,
  Zap,
  TrendingUp,
  Droplet,
  FileUp,
  Eye,
  Copy,
  Check,
  FileBarChart,
} from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-containers";
import {
  CountUpNumber,
  AnimatedNumber,
} from "@/components/ui/animated-numbers";
import { TransitionWrapper } from "@/components/ui/transition-wrapper";
import { EnergyForecastInsight } from "@/components/energy/energy-forecast-insight";
import { ApiService } from "@/lib/api-service";
import { PredictionModelComparison } from "@/components/energy/prediction-model-comparison";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

// 定義數據格式接口
interface EnergyDataItem {
  facility_id: string;
  timestamp: string;
  energy_kwh: number;
  humidity_percent: number;
  temperature_celsius: number;
  id?: string;
  is_prediction?: boolean;
  confidence_level?: number;
  llm?: string;
}

// 範例資料
const SAMPLE_JSON_DATA = [
  {
    id: "llm-pred-0",
    facility_id: "1",
    timestamp: "2025-04-23T16:57:31.592Z",
    energy_kwh: 462.5,
    temperature_celsius: 25.8,
    humidity_percent: 65,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-1",
    facility_id: "1",
    timestamp: "2025-04-23T17:57:31.592Z",
    energy_kwh: 460,
    temperature_celsius: 25.5,
    humidity_percent: 66,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-2",
    facility_id: "1",
    timestamp: "2025-04-23T18:57:31.592Z",
    energy_kwh: 463,
    temperature_celsius: 25,
    humidity_percent: 64,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-3",
    facility_id: "1",
    timestamp: "2025-04-23T19:57:31.592Z",
    energy_kwh: 460.5,
    temperature_celsius: 24.8,
    humidity_percent: 63,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-4",
    facility_id: "1",
    timestamp: "2025-04-23T20:57:31.592Z",
    energy_kwh: 458,
    temperature_celsius: 24.5,
    humidity_percent: 65,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-5",
    facility_id: "1",
    timestamp: "2025-04-23T21:57:31.592Z",
    energy_kwh: 465,
    temperature_celsius: 24.6,
    humidity_percent: 67,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-6",
    facility_id: "1",
    timestamp: "2025-04-23T22:57:31.592Z",
    energy_kwh: 462,
    temperature_celsius: 24.4,
    humidity_percent: 68,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-7",
    facility_id: "1",
    timestamp: "2025-04-23T23:57:31.592Z",
    energy_kwh: 461.5,
    temperature_celsius: 24.3,
    humidity_percent: 66,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-8",
    facility_id: "1",
    timestamp: "2025-04-24T00:57:31.592Z",
    energy_kwh: 485,
    temperature_celsius: 24,
    humidity_percent: 68,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-9",
    facility_id: "1",
    timestamp: "2025-04-24T01:57:31.592Z",
    energy_kwh: 500,
    temperature_celsius: 24.2,
    humidity_percent: 65,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-10",
    facility_id: "1",
    timestamp: "2025-04-24T02:57:31.592Z",
    energy_kwh: 530,
    temperature_celsius: 27,
    humidity_percent: 64,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-11",
    facility_id: "1",
    timestamp: "2025-04-24T03:57:31.592Z",
    energy_kwh: 560,
    temperature_celsius: 30,
    humidity_percent: 63,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-12",
    facility_id: "1",
    timestamp: "2025-04-24T04:57:31.592Z",
    energy_kwh: 520,
    temperature_celsius: 28,
    humidity_percent: 62,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-13",
    facility_id: "1",
    timestamp: "2025-04-24T05:57:31.592Z",
    energy_kwh: 550,
    temperature_celsius: 30.5,
    humidity_percent: 65,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-14",
    facility_id: "1",
    timestamp: "2025-04-24T06:57:31.592Z",
    energy_kwh: 545,
    temperature_celsius: 28.5,
    humidity_percent: 66,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-15",
    facility_id: "1",
    timestamp: "2025-04-24T07:57:31.592Z",
    energy_kwh: 505,
    temperature_celsius: 27,
    humidity_percent: 69,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-16",
    facility_id: "1",
    timestamp: "2025-04-24T08:57:31.592Z",
    energy_kwh: 520,
    temperature_celsius: 26,
    humidity_percent: 70,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-17",
    facility_id: "1",
    timestamp: "2025-04-24T09:57:31.592Z",
    energy_kwh: 480,
    temperature_celsius: 25.8,
    humidity_percent: 60,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-18",
    facility_id: "1",
    timestamp: "2025-04-24T10:57:31.592Z",
    energy_kwh: 490,
    temperature_celsius: 24,
    humidity_percent: 62,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-19",
    facility_id: "1",
    timestamp: "2025-04-24T11:57:31.592Z",
    energy_kwh: 450,
    temperature_celsius: 26,
    humidity_percent: 69,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-20",
    facility_id: "1",
    timestamp: "2025-04-24T12:57:31.592Z",
    energy_kwh: 460,
    temperature_celsius: 26.2,
    humidity_percent: 70,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-21",
    facility_id: "1",
    timestamp: "2025-04-24T13:57:31.592Z",
    energy_kwh: 450,
    temperature_celsius: 24.5,
    humidity_percent: 61,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-22",
    facility_id: "1",
    timestamp: "2025-04-24T14:57:31.592Z",
    energy_kwh: 460,
    temperature_celsius: 26.3,
    humidity_percent: 69,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
  {
    id: "llm-pred-23",
    facility_id: "1",
    timestamp: "2025-04-24T15:57:31.592Z",
    energy_kwh: 460,
    temperature_celsius: 25,
    humidity_percent: 62,
    is_prediction: true,
    confidence_level: 0.8,
    llm: "gemini",
  },
];

// 新增預測數據類型定義
interface ModelPrediction {
  data: any[];
  timestamp: string; // 預測請求時間
}

// 多時間範圍的預測結構
interface ModelPredictions {
  "12h"?: ModelPrediction;
  "24h"?: ModelPrediction;
  "48h"?: ModelPrediction;
  "72h"?: ModelPrediction;
  week?: ModelPrediction;
  month?: ModelPrediction;
  [key: string]: ModelPrediction | undefined;
}

export default function EnergyDashboard() {
  const router = useRouter();
  const [selectedFacility, setSelectedFacility] = useState(facilities[0].id);
  const [forecastHours, setForecastHours] = useState(24);
  const [isLoading, setIsLoading] = useState(true);
  const [useLLM, setUseLLM] = useState(true);
  const [selectedLLM, setSelectedLLM] = useState("gemini");

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [predictedData, setPredictedData] = useState<any[]>([]);
  // 用於存儲不同模型的預測結果，按模型和時長進行緩存
  const [modelPredictions, setModelPredictions] = useState<{
    standard: ModelPredictions;
    gemini: ModelPredictions;
    openai: ModelPredictions;
    [key: string]: ModelPredictions;
  }>({
    standard: {},
    gemini: {},
    openai: {},
  });
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [transitionCompleted, setTransitionCompleted] = useState(false);
  const [dbText, setDbText] = useState("");
  const [parsedJson, setParsedJson] = useState<EnergyDataItem[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // LLM 模型選項
  const LLM_MODELS = [
    { id: "gemini", name: "Google Gemini", disabled: false },
    { id: "openai", name: "OpenAI GPT-4", disabled: false },
    { id: "watsonx", name: "IBM WatsonX", disabled: true },
    { id: "claude", name: "Anthropic Claude", disabled: true },
  ];

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // 獲取指定模型和時長的預測數據
  const getModelPrediction = (modelName: string, hours: number): any[] => {
    const timeKey = `${hours}h`;
    const result = modelPredictions[modelName]?.[timeKey]?.data || [];
    console.log(
      `獲取 ${modelName} 模型 ${timeKey} 預測數據: ${result.length} 條記錄`
    );
    return result;
  };

  // 儲存模型預測結果到緩存
  const cacheModelPrediction = (
    modelName: string,
    hours: number,
    data: any[]
  ): void => {
    const timeKey = `${hours}h`;
    console.log(
      `緩存 ${modelName} 模型 ${timeKey} 預測數據: ${data.length} 條記錄`
    );

    setModelPredictions((prev) => {
      const updated = {
        ...prev,
        [modelName]: {
          ...prev[modelName],
          [timeKey]: {
            data,
            timestamp: new Date().toISOString(),
          },
        },
      };
      console.log("更新後的 modelPredictions:", updated);
      return updated;
    });
  };

  // 載入數據
  const loadData = async () => {
    setIsLoading(true);

    try {
      // 獲取能源使用歷史數據
      let history;
      try {
        const response = await ApiService.getEnergyUsage(
          selectedFacility,
          0.0,
          100.0
        );

        if (response && response.data.length > 0) {
          // 排序數據 - 按照timestamp從舊到新
          history = [...response.data].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        } else {
          // 備用模擬數據
          history = generateHistoricalEnergyData(selectedFacility);
        }
      } catch (error) {
        console.error("獲取能源使用歷史數據失敗:", error);
        history = generateHistoricalEnergyData(selectedFacility);
      }

      setHistoryData(history);

      // 當前時間範圍的鍵名
      const timeKey = `${forecastHours}h`;
      let predictions = [];

      // 1. 檢查緩存中是否有標準模型的預測
      let standardPredictions = getModelPrediction("standard", forecastHours);
      if (standardPredictions.length === 0) {
        // 生成標準模型預測並緩存
        standardPredictions = predictEnergyUsage(history, forecastHours);
        cacheModelPrediction("standard", forecastHours, standardPredictions);
      }

      // 2. 處理 LLM 模型預測
      if (useLLM) {
        // 檢查緩存中是否有所選 LLM 模型的預測
        let llmPredictions = getModelPrediction(selectedLLM, forecastHours);

        if (llmPredictions.length === 0) {
          // 沒有緩存，需要從 API 獲取
          try {
            llmPredictions = await ApiService.predictEnergyUsageLLM(
              history,
              forecastHours,
              selectedLLM
            );

            // 緩存 LLM 模型預測
            cacheModelPrediction(selectedLLM, forecastHours, llmPredictions);

            // 使用該預測結果
            predictions = llmPredictions;

            // 如果在模型比較頁面，需要獲取其他模型的預測
            const isComparisonTab =
              document
                .querySelector('[data-state="active"][role="tab"]')
                ?.getAttribute("data-value") === "model-comparison";

            if (isComparisonTab) {
              // 獲取 Gemini 模型預測（如果尚未緩存且不是當前選中的模型）
              if (
                selectedLLM !== "gemini" &&
                getModelPrediction("gemini", forecastHours).length === 0
              ) {
                try {
                  const geminiPredictions =
                    await ApiService.predictEnergyUsageLLM(
                      history,
                      forecastHours,
                      "gemini"
                    );
                  cacheModelPrediction(
                    "gemini",
                    forecastHours,
                    geminiPredictions
                  );
                } catch (error) {
                  console.error("獲取 Gemini 模型預測失敗:", error);
                }
              }

              // 獲取 OpenAI 模型預測（如果尚未緩存且不是當前選中的模型）
              if (
                selectedLLM !== "openai" &&
                getModelPrediction("openai", forecastHours).length === 0
              ) {
                try {
                  const openaiPredictions =
                    await ApiService.predictEnergyUsageLLM(
                      history,
                      forecastHours,
                      "openai"
                    );
                  cacheModelPrediction(
                    "openai",
                    forecastHours,
                    openaiPredictions
                  );
                } catch (error) {
                  console.error("獲取 OpenAI 模型預測失敗:", error);
                }
              }
            }
          } catch (error) {
            console.error("LLM 預測失敗，使用標準模型預測:", error);
            // 備用：使用標準模型預測
            predictions = standardPredictions;
          }
        } else {
          // 使用緩存的 LLM 預測
          predictions = llmPredictions;
        }
      } else {
        // 不使用 LLM，直接使用標準模型預測
        predictions = standardPredictions;
      }

      setPredictedData(predictions);

      // 獲取異常
      const anomalyData = getEnergyAnomalies([...history, ...predictions]);
      setAnomalies(anomalyData);

      // 計算統計數據
      const stats = generateEnergyStatistics(selectedFacility, history);

      // 確保 stats 不為 null
      if (stats) {
        // 計算平均濕度
        if (history.length > 0) {
          const totalHumidity = history.reduce(
            (sum, entry) => sum + entry.humidity_percent,
            0
          );
          (stats as any).average_humidity = totalHumidity / history.length;
        } else {
          (stats as any).average_humidity = 50; // 默認值
        }

        setStatistics(stats);
      } else {
        setStatistics(null);
      }
    } catch (error) {
      console.error("載入數據失敗:", error);
      // 使用模擬數據作為備用
      const history = generateHistoricalEnergyData(selectedFacility);
      setHistoryData(history);

      const predictions = predictEnergyUsage(history, forecastHours);
      setPredictedData(predictions);

      const anomalyData = getEnergyAnomalies([...history, ...predictions]);
      setAnomalies(anomalyData);

      const stats = generateEnergyStatistics(selectedFacility, history);
      if (stats) {
        const totalHumidity = history.reduce(
          (sum, entry) => sum + entry.humidity_percent,
          0
        );
        (stats as any).average_humidity = totalHumidity / history.length;
        setStatistics(stats);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 批量寫入數據(不要隨意開啟，會造成DB覆蓋)
  const batchAddEnergyData = async (items: any[], delayMs = 500) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        await ApiService.createEnergyUsage(
          item.facility_id,
          item.timestamp,
          item.energy_kwh,
          item.humidity_percent,
          item.temperature_celsius
        );
        console.log(
          `${item.facility_id}_成功寫入第 ${i + 1}/${items.length} 筆資料`
        );

        // 最後一筆不需要延遲
        if (i < items.length - 1) {
          await delay(delayMs);
        }
      } catch (error) {
        console.error(`第 ${i + 1} 筆資料寫入失敗:`, error);
      }
    }
  };
  console.log("modelPredictions", modelPredictions);
  // 初始加載和選擇設施變更時重新加載
  useEffect(() => {
    loadData();
  }, [selectedFacility]);

  // 處理預測時間範圍變更
  const handleForecastChange = async (hours: string) => {
    const forecastHoursNum = parseInt(hours);
    setForecastHours(forecastHoursNum);
    setIsLoading(true);

    try {
      // 當前時間範圍的鍵名
      const timeKey = `${forecastHoursNum}h`;
      let predictions = [];

      // 1. 檢查緩存中是否有標準模型的預測
      let standardPredictions = getModelPrediction(
        "standard",
        forecastHoursNum
      );
      if (standardPredictions.length === 0) {
        // 生成標準模型預測並緩存
        standardPredictions = predictEnergyUsage(historyData, forecastHoursNum);
        cacheModelPrediction("standard", forecastHoursNum, standardPredictions);
      }

      // 2. 處理 LLM 模型預測
      if (useLLM) {
        // 檢查緩存中是否有所選 LLM 模型的預測
        let llmPredictions = getModelPrediction(selectedLLM, forecastHoursNum);

        if (llmPredictions.length === 0) {
          // 沒有緩存，需要從 API 獲取
          try {
            llmPredictions = await ApiService.predictEnergyUsageLLM(
              historyData,
              forecastHoursNum,
              selectedLLM
            );

            // 緩存 LLM 模型預測
            cacheModelPrediction(selectedLLM, forecastHoursNum, llmPredictions);

            // 使用該預測結果
            predictions = llmPredictions;

            // 如果在模型比較頁面，需要獲取其他模型的預測
            const isComparisonTab =
              document
                .querySelector('[data-state="active"][role="tab"]')
                ?.getAttribute("data-value") === "model-comparison";

            if (isComparisonTab) {
              // 獲取 Gemini 模型預測（如果尚未緩存且不是當前選中的模型）
              if (
                selectedLLM !== "gemini" &&
                getModelPrediction("gemini", forecastHoursNum).length === 0
              ) {
                try {
                  const geminiPredictions =
                    await ApiService.predictEnergyUsageLLM(
                      historyData,
                      forecastHoursNum,
                      "gemini"
                    );
                  cacheModelPrediction(
                    "gemini",
                    forecastHoursNum,
                    geminiPredictions
                  );
                } catch (error) {
                  console.error("獲取 Gemini 模型預測失敗:", error);
                }
              }

              // 獲取 OpenAI 模型預測（如果尚未緩存且不是當前選中的模型）
              if (
                selectedLLM !== "openai" &&
                getModelPrediction("openai", forecastHoursNum).length === 0
              ) {
                try {
                  const openaiPredictions =
                    await ApiService.predictEnergyUsageLLM(
                      historyData,
                      forecastHoursNum,
                      "openai"
                    );
                  cacheModelPrediction(
                    "openai",
                    forecastHoursNum,
                    openaiPredictions
                  );
                } catch (error) {
                  console.error("獲取 OpenAI 模型預測失敗:", error);
                }
              }
            }
          } catch (error) {
            console.error("LLM 預測失敗，使用標準模型預測:", error);
            // 備用：使用標準模型預測
            predictions = standardPredictions;
          }
        } else {
          // 使用緩存的 LLM 預測
          predictions = llmPredictions;
        }
      } else {
        // 不使用 LLM，直接使用標準模型預測
        predictions = standardPredictions;
      }

      setPredictedData(predictions);

      // 更新異常
      const anomalyData = getEnergyAnomalies([...historyData, ...predictions]);
      setAnomalies(anomalyData);
    } catch (error) {
      console.error("更新預測失敗:", error);
      // 備用：使用常規模型預測
      const predictions = predictEnergyUsage(historyData, forecastHoursNum);
      setPredictedData(predictions);

      // 更新異常
      const anomalyData = getEnergyAnomalies([...historyData, ...predictions]);
      setAnomalies(anomalyData);
    } finally {
      setIsLoading(false);
    }
  };

  // 切換預測模型時重新生成預測
  useEffect(() => {
    if (historyData.length > 0) {
      handleForecastChange(forecastHours.toString());
    }
  }, [useLLM, selectedLLM]);

  // 處理轉場完成後的動畫
  useEffect(() => {
    // 頁面載入後等待一小段時間再啟用內部動畫
    const timer = setTimeout(() => {
      setTransitionCompleted(true);
    }, 300); // 等待300ms，配合頁面轉場動畫完成

    return () => clearTimeout(timer);
  }, []);

  // 修改模型比較部分
  const getUIModelData = () => {
    return {
      standard: getModelPrediction("standard", forecastHours),
      gemini: getModelPrediction("gemini", forecastHours),
      openai: getModelPrediction("openai", forecastHours),
    };
  };

  // 處理組件回傳的模型數據
  const handleModelDataRequest = (modelName: string, data: any[]) => {
    console.log(`接收到 ${modelName} 模型的數據更新，共 ${data.length} 條記錄`);
    // 更新緩存數據
    cacheModelPrediction(modelName, forecastHours, data);
  };

  // 處理文本轉JSON
  const handleJsonParse = () => {
    try {
      setParseError(null);
      if (!dbText.trim()) {
        setParseError("請輸入有效的JSON數據");
        setParsedJson(null);
        return;
      }

      const jsonData = JSON.parse(dbText);

      // 檢查是否為陣列
      if (!Array.isArray(jsonData)) {
        setParseError("資料格式不正確，應為陣列格式");
        setParsedJson(null);
        return;
      }

      // 檢查每個項目是否符合格式要求
      const isValidFormat = jsonData.every((item) => {
        return (
          typeof item === "object" &&
          typeof item.facility_id === "string" &&
          typeof item.timestamp === "string" &&
          !isNaN(new Date(item.timestamp).getTime()) && // 檢查時間戳是否有效
          typeof item.energy_kwh === "number" &&
          typeof item.humidity_percent === "number" &&
          typeof item.temperature_celsius === "number"
        );
      });

      if (!isValidFormat) {
        setParseError("資料項目格式不符合要求，請檢查所有欄位");
        setParsedJson(null);
        return;
      }

      // 驗證通過，存儲資料
      setParsedJson(jsonData as EnergyDataItem[]);
      console.log("成功解析JSON數據:", jsonData);

      // 顯示預覽對話框
      setIsDialogOpen(true);
    } catch (error) {
      console.error("JSON解析錯誤:", error);
      setParseError("JSON格式錯誤，請檢查輸入內容");
      setParsedJson(null);
    }
  };

  // 複製範例資料到剪貼簿
  const copyExampleData = () => {
    const jsonString = JSON.stringify(SAMPLE_JSON_DATA, null, 2);
    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);

        // 同時設置到文本框
        setDbText(jsonString);
      })
      .catch((err) => {
        console.error("無法複製文本:", err);
      });
  };

  // 格式化時間戳記
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("zh-TW");
    } catch (e) {
      return timestamp;
    }
  };

  // 導航到 ESG 報告頁面
  const navigateToESGReport = () => {
    // 找到當前選擇的設施
    const facility = facilities.find(f => f.id === selectedFacility);
    
    // 構建查詢參數，包含設施 ID 和名稱
    const params = new URLSearchParams();
    if (facility) {
      params.append('facilityId', facility.id);
      params.append('facilityName', facility.name);
    }
    
    // 導航到 ESG 報告頁面，並附加查詢參數 (修改為儀表板內的路徑)
    router.push(`/dashboard/reports/esg?${params.toString()}`);
  };

  return (
    <TransitionWrapper className='w-full h-full'>
      <div className='space-y-6 p-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold'>能源管理儀表板</h1>

          <div className='flex items-center gap-4'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='use-llm'
                checked={useLLM}
                onCheckedChange={setUseLLM}
              />
              <Label htmlFor='use-llm'>LLM預測</Label>
            </div>

            {useLLM && (
              <Select
                value={selectedLLM}
                onValueChange={(value) => {
                  setSelectedLLM(value);
                  // 選擇新的LLM模型後重新預測
                  if (historyData.length > 0) {
                    handleForecastChange(forecastHours.toString());
                  }
                }}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='選擇LLM模型' />
                </SelectTrigger>
                <SelectContent>
                  {LLM_MODELS.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      disabled={model.disabled}
                    >
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={selectedFacility.toString()}
              onValueChange={(value) => setSelectedFacility(value)}
            >
              <SelectTrigger className='w-[240px]'>
                <SelectValue placeholder='選擇數據中心' />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id.toString()}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant='outline'
              size='icon'
              onClick={loadData}
              disabled={isLoading}
              className='tech-button'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* 能源使用摘要卡片 */}
        {statistics && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {transitionCompleted ? (
              <>
                <AnimatedCard delay={0.1} duration={0.5}>
                  <div
                    className='glass-effect border rounded-lg p-3 data-card'
                    style={{
                      backgroundColor: "var(--metrics-temperature-bg)",
                      borderColor: "var(--metrics-temperature-text)",
                      borderWidth: "1px",
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <Zap
                        className='h-4 w-4'
                        style={{ color: "var(--metrics-temperature-text)" }}
                      />
                      <span
                        className='text-sm font-medium'
                        style={{ color: "var(--metrics-temperature-text)" }}
                      >
                        總耗電量
                      </span>
                    </div>
                    <div
                      className='text-2xl font-bold mt-1'
                      style={{ color: "var(--metrics-temperature-text)" }}
                    >
                      <CountUpNumber
                        value={statistics.total_energy_kwh}
                        decimals={0}
                        duration={1.2}
                        suffix=' kWh'
                      />
                    </div>
                    <div
                      className='text-xs mt-1'
                      style={{
                        color: "var(--metrics-temperature-text)",
                        opacity: 0.8,
                      }}
                    >
                      預估花費: $
                      <AnimatedNumber
                        value={statistics.cost_estimate_usd.toLocaleString()}
                      />
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.2} duration={0.5}>
                  <div
                    className='glass-effect border rounded-lg p-3 data-card'
                    style={{
                      backgroundColor: "var(--metrics-load-bg)",
                      borderColor: "var(--metrics-load-text)",
                      borderWidth: "1px",
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <TrendingUp
                        className='h-4 w-4'
                        style={{ color: "var(--metrics-load-text)" }}
                      />
                      <span
                        className='text-sm font-medium'
                        style={{ color: "var(--metrics-load-text)" }}
                      >
                        平均每小時耗電量
                      </span>
                    </div>
                    <div
                      className='text-2xl font-bold mt-1'
                      style={{ color: "var(--metrics-load-text)" }}
                    >
                      <CountUpNumber
                        value={statistics.average_hourly_kwh}
                        decimals={1}
                        duration={1.2}
                        suffix=' kWh'
                      />
                    </div>
                    <div
                      className='mt-1 flex items-center text-xs'
                      style={{
                        color: "var(--metrics-load-text)",
                        opacity: 0.8,
                      }}
                    >
                      <ThermometerSun className='mr-1 h-3 w-3' />
                      溫度相關性:{" "}
                      <AnimatedNumber
                        value={Number(
                          (statistics.temperature_correlation * 100).toFixed(0)
                        )}
                        suffix='%'
                      />
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.3} duration={0.5}>
                  <div
                    className='glass-effect border rounded-lg p-3 data-card'
                    style={{
                      backgroundColor: "var(--metrics-efficiency-bg)",
                      borderColor: "var(--metrics-efficiency-text)",
                      borderWidth: "1px",
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <ThermometerSun
                        className='h-4 w-4'
                        style={{ color: "var(--metrics-efficiency-text)" }}
                      />
                      <span
                        className='text-sm font-medium'
                        style={{ color: "var(--metrics-efficiency-text)" }}
                      >
                        尖峰用電
                      </span>
                    </div>
                    <div
                      className='text-2xl font-bold mt-1'
                      style={{ color: "var(--metrics-efficiency-text)" }}
                    >
                      <CountUpNumber
                        value={statistics.peak_usage.energy_kwh}
                        decimals={0}
                        duration={1.2}
                        suffix=' kWh'
                      />
                    </div>
                    <div
                      className='mt-1 flex items-center text-xs'
                      style={{
                        color: "var(--metrics-efficiency-text)",
                        opacity: 0.8,
                      }}
                    >
                      <ThermometerSun className='mr-1 h-3 w-3' />
                      當時溫度:{" "}
                      <AnimatedNumber
                        value={statistics.peak_usage.temperature}
                        suffix='°C'
                      />
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.4} duration={0.5}>
                  <div
                    className='glass-effect border rounded-lg p-3 data-card'
                    style={{
                      backgroundColor: "var(--metrics-vibration-bg)",
                      borderColor: "var(--metrics-vibration-text)",
                      borderWidth: "1px",
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <Droplet
                        className='h-4 w-4'
                        style={{ color: "var(--metrics-vibration-text)" }}
                      />
                      <span
                        className='text-sm font-medium'
                        style={{ color: "var(--metrics-vibration-text)" }}
                      >
                        平均濕度
                      </span>
                    </div>
                    <div
                      className='text-2xl font-bold mt-1'
                      style={{ color: "var(--metrics-vibration-text)" }}
                    >
                      <CountUpNumber
                        value={
                          statistics.average_humidity
                            ? statistics.average_humidity
                            : 50.0
                        }
                        decimals={1}
                        duration={1.2}
                        suffix='%'
                      />
                    </div>
                    <div
                      className='mt-1 flex items-center text-xs'
                      style={{
                        color: "var(--metrics-vibration-text)",
                        opacity: 0.8,
                      }}
                    >
                      適宜範圍: 40-60%
                    </div>
                  </div>
                </AnimatedCard>
              </>
            ) : (
              <>
                <div
                  className='glass-effect border rounded-lg p-3 data-card'
                  style={{
                    backgroundColor: "var(--metrics-temperature-bg)",
                    borderColor: "var(--metrics-temperature-text)",
                    borderWidth: "1px",
                  }}
                >
                  <div className='flex items-center gap-2'>
                    <Zap
                      className='h-4 w-4'
                      style={{ color: "var(--metrics-temperature-text)" }}
                    />
                    <span
                      className='text-sm font-medium'
                      style={{ color: "var(--metrics-temperature-text)" }}
                    >
                      總耗電量
                    </span>
                  </div>
                  <div
                    className='text-2xl font-bold mt-1'
                    style={{ color: "var(--metrics-temperature-text)" }}
                  >
                    {statistics.total_energy_kwh.toFixed(0)} kWh
                  </div>
                  <div
                    className='text-xs mt-1'
                    style={{
                      color: "var(--metrics-temperature-text)",
                      opacity: 0.8,
                    }}
                  >
                    預估花費: ${statistics.cost_estimate_usd.toLocaleString()}
                  </div>
                </div>

                <div
                  className='glass-effect border rounded-lg p-3 data-card'
                  style={{
                    backgroundColor: "var(--metrics-load-bg)",
                    borderColor: "var(--metrics-load-text)",
                    borderWidth: "1px",
                  }}
                >
                  <div className='flex items-center gap-2'>
                    <TrendingUp
                      className='h-4 w-4'
                      style={{ color: "var(--metrics-load-text)" }}
                    />
                    <span
                      className='text-sm font-medium'
                      style={{ color: "var(--metrics-load-text)" }}
                    >
                      平均每小時耗電量
                    </span>
                  </div>
                  <div
                    className='text-2xl font-bold mt-1'
                    style={{ color: "var(--metrics-load-text)" }}
                  >
                    {statistics.average_hourly_kwh.toFixed(1)} kWh
                  </div>
                  <div
                    className='mt-1 flex items-center text-xs'
                    style={{ color: "var(--metrics-load-text)", opacity: 0.8 }}
                  >
                    <ThermometerSun className='mr-1 h-3 w-3' />
                    溫度相關性:{" "}
                    {(statistics.temperature_correlation * 100).toFixed(0)}%
                  </div>
                </div>

                <div
                  className='glass-effect border rounded-lg p-3 data-card'
                  style={{
                    backgroundColor: "var(--metrics-efficiency-bg)",
                    borderColor: "var(--metrics-efficiency-text)",
                    borderWidth: "1px",
                  }}
                >
                  <div className='flex items-center gap-2'>
                    <ThermometerSun
                      className='h-4 w-4'
                      style={{ color: "var(--metrics-efficiency-text)" }}
                    />
                    <span
                      className='text-sm font-medium'
                      style={{ color: "var(--metrics-efficiency-text)" }}
                    >
                      尖峰用電
                    </span>
                  </div>
                  <div
                    className='text-2xl font-bold mt-1'
                    style={{ color: "var(--metrics-efficiency-text)" }}
                  >
                    {statistics.peak_usage.energy_kwh.toFixed(0)} kWh
                  </div>
                  <div
                    className='mt-1 flex items-center text-xs'
                    style={{
                      color: "var(--metrics-efficiency-text)",
                      opacity: 0.8,
                    }}
                  >
                    <ThermometerSun className='mr-1 h-3 w-3' />
                    當時溫度: {statistics.peak_usage.temperature}°C
                  </div>
                </div>

                <div
                  className='glass-effect border rounded-lg p-3 data-card'
                  style={{
                    backgroundColor: "var(--metrics-vibration-bg)",
                    borderColor: "var(--metrics-vibration-text)",
                    borderWidth: "1px",
                  }}
                >
                  <div className='flex items-center gap-2'>
                    <Droplet
                      className='h-4 w-4'
                      style={{ color: "var(--metrics-vibration-text)" }}
                    />
                    <span
                      className='text-sm font-medium'
                      style={{ color: "var(--metrics-vibration-text)" }}
                    >
                      平均濕度
                    </span>
                  </div>
                  <div
                    className='text-2xl font-bold mt-1'
                    style={{ color: "var(--metrics-vibration-text)" }}
                  >
                    {(statistics.average_humidity
                      ? statistics.average_humidity
                      : 50.0
                    ).toFixed(1)}
                    %
                  </div>
                  <div
                    className='mt-1 flex items-center text-xs'
                    style={{
                      color: "var(--metrics-vibration-text)",
                      opacity: 0.8,
                    }}
                  >
                    適宜範圍: 40-60%
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 主要圖表區域 */}
        <Tabs defaultValue='energy'>
          <div className='flex justify-between items-center mb-4'>
            <TabsList>
              <TabsTrigger value='energy' className='flex items-center gap-1'>
                <BarChart4 className='h-4 w-4' />
                <span>能源使用</span>
              </TabsTrigger>
              <TabsTrigger
                value='temperature'
                className='flex items-center gap-1'
              >
                <ThermometerSun className='h-4 w-4' />
                <span>溫度分析</span>
              </TabsTrigger>
              <TabsTrigger
                value='ai-insights'
                className='flex items-center gap-1'
              >
                <Lightbulb className='h-4 w-4' />
                <span>{useLLM ? "AI分析 (LLM)" : "數據分析"}</span>
              </TabsTrigger>
              <TabsTrigger
                value='model-comparison'
                className='flex items-center gap-1'
              >
                <BarChart4 className='h-4 w-4' />
                <span>模型比較</span>
              </TabsTrigger>
              <TabsTrigger
                value='model-import-data'
                className='flex items-center gap-1'
              >
                <FileUp className='h-4 w-4' />
                <span>匯入資料</span>
              </TabsTrigger>
            </TabsList>

            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>預測時間:</span>
              <Select
                value={forecastHours.toString()}
                onValueChange={handleForecastChange}
              >
                <SelectTrigger className='w-[120px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='24'>24 小時</SelectItem>
                  <SelectItem value='48'>48 小時</SelectItem>
                  <SelectItem value='72'>72 小時</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value='energy' className='mt-0'>
            <Card className='gradient-border soft-shadow'>
              <CardHeader>
                <CardTitle>能源使用趨勢與預測</CardTitle>
                <CardDescription>
                  顯示過去7天的能源使用數據和未來 {forecastHours} 小時的預測
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='h-[350px] flex items-center justify-center'>
                    <div className='tech-loading'></div>
                  </div>
                ) : (
                  <EnergyUsageChart
                    historyData={historyData}
                    predictedData={predictedData}
                    height={350}
                    useLLM={useLLM}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='temperature' className='mt-0'>
            <Card className='gradient-border soft-shadow'>
              <CardHeader>
                <CardTitle>溫度與能源關係分析</CardTitle>
                <CardDescription>分析溫度變化對能源使用的影響</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='h-[350px] flex items-center justify-center'>
                    <div className='tech-loading'></div>
                  </div>
                ) : (
                  <TemperatureChart
                    data={[...historyData, ...predictedData]}
                    height={350}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='ai-insights' className='mt-0'>
            <Card className='gradient-border soft-shadow'>
              <CardHeader>
                <CardTitle>
                  {useLLM ? "AI能源預測分析 (LLM驅動)" : "數據分析"}
                </CardTitle>
                <CardDescription>
                  {useLLM
                    ? "大型語言模型根據歷史數據和模式分析提供的能源使用預測洞察"
                    : "基於統計模型的能源使用預測分析"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='h-[350px] flex items-center justify-center'>
                    <div className='tech-loading'></div>
                  </div>
                ) : (
                  <EnergyForecastInsight
                    facility={
                      facilities.find((f) => f.id === selectedFacility) ||
                      facilities[0]
                    }
                    predictions={predictedData}
                    historicalData={historyData}
                    forecastHours={forecastHours}
                    useLLM={useLLM}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 模型比較頁籤 */}
          <TabsContent value='model-comparison' className='mt-0'>
            <Card className='gradient-border soft-shadow'>
              <CardHeader>
                <CardTitle>預測模型比較</CardTitle>
                <CardDescription>
                  比較不同預測模型的能源使用預測結果
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='h-[350px] flex items-center justify-center'>
                    <div className='tech-loading'></div>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    <div className='h-[350px]'>
                      <PredictionModelComparison
                        historyData={historyData}
                        modelPredictions={getUIModelData()}
                        selectedLLM={selectedLLM}
                        forecastHours={forecastHours}
                        onModelDataRequest={handleModelDataRequest}
                      />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <Card className='shadow-sm'>
                        <CardHeader className='pb-2'>
                          <CardTitle className='text-base'>
                            常規模型預測
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='text-sm space-y-2'>
                            <p>基於統計方法的標準預測模型</p>
                            <p className='text-muted-foreground'>
                              準確度: 中等
                            </p>
                            <p className='text-muted-foreground'>
                              特點: 預測穩定，對異常情況敏感度較低
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className='shadow-sm'>
                        <CardHeader className='pb-2'>
                          <CardTitle className='text-base'>
                            Google Gemini
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='text-sm space-y-2'>
                            <p>使用 Google Gemini 大型語言模型進行預測</p>
                            <p className='text-muted-foreground'>
                              準確度:{" "}
                              {getModelPrediction("gemini", forecastHours)
                                .length > 0
                                ? "高"
                                : "未知"}
                            </p>
                            <p className='text-muted-foreground'>
                              特點: 對複雜變量處理能力強，能提供詳細推理
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className='shadow-sm'>
                        <CardHeader className='pb-2'>
                          <CardTitle className='text-base'>
                            OpenAI GPT-4
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='text-sm space-y-2'>
                            <p>使用 OpenAI GPT-4 大型語言模型進行預測</p>
                            <p className='text-muted-foreground'>
                              準確度:{" "}
                              {getModelPrediction("openai", forecastHours)
                                .length > 0
                                ? "高"
                                : "未知"}
                            </p>
                            <p className='text-muted-foreground'>
                              特點: 趨勢分析能力強，適合長期預測
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* 匯入資料 */}
          <TabsContent value='model-import-data' className='mt-0'>
            <Card className='gradient-border soft-shadow'>
              <CardHeader>
                <CardTitle>匯入資料</CardTitle>
                <CardDescription>更新數據資料</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='h-[350px] flex items-center justify-center'>
                    <div className='tech-loading'></div>
                  </div>
                ) : (
                  <div className='grid gap-4 py-4 px-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <h4 className='text-sm font-medium'>
                          數據文本（JSON格式）
                        </h4>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 px-2 text-xs'
                          onClick={copyExampleData}
                        >
                          {isCopied ? (
                            <Check className='h-4 w-4 mr-1' />
                          ) : (
                            <Copy className='h-4 w-4 mr-1' />
                          )}
                          {isCopied ? "已複製範例" : "複製範例"}
                        </Button>
                      </div>
                      <Textarea
                        id='dbText'
                        placeholder='請輸入有效的JSON格式數據，例如: [{ "facility_id": "Building-A", "timestamp": "2025-04-22T15:00:00Z", "energy_kwh": 290.2, "humidity_percent": 55.3, "temperature_celsius": 33.5 },...]'
                        value={dbText}
                        onChange={(e) => setDbText(e.target.value)}
                        className='max-h-[300px] min-h-[300px] w-full font-mono text-sm leading-relaxed p-4'
                      />

                      {parseError && (
                        <Alert variant='destructive' className='mt-2'>
                          <AlertCircle className='h-4 w-4' />
                          <AlertTitle>錯誤</AlertTitle>
                          <AlertDescription>{parseError}</AlertDescription>
                        </Alert>
                      )}

                      {parsedJson && (
                        <Alert className='mt-2'>
                          <AlertTitle>解析成功</AlertTitle>
                          <AlertDescription>
                            成功解析 {parsedJson.length} 筆資料
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* 預覽對話框 */}
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                      >
                        <DialogContent className='max-w-[800px] max-h-[80vh]'>
                          <DialogHeader>
                            <DialogTitle>資料預覽</DialogTitle>
                            <DialogDescription>
                              已解析 {parsedJson?.length || 0} 筆資料
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className='h-[50vh]'>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>設施ID</TableHead>
                                  <TableHead>時間戳記</TableHead>
                                  <TableHead>耗電量 (kWh)</TableHead>
                                  <TableHead>濕度 (%)</TableHead>
                                  <TableHead>溫度 (°C)</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {parsedJson &&
                                  parsedJson
                                    .slice(0, 100)
                                    .map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {item.facility_id}
                                        </TableCell>
                                        <TableCell>
                                          {formatTimestamp(item.timestamp)}
                                        </TableCell>
                                        <TableCell>
                                          {Number(item.energy_kwh).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                          {Number(
                                            item.humidity_percent
                                          ).toFixed(1)}
                                        </TableCell>
                                        <TableCell>
                                          {Number(
                                            item.temperature_celsius
                                          ).toFixed(1)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                              </TableBody>
                              {parsedJson && parsedJson.length > 100 && (
                                <TableCaption>僅顯示前100筆資料</TableCaption>
                              )}
                            </Table>
                          </ScrollArea>
                          <DialogFooter>
                            <Button onClick={() => setIsDialogOpen(false)}>
                              關閉
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <div className='flex justify-end mt-4 gap-2'>
                        <Button
                          variant='outline'
                          onClick={handleJsonParse}
                          className='flex items-center gap-2'
                        >
                          <Eye className='h-4 w-4' />
                          預覽資料
                        </Button>
                        <Button onClick={handleJsonParse} className='ml-auto'>
                          Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 底部區域：異常警報和能源統計 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* 左側：異常警報 */}
          <div className='md:col-span-1 space-y-4'>
            <h3 className='text-lg font-semibold gradient-text'>
              能源異常警報
            </h3>

            {anomalies.length > 0 ? (
              <div className='space-y-3'>
                {anomalies.map((anomaly) => (
                  <Alert
                    variant='destructive'
                    key={anomaly.id}
                    className='glass-effect'
                  >
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle className='ml-2'>偵測到異常用電</AlertTitle>
                    <AlertDescription className='ml-2'>
                      {anomaly.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <div className='text-sm text-muted-foreground p-4 border rounded-md glass-effect'>
                目前沒有偵測到異常
              </div>
            )}
          </div>

          {/* 右側：能源統計詳細資料 */}
          <div className='md:col-span-2'>
            {transitionCompleted ? (
              <AnimatedCard delay={0.3} duration={0.8}>
                <Card className='gradient-border soft-shadow'>
                  <CardHeader>
                    <div className='flex justify-between items-center'>
                      <CardTitle>能源使用統計分析</CardTitle>
                      <Lightbulb className='h-5 w-5 text-yellow-500 glow-effect' />
                    </div>
                    <CardDescription>
                      過去7天的能源使用統計與效率分析
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className='h-[200px] flex items-center justify-center'>
                        <div className='tech-loading'></div>
                      </div>
                    ) : statistics ? (
                      <EnergyStatisticsPanel statistics={statistics} />
                    ) : (
                      <div className='h-[200px] flex items-center justify-center'>
                        <p>無法載入統計數據</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            ) : (
              <Card className='gradient-border soft-shadow'>
                <CardHeader>
                  <div className='flex justify-between items-center'>
                    <CardTitle>能源使用統計分析</CardTitle>
                    <Lightbulb className='h-5 w-5 text-yellow-500 glow-effect' />
                  </div>
                  <CardDescription>
                    過去7天的能源使用統計與效率分析
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='h-[200px] flex items-center justify-center'>
                      <div className='tech-loading'></div>
                    </div>
                  ) : statistics ? (
                    <EnergyStatisticsPanel statistics={statistics} />
                  ) : (
                    <div className='h-[200px] flex items-center justify-center'>
                      <p>無法載入統計數據</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TransitionWrapper>
  );
}
