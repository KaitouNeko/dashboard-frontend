import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface EnergyUsageChartProps {
  data: {
    time: Date;
    usage: number;
    temperature?: number;
  }[];
  interval: "hourly" | "daily" | "weekly";
}

export function EnergyUsageChart({ data, interval }: EnergyUsageChartProps) {
  const chartData = React.useMemo(() => {
    return data.map((item) => {
      let formattedTime;
      switch (interval) {
        case "hourly":
          formattedTime = format(item.time, "HH:mm", { locale: zhTW });
          break;
        case "daily":
          formattedTime = format(item.time, "MM/dd", { locale: zhTW });
          break;
        case "weekly":
          formattedTime = format(item.time, "MM/dd", { locale: zhTW });
          break;
        default:
          formattedTime = format(item.time, "HH:mm", { locale: zhTW });
      }
      return {
        ...item,
        formattedTime,
        // 將用電量四捨五入到小數點第一位
        usage: Number(item.usage.toFixed(1)),
        // 如果有溫度數據，也進行四捨五入
        temperature: item.temperature ? Number(item.temperature.toFixed(1)) : undefined,
      };
    });
  }, [data, interval]);

  // 計算圖表中顯示的單位
  const getUnit = () => {
    switch (interval) {
      case "hourly":
        return "kWh/小時";
      case "daily":
        return "kWh/天";
      case "weekly":
        return "kWh/週";
      default:
        return "kWh";
    }
  };

  // 根據不同的時間間隔顯示不同的圖表標題
  const getChartTitle = () => {
    switch (interval) {
      case "hourly":
        return "每小時能源使用量";
      case "daily":
        return "每天能源使用量";
      case "weekly":
        return "每週能源使用量";
      default:
        return "能源使用量";
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
        <CardDescription>了解能源使用模式，找出優化機會</CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {interval === "hourly" ? (
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedTime" />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  label={{ 
                    value: getUnit(), 
                    angle: -90,
                    position: "insideLeft" 
                  }} 
                />
                {chartData[0]?.temperature && (
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ 
                      value: "溫度 (°C)", 
                      angle: 90, 
                      position: "insideRight" 
                    }} 
                  />
                )}
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "usage") return [`${value} kWh`, "用電量"];
                    if (name === "temperature") return [`${value} °C`, "室內溫度"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `時間: ${label}`}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="usage"
                  name="用電量"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                {chartData[0]?.temperature && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="temperature"
                    name="室內溫度"
                    stroke="#82ca9d"
                  />
                )}
              </LineChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedTime" />
                <YAxis 
                  label={{ 
                    value: getUnit(), 
                    angle: -90, 
                    position: "insideLeft" 
                  }} 
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "usage") return [`${value} kWh`, "用電量"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => 
                    interval === "daily" 
                      ? `日期: ${label}` 
                      : `週: ${label}`
                  }
                />
                <Legend />
                <Bar dataKey="usage" name="用電量" fill="#8884d8" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 