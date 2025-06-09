"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";

interface LLMUsageData {
  models: {
    [key: string]: {
      total_tokens: number;
      prompt_tokens: number;
      completion_tokens: number;
      total_cost: number;
      requests: number;
      avg_tokens_per_request: number;
      usage_by_day: {
        date: string;
        total_tokens: number;
        cost: number;
      }[];
    };
  };
  total: {
    total_tokens: number;
    total_cost: number;
    total_requests: number;
  };
}

interface UsageChartsProps {
  data: LLMUsageData;
}

export function UsageCharts({ data }: UsageChartsProps) {
  // 檢查是否有模型數據
  const hasModelData = Object.keys(data.models).length > 0;
  
  // 獲取所有日期並合併所有模型的每日數據
  const mergedDailyData = (() => {
    if (!hasModelData) return [];
    
    const dateMap = new Map<string, { date: string; [key: string]: any }>();
    
    // 對於每個模型
    Object.entries(data.models).forEach(([modelName, modelData]) => {
      // 對於該模型的每一天數據
      modelData.usage_by_day.forEach(dayData => {
        const existingData = dateMap.get(dayData.date) || { date: dayData.date };
        dateMap.set(dayData.date, {
          ...existingData,
          [`${modelName}_tokens`]: dayData.total_tokens,
          [`${modelName}_cost`]: dayData.cost,
        });
      });
    });
    
    // 將Map轉換為按日期排序的陣列
    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  })();

  // 為餅圖準備數據
  const tokenPieData = hasModelData ? Object.entries(data.models).map(([name, model]) => ({
    name,
    value: model.total_tokens,
    color: name === "openai" ? "#34d399" : "#a78bfa", // 更溫和的綠色和紫色
  })) : [];

  const costPieData = hasModelData ? Object.entries(data.models).map(([name, model]) => ({
    name,
    value: model.total_cost,
    color: name === "openai" ? "#34d399" : "#a78bfa", // 更溫和的綠色和紫色
  })) : [];

  // 為對比圖準備模型比較數據
  const modelComparisonData = hasModelData ? Object.entries(data.models).map(([name, model]) => ({
    name: name === "openai" ? "OpenAI" : name === "gemini" ? "Google Gemini" : name,
    tokens: model.total_tokens,
    cost: model.total_cost,
    requests: model.requests,
    avg_tokens: model.avg_tokens_per_request,
  })) : [];

  // 如果沒有數據，顯示占位符信息
  const EmptyChart = () => (
    <div className="flex items-center justify-center h-40 w-full border border-dashed rounded-lg">
      <span className="text-muted-foreground">無數據</span>
    </div>
  );

  return (
    <div className="grid gap-4">
      {/* 總數據指標卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">總令牌數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total.total_tokens > 0 
                ? data.total.total_tokens.toLocaleString() 
                : "-"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              平均每次請求: {data.total.total_requests > 0 
                ? Math.round(data.total.total_tokens / data.total.total_requests) 
                : "-"} {data.total.total_requests > 0 ? "令牌" : ""}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">總費用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total.total_cost > 0 
                ? `$${data.total.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : "-"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              平均每千令牌: {data.total.total_tokens > 0 
                ? `$${((data.total.total_cost / data.total.total_tokens) * 1000).toFixed(3)}` 
                : "-"}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">API 請求數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total.total_requests > 0 
                ? data.total.total_requests.toLocaleString() 
                : "-"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              平均每請求費用: {data.total.total_requests > 0 
                ? `$${(data.total.total_cost / data.total.total_requests).toFixed(3)}` 
                : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 模型使用量比較 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">令牌分佈</CardTitle>
            <CardDescription>各模型令牌使用量佔比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {hasModelData && tokenPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tokenPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={5}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name === "openai" ? "OpenAI" : name === "gemini" ? "Gemini" : name}: ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {tokenPieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [
                        `${value.toLocaleString()} 令牌`, 
                        `${tokenPieData.find(item => item.value === value)?.name === "openai" ? "OpenAI" : "Gemini"}`
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        padding: '8px 12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">費用分佈</CardTitle>
            <CardDescription>各模型費用佔比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {hasModelData && costPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={5}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name === "openai" ? "OpenAI" : name === "gemini" ? "Gemini" : name}: ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {costPieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [
                        `$${value.toFixed(2)}`, 
                        `${costPieData.find(item => item.value === value)?.name === "openai" ? "OpenAI" : "Gemini"}`
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        padding: '8px 12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 每日使用量圖表 */}
      <Card className="border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">每日令牌使用量</CardTitle>
          <CardDescription>過去30天的令牌使用趨勢</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {hasModelData && mergedDailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 142, 160, 0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = parseISO(value);
                      return format(date, "MM/dd", { locale: zhTW });
                    }}
                    stroke="#888"
                  />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    formatter={(value, name) => [
                      Number(value).toLocaleString(), 
                      name.includes("cost") ? "費用" : "令牌"
                    ]}
                    labelFormatter={(label) => format(parseISO(label), "yyyy-MM-dd", { locale: zhTW })}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend formatter={(value) => {
                    if (value === "openai_tokens") return "OpenAI 令牌";
                    if (value === "gemini_tokens") return "Gemini 令牌";
                    return value;
                  }} />
                  <Line 
                    type="monotone" 
                    dataKey="openai_tokens" 
                    stroke="#34d399" 
                    activeDot={{ r: 8 }} 
                    name="openai_tokens"
                    strokeWidth={2}
                    dot={{ stroke: '#34d399', strokeWidth: 2, fill: '#fff', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gemini_tokens" 
                    stroke="#a78bfa" 
                    activeDot={{ r: 8 }} 
                    name="gemini_tokens"
                    strokeWidth={2}
                    dot={{ stroke: '#a78bfa', strokeWidth: 2, fill: '#fff', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 每日費用圖表 */}
      <Card className="border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">每日費用</CardTitle>
          <CardDescription>過去30天的使用費用趨勢</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {hasModelData && mergedDailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 142, 160, 0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = parseISO(value);
                      return format(date, "MM/dd", { locale: zhTW });
                    }}
                    stroke="#888"
                  />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    formatter={(value, name) => [
                      `$${Number(value).toFixed(2)}`, 
                      name.includes("openai") ? "OpenAI" : "Gemini"
                    ]}
                    labelFormatter={(label) => format(parseISO(label), "yyyy-MM-dd", { locale: zhTW })}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend formatter={(value) => {
                    if (value === "openai_cost") return "OpenAI 費用";
                    if (value === "gemini_cost") return "Gemini 費用";
                    return value;
                  }} />
                  <Line 
                    type="monotone" 
                    dataKey="openai_cost" 
                    stroke="#34d399" 
                    activeDot={{ r: 8 }} 
                    name="openai_cost"
                    strokeWidth={2}
                    dot={{ stroke: '#34d399', strokeWidth: 2, fill: '#fff', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gemini_cost" 
                    stroke="#a78bfa" 
                    activeDot={{ r: 8 }} 
                    name="gemini_cost"
                    strokeWidth={2}
                    dot={{ stroke: '#a78bfa', strokeWidth: 2, fill: '#fff', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 模型比較 */}
      <Card className="border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">模型比較</CardTitle>
          <CardDescription>各模型指標對比</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {hasModelData && modelComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 142, 160, 0.1)" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis yAxisId="left" orientation="left" stroke="#34d399" />
                  <YAxis yAxisId="right" orientation="right" stroke="#a78bfa" />
                  <Tooltip formatter={(value, name) => {
                    if (name === "tokens") return [value.toLocaleString(), "總令牌數"];
                    if (name === "cost") return [`$${value.toFixed(2)}`, "總費用"];
                    if (name === "requests") return [value.toLocaleString(), "請求數"];
                    if (name === "avg_tokens") return [value.toLocaleString(), "平均每請求令牌數"];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    padding: '8px 12px'
                  }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="tokens" name="總令牌數" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="cost" name="總費用" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 