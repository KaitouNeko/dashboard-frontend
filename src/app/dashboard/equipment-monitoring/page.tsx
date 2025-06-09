"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  equipment,
  facilities,
  generateEquipmentTelemetry,
  generateFailurePredictions,
} from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  AlertTriangle,
  Battery,
  CheckCircle,
  Clock,
  RefreshCw,
  ThermometerSun,
  Waves,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatusBadge } from "@/lib/status-utils";

import {
  AnimatedNumber,
  CountUpNumber,
} from "@/components/ui/animated-numbers";
import { AnimatedCard } from "@/components/ui/animated-containers";
import {
  TransitionWrapper,
  TransitionItem,
} from "@/components/ui/transition-wrapper";

export default function EquipmentMonitoring() {
  const [selectedFacility, setSelectedFacility] = useState(facilities[0].id);
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const [facilityEquipment, setFacilityEquipment] = useState<any[]>([]);
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [failurePredictions, setFailurePredictions] = useState<any[]>([]);

  // 為進度條值創建一個映射狀態，使用設備ID作為鍵
  const [progressValues, setProgressValues] = useState<Record<number, number>>(
    {}
  );
  // 新增轉場完成狀態
  const [transitionCompleted, setTransitionCompleted] = useState(false);

  // 處理轉場完成後的動畫
  useEffect(() => {
    // 頁面載入後等待更長時間再啟用內部動畫
    const timer = setTimeout(() => {
      setTransitionCompleted(true);
    }, 500); // 從300ms增加到500ms

    return () => clearTimeout(timer);
  }, []);

  // 初始載入和選擇設施變更時重新載入
  useEffect(() => {
    // 獲取當前設施的設備列表
    const filteredEquipment = equipment.filter(
      (item) => item.facility_id === selectedFacility
    );
    setFacilityEquipment(filteredEquipment);

    // 如果有設備，預設選擇第一個
    if (filteredEquipment.length > 0) {
      setSelectedEquipment(filteredEquipment[0].id);
    } else {
      setSelectedEquipment(null);
    }

    // 始終將所有設備的進度條值設為 0
    const initialProgressValues: Record<number, number> = {};
    filteredEquipment.forEach((equip) => {
      initialProgressValues[equip.id] = 0;
    });
    setProgressValues(initialProgressValues);

    // 延遲設置實際值以創建動畫效果，但只在轉場完成後
    if (transitionCompleted) {
      // 使用階段性更新以實現平滑效果
      setTimeout(() => {
        const animatedProgressValues: Record<number, number> = {};
        filteredEquipment.forEach((equip) => {
          // 首先更新到目標值的 60%
          animatedProgressValues[equip.id] =
            getHealthPercentage(equip.status) * 0.6;
        });
        setProgressValues(animatedProgressValues);

        // 然後再次延遲，更新到目標值的 100%
        setTimeout(() => {
          const finalProgressValues: Record<number, number> = {};
          filteredEquipment.forEach((equip) => {
            finalProgressValues[equip.id] = getHealthPercentage(equip.status);
          });
          setProgressValues(finalProgressValues);
        }, 800);
      }, 600);
    } else {
      // 如果轉場尚未完成，直接設置值為 0，等待轉場完成後再更新
      // 這樣即使在頁面切換時也會看到進度條從 0 開始
    }

    setIsLoading(false);
  }, [selectedFacility, transitionCompleted]);

  // 當 transitionCompleted 狀態變更時，觸發進度條動畫
  useEffect(() => {
    if (transitionCompleted && facilityEquipment.length > 0) {
      // 確保進度條一開始都是從 0 開始
      const zeroProgressValues: Record<number, number> = {};
      facilityEquipment.forEach((equip) => {
        zeroProgressValues[equip.id] = 0;
      });
      setProgressValues(zeroProgressValues);

      // 延遲後開始動畫
      setTimeout(() => {
        const midProgressValues: Record<number, number> = {};
        facilityEquipment.forEach((equip) => {
          midProgressValues[equip.id] = getHealthPercentage(equip.status) * 0.6;
        });
        setProgressValues(midProgressValues);

        setTimeout(() => {
          const finalProgressValues: Record<number, number> = {};
          facilityEquipment.forEach((equip) => {
            finalProgressValues[equip.id] = getHealthPercentage(equip.status);
          });
          setProgressValues(finalProgressValues);
        }, 800);
      }, 400);
    }
  }, [transitionCompleted, facilityEquipment]);

  // 選擇設備變更時載入數據
  useEffect(() => {
    if (selectedEquipment) {
      setIsLoading(true);

      // 獲取設備遙測數據
      const telemetry = generateEquipmentTelemetry(selectedEquipment);
      setTelemetryData(telemetry);

      // 獲取設備故障預測
      const predictions = generateFailurePredictions(selectedEquipment);
      setFailurePredictions(predictions);

      setIsLoading(false);
    }
  }, [selectedEquipment]);

  // 設備狀態標籤
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <StatusBadge status='normal'>運行正常</StatusBadge>;
      case "warning":
        return <StatusBadge status='warning'>需要注意</StatusBadge>;
      case "critical":
        return <StatusBadge status='critical'>狀態危急</StatusBadge>;
      default:
        return <Badge variant='secondary'>未知狀態</Badge>;
    }
  };

  // 獲取當前選定的設備
  const currentEquipment = facilityEquipment.find(
    (item) => item.id === selectedEquipment
  );

  // 設備健康狀態百分比
  const getHealthPercentage = (status: string) => {
    switch (status) {
      case "operational":
        return 95;
      case "warning":
        return 60;
      case "critical":
        return 25;
      default:
        return 50;
    }
  };

  // 格式化時間標籤
  const formatTimeLabel = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "HH:00", { locale: zhTW });
    } catch (e) {
      return timestamp;
    }
  };

  // 格式化詳細時間
  const formatDetailedTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "MM/dd HH:mm", { locale: zhTW });
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <TransitionWrapper className='w-full h-full'>
      <div className='space-y-6 p-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold'>設備監控儀表板</h1>

          <div className='flex items-center gap-4'>
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
              onClick={() => {}}
              disabled={isLoading}
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* 設備選擇列表 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {facilityEquipment.map((equip) => (
            <Card
              key={equip.id}
              className={`cursor-pointer hover:border-primary transition-colors ${
                selectedEquipment === equip.id
                  ? "border-primary bg-primary/5"
                  : ""
              }`}
              onClick={() => {
                setSelectedEquipment(equip.id);

                // 點擊時始終將進度條設為 0
                setProgressValues((prev) => ({
                  ...prev,
                  [equip.id]: 0,
                }));

                // 使用階段性變化，創造流暢的進度條動畫
                setTimeout(() => {
                  // 先到目標的 40%
                  setProgressValues((prev) => ({
                    ...prev,
                    [equip.id]: getHealthPercentage(equip.status) * 0.4,
                  }));

                  // 再到目標的 80%
                  setTimeout(() => {
                    setProgressValues((prev) => ({
                      ...prev,
                      [equip.id]: getHealthPercentage(equip.status) * 0.8,
                    }));

                    // 最後到目標的 100%
                    setTimeout(() => {
                      setProgressValues((prev) => ({
                        ...prev,
                        [equip.id]: getHealthPercentage(equip.status),
                      }));
                    }, 400);
                  }, 300);
                }, 200);
              }}
            >
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-start'>
                  <div>
                    <CardTitle className='text-md'>{equip.name}</CardTitle>
                    <CardDescription>{equip.type}</CardDescription>
                  </div>
                  {getStatusBadge(equip.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>設備健康度</span>
                    <span className='font-medium'>
                      <AnimatedNumber
                        value={getHealthPercentage(equip.status)}
                        suffix='%'
                      />
                    </span>
                  </div>
                  <div className='w-full overflow-hidden'>
                    <Progress
                      value={progressValues[equip.id] || 0}
                      className={`h-2 transition-all duration-1200 ease-out ${
                        equip.status === "operational"
                          ? "bg-primary/20 data-[value]:bg-emerald-500"
                          : equip.status === "warning"
                          ? "bg-primary/20 data-[value]:bg-amber-500"
                          : "bg-primary/20 data-[value]:bg-destructive"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 設備詳細信息區域 */}
        {currentEquipment && (
          <div className='space-y-6'>
            {/* 設備詳細信息卡片 */}
            <Card>
              <CardHeader>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle>{currentEquipment.name}</CardTitle>
                    <CardDescription className='pt-2'>
                      類型: {currentEquipment.type} | 安裝日期:{" "}
                      {format(
                        new Date(currentEquipment.installed_date),
                        "yyyy/MM/dd"
                      )}{" "}
                      | 容量: {currentEquipment.capacity}
                      {currentEquipment.type === "Battery"
                        ? "kWh"
                        : currentEquipment.type === "HVAC"
                        ? "kW"
                        : "單位"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(currentEquipment.status)}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='h-[300px] flex items-center justify-center'>
                    <p>載入中...</p>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {/* 故障預測警報 */}
                    {failurePredictions.length > 0 && (
                      <Alert
                        variant={
                          failurePredictions[0].prediction_type === "failure"
                            ? "destructive"
                            : "default"
                        }
                        className={
                          failurePredictions[0].prediction_type !== "failure"
                            ? "border-yellow-500 text-yellow-700"
                            : ""
                        }
                      >
                        <AlertTriangle className='h-4 w-4' />
                        <AlertTitle>
                          {failurePredictions[0].prediction_type === "failure"
                            ? "即將故障！"
                            : "需要維護"}
                        </AlertTitle>
                        <AlertDescription className='mt-1'>
                          <p>{failurePredictions[0].details}</p>
                          <div className='flex items-center gap-1 mt-2 text-sm'>
                            <Clock className='h-3 w-3' />
                            <span>
                              預計時間:{" "}
                              {format(
                                parseISO(failurePredictions[0].predicted_date),
                                "yyyy/MM/dd HH:mm"
                              )}
                            </span>
                            <span className='mx-1'>|</span>
                            <span>
                              可能性:{" "}
                              {(
                                failurePredictions[0].probability * 100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* 設備遙測圖表 */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {/* 溫度和負載圖表 */}
                      <div>
                        <div className='text-sm font-medium mb-2'>
                          溫度和負載
                        </div>
                        <ResponsiveContainer width='100%' height={200}>
                          <LineChart
                            data={telemetryData}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                          >
                            <XAxis
                              dataKey='timestamp'
                              tickFormatter={formatTimeLabel}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              yAxisId='left'
                              domain={["auto", "auto"]}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              yAxisId='right'
                              orientation='right'
                              domain={[0, 100]}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              formatter={(value, name) => {
                                if (name === "溫度")
                                  return [`${value}°C`, name];
                                return [`${value}%`, name];
                              }}
                              labelFormatter={formatDetailedTime}
                            />
                            <Line
                              yAxisId='left'
                              type='monotone'
                              dataKey='temperature'
                              name='溫度'
                              stroke='var(--metrics-temperature-text)'
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line
                              yAxisId='right'
                              type='monotone'
                              dataKey='load_percent'
                              name='負載'
                              stroke='var(--metrics-load-text)'
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* 效率和振動圖表 */}
                      <div>
                        <div className='text-sm font-medium mb-2'>
                          效率和振動
                        </div>
                        <ResponsiveContainer width='100%' height={200}>
                          <LineChart
                            data={telemetryData}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                          >
                            <XAxis
                              dataKey='timestamp'
                              tickFormatter={formatTimeLabel}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              yAxisId='left'
                              domain={[80, 100]}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              yAxisId='right'
                              orientation='right'
                              domain={[0, "auto"]}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              formatter={(value, name) => {
                                if (name === "效率") return [`${value}%`, name];
                                return [`${value}`, name];
                              }}
                              labelFormatter={formatDetailedTime}
                            />
                            <Line
                              yAxisId='left'
                              type='monotone'
                              dataKey='efficiency_percent'
                              name='效率'
                              stroke='var(--metrics-efficiency-text)'
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line
                              yAxisId='right'
                              type='monotone'
                              dataKey='vibration_level'
                              name='振動'
                              stroke='var(--metrics-vibration-text)'
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* 狀態指標 */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      {transitionCompleted ? (
                        <>
                          <AnimatedCard delay={0.1} duration={0.5}>
                            <div
                              className='border rounded-lg p-3'
                              style={{
                                backgroundColor:
                                  "var(--metrics-temperature-bg)",
                                borderColor: "var(--metrics-temperature-text)",
                                borderWidth: "1px",
                              }}
                            >
                              <div className='flex items-center gap-2'>
                                <ThermometerSun
                                  className='h-4 w-4'
                                  style={{
                                    color: "var(--metrics-temperature-text)",
                                  }}
                                />
                                <span
                                  className='text-sm font-medium'
                                  style={{
                                    color: "var(--metrics-temperature-text)",
                                  }}
                                >
                                  當前溫度
                                </span>
                              </div>
                              <div
                                className='text-2xl font-bold mt-1'
                                style={{
                                  color: "var(--metrics-temperature-text)",
                                }}
                              >
                                <CountUpNumber
                                  value={Number(
                                    telemetryData[
                                      telemetryData.length - 1
                                    ]?.temperature.toFixed(1)
                                  )}
                                  suffix='°C'
                                  duration={1.2}
                                />
                              </div>
                              {currentEquipment.type === "HVAC" && (
                                <div
                                  className='text-xs mt-1'
                                  style={{
                                    color: "var(--metrics-temperature-text)",
                                    opacity: 0.8,
                                  }}
                                >
                                  正常範圍: 35-45°C
                                </div>
                              )}
                            </div>
                          </AnimatedCard>

                          <AnimatedCard delay={0.2} duration={0.5}>
                            <div
                              className='border rounded-lg p-3'
                              style={{
                                backgroundColor: "var(--metrics-load-bg)",
                                borderColor: "var(--metrics-load-text)",
                                borderWidth: "1px",
                              }}
                            >
                              <div className='flex items-center gap-2'>
                                <Battery
                                  className='h-4 w-4'
                                  style={{ color: "var(--metrics-load-text)" }}
                                />
                                <span
                                  className='text-sm font-medium'
                                  style={{ color: "var(--metrics-load-text)" }}
                                >
                                  當前負載
                                </span>
                              </div>
                              <div
                                className='text-2xl font-bold mt-1'
                                style={{ color: "var(--metrics-load-text)" }}
                              >
                                <CountUpNumber
                                  value={Number(
                                    telemetryData[
                                      telemetryData.length - 1
                                    ]?.load_percent.toFixed(1)
                                  )}
                                  suffix='%'
                                  duration={1.2}
                                />
                              </div>
                              <div
                                className='text-xs mt-1'
                                style={{
                                  color: "var(--metrics-load-text)",
                                  opacity: 0.8,
                                }}
                              >
                                峰值負載:{" "}
                                <AnimatedNumber
                                  value={Math.max(
                                    ...telemetryData.map((d) => d.load_percent)
                                  ).toFixed(1)}
                                  suffix='%'
                                />
                              </div>
                            </div>
                          </AnimatedCard>

                          <AnimatedCard delay={0.3} duration={0.5}>
                            <div
                              className='border rounded-lg p-3'
                              style={{
                                backgroundColor: "var(--metrics-efficiency-bg)",
                                borderColor: "var(--metrics-efficiency-text)",
                                borderWidth: "1px",
                              }}
                            >
                              <div className='flex items-center gap-2'>
                                <CheckCircle
                                  className='h-4 w-4'
                                  style={{
                                    color: "var(--metrics-efficiency-text)",
                                  }}
                                />
                                <span
                                  className='text-sm font-medium'
                                  style={{
                                    color: "var(--metrics-efficiency-text)",
                                  }}
                                >
                                  運行效率
                                </span>
                              </div>
                              <div
                                className='text-2xl font-bold mt-1'
                                style={{
                                  color: "var(--metrics-efficiency-text)",
                                }}
                              >
                                <CountUpNumber
                                  value={Number(
                                    telemetryData[
                                      telemetryData.length - 1
                                    ]?.efficiency_percent.toFixed(1)
                                  )}
                                  suffix='%'
                                  duration={1.5}
                                />
                              </div>
                              <div
                                className='text-xs mt-1'
                                style={{
                                  color: "var(--metrics-efficiency-text)",
                                  opacity: 0.8,
                                }}
                              >
                                平均效率:{" "}
                                <AnimatedNumber
                                  value={(
                                    telemetryData.reduce(
                                      (sum, d) => sum + d.efficiency_percent,
                                      0
                                    ) / telemetryData.length
                                  ).toFixed(1)}
                                  suffix='%'
                                />
                              </div>
                            </div>
                          </AnimatedCard>

                          <AnimatedCard delay={0.4} duration={0.5}>
                            <div
                              className='border rounded-lg p-3'
                              style={{
                                backgroundColor: "var(--metrics-vibration-bg)",
                                borderColor: "var(--metrics-vibration-text)",
                                borderWidth: "1px",
                              }}
                            >
                              <div className='flex items-center gap-2'>
                                <Waves
                                  className='h-4 w-4'
                                  style={{
                                    color: "var(--metrics-vibration-text)",
                                  }}
                                />
                                <span
                                  className='text-sm font-medium'
                                  style={{
                                    color: "var(--metrics-vibration-text)",
                                  }}
                                >
                                  振動水平
                                </span>
                              </div>
                              <div
                                className='text-2xl font-bold mt-1'
                                style={{
                                  color: "var(--metrics-vibration-text)",
                                }}
                              >
                                <CountUpNumber
                                  value={Number(
                                    telemetryData[
                                      telemetryData.length - 1
                                    ]?.vibration_level.toFixed(3)
                                  )}
                                  decimals={3}
                                  duration={1.2}
                                />
                              </div>
                              <div
                                className='text-xs mt-1'
                                style={{
                                  color: "var(--metrics-vibration-text)",
                                  opacity: 0.8,
                                }}
                              >
                                警戒閾值: 0.08
                              </div>
                            </div>
                          </AnimatedCard>
                        </>
                      ) : (
                        <>
                          {/* 靜態版本的卡片，沒有動畫效果 */}
                          <div
                            className='border rounded-lg p-3'
                            style={{
                              backgroundColor: "var(--metrics-temperature-bg)",
                              borderColor: "var(--metrics-temperature-text)",
                              borderWidth: "1px",
                            }}
                          >
                            <div className='flex items-center gap-2'>
                              <ThermometerSun
                                className='h-4 w-4'
                                style={{
                                  color: "var(--metrics-temperature-text)",
                                }}
                              />
                              <span
                                className='text-sm font-medium'
                                style={{
                                  color: "var(--metrics-temperature-text)",
                                }}
                              >
                                當前溫度
                              </span>
                            </div>
                            <div
                              className='text-2xl font-bold mt-1'
                              style={{
                                color: "var(--metrics-temperature-text)",
                              }}
                            >
                              {telemetryData.length > 0
                                ? Number(
                                    telemetryData[
                                      telemetryData.length - 1
                                    ]?.temperature.toFixed(1)
                                  )
                                : 0}
                              °C
                            </div>
                            {currentEquipment.type === "HVAC" && (
                              <div
                                className='text-xs mt-1'
                                style={{
                                  color: "var(--metrics-temperature-text)",
                                  opacity: 0.8,
                                }}
                              >
                                正常範圍: 35-45°C
                              </div>
                            )}
                          </div>

                          <div
                            className='border rounded-lg p-3'
                            style={{
                              backgroundColor: "var(--metrics-load-bg)",
                              borderColor: "var(--metrics-load-text)",
                              borderWidth: "1px",
                            }}
                          >
                            <div className='flex items-center gap-2'>
                              <Battery
                                className='h-4 w-4'
                                style={{ color: "var(--metrics-load-text)" }}
                              />
                              <span
                                className='text-sm font-medium'
                                style={{ color: "var(--metrics-load-text)" }}
                              >
                                當前負載
                              </span>
                            </div>
                            <div
                              className='text-2xl font-bold mt-1'
                              style={{ color: "var(--metrics-load-text)" }}
                            >
                              {telemetryData.length > 0
                                ? Number(
                                    telemetryData[
                                      telemetryData.length - 1
                                    ]?.load_percent.toFixed(1)
                                  )
                                : 0}
                              %
                            </div>
                            <div
                              className='text-xs mt-1'
                              style={{
                                color: "var(--metrics-load-text)",
                                opacity: 0.8,
                              }}
                            >
                              峰值負載:{" "}
                              {telemetryData.length > 0
                                ? Math.max(
                                    ...telemetryData.map((d) => d.load_percent)
                                  ).toFixed(1)
                                : 0}
                              %
                            </div>
                          </div>

                          <div
                            className='border rounded-lg p-3'
                            style={{
                              backgroundColor: "var(--metrics-efficiency-bg)",
                              borderColor: "var(--metrics-efficiency-text)",
                              borderWidth: "1px",
                            }}
                          >
                            <div className='flex items-center gap-2'>
                              <CheckCircle
                                className='h-4 w-4'
                                style={{
                                  color: "var(--metrics-efficiency-text)",
                                }}
                              />
                              <span
                                className='text-sm font-medium'
                                style={{
                                  color: "var(--metrics-efficiency-text)",
                                }}
                              >
                                運行效率
                              </span>
                            </div>
                            <div
                              className='text-2xl font-bold mt-1'
                              style={{
                                color: "var(--metrics-efficiency-text)",
                              }}
                            >
                              {telemetryData.length > 0
                                ? Number(
                                    telemetryData[
                                      telemetryData.length - 1
                                    ]?.efficiency_percent.toFixed(1)
                                  )
                                : 0}
                              %
                            </div>
                            <div
                              className='text-xs mt-1'
                              style={{
                                color: "var(--metrics-efficiency-text)",
                                opacity: 0.8,
                              }}
                            >
                              平均效率:{" "}
                              {telemetryData.length > 0
                                ? (
                                    telemetryData.reduce(
                                      (sum, d) => sum + d.efficiency_percent,
                                      0
                                    ) / telemetryData.length
                                  ).toFixed(1)
                                : 0}
                              %
                            </div>
                          </div>

                          <div
                            className='border rounded-lg p-3'
                            style={{
                              backgroundColor: "var(--metrics-vibration-bg)",
                              borderColor: "var(--metrics-vibration-text)",
                              borderWidth: "1px",
                            }}
                          >
                            <div className='flex items-center gap-2'>
                              <Waves
                                className='h-4 w-4'
                                style={{
                                  color: "var(--metrics-vibration-text)",
                                }}
                              />
                              <span
                                className='text-sm font-medium'
                                style={{
                                  color: "var(--metrics-vibration-text)",
                                }}
                              >
                                振動水平
                              </span>
                            </div>
                            <div
                              className='text-2xl font-bold mt-1'
                              style={{ color: "var(--metrics-vibration-text)" }}
                            >
                              {telemetryData.length > 0
                                ? Number(
                                    telemetryData[
                                      telemetryData.length - 1
                                    ]?.vibration_level.toFixed(3)
                                  )
                                : 0}
                            </div>
                            <div
                              className='text-xs mt-1'
                              style={{
                                color: "var(--metrics-vibration-text)",
                                opacity: 0.8,
                              }}
                            >
                              警戒閾值: 0.08
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 錯誤記錄 */}
                    {telemetryData.some((d) => d.error_code) && (
                      <div>
                        <Separator />
                        <div className='mt-4'>
                          <h3 className='text-sm font-medium mb-2'>錯誤記錄</h3>
                          <div className='space-y-2'>
                            {telemetryData
                              .filter((d) => d.error_code)
                              .map((error, idx) => (
                                <div
                                  key={idx}
                                  className='flex items-center gap-2 text-sm border rounded-md p-2'
                                >
                                  <AlertTriangle className='h-4 w-4 text-red-500' />
                                  <span className='font-medium'>
                                    {error.error_code}
                                  </span>
                                  <span className='text-muted-foreground'>
                                    {formatDetailedTime(error.timestamp)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!currentEquipment && !isLoading && (
          <div className='flex justify-center items-center h-[200px] text-muted-foreground'>
            請選擇一個設備以查看詳細信息
          </div>
        )}
      </div>
    </TransitionWrapper>
  );
}
