"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BarChartIcon } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api-service";
import { UsageCharts } from "@/components/llm-analytics/usage-charts";
import { ModelsTable } from "@/components/llm-analytics/models-table";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// 統一卡片樣式的自定義Card元件
const ThemedCard = ({ className, ...props }: React.ComponentProps<typeof Card>) => (
  <Card 
    className={cn(
      "border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300",
      "bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80",
      className
    )} 
    {...props} 
  />
);

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [useMock, setUseMock] = useState(true);
  const [rangeDate, setRangeDate] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // 載入LLM使用統計數據
  const loadLLMStats = async () => {
    setLoading(true);
    try {
      const startDate = rangeDate.from.toISOString().split('T')[0];
      const endDate = rangeDate.to.toISOString().split('T')[0];
      
      const data = await ApiService.getLLMStats(startDate, endDate, undefined, useMock);
      setStatsData(data);
    } catch (error) {
      console.error("載入LLM統計數據失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  // 當日期範圍或模擬數據開關變更時重新載入數據
  useEffect(() => {
    loadLLMStats();
  }, [rangeDate, useMock]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">LLM使用分析</h1>
          <p className="text-muted-foreground">
            查看OpenAI和Google Gemini API的使用量和費用統計。
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="mock-data" 
              checked={useMock} 
              onCheckedChange={setUseMock}
            />
            <Label htmlFor="mock-data" className="cursor-pointer">
              {useMock ? "使用模擬數據" : "使用真實數據"}
            </Label>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {rangeDate?.from ? (
                  rangeDate.to ? (
                    <>
                      {format(rangeDate.from, "yyyy-MM-dd", { locale: zhTW })} -{" "}
                      {format(rangeDate.to, "yyyy-MM-dd", { locale: zhTW })}
                    </>
                  ) : (
                    format(rangeDate.from, "yyyy-MM-dd", { locale: zhTW })
                  )
                ) : (
                  <span>選擇日期範圍</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={rangeDate?.from}
                selected={rangeDate}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setRangeDate({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
                locale={zhTW}
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={loadLLMStats} className="bg-primary/90  hover:bg-primary ">
            <BarChartIcon className="mr-2 h-4 w-4" />
            重新整理
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-primary">總覽</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-primary">詳細數據</TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-primary">模型比較</TabsTrigger>
          <TabsTrigger value="optimization" className="data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-primary">優化建議</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <ThemedCard>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
                </div>
              </CardContent>
            </ThemedCard>
          ) : statsData ? (
            <UsageCharts data={statsData} />
          ) : (
            <ThemedCard>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">無法載入統計數據</p>
                </div>
              </CardContent>
            </ThemedCard>
          )}
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          {loading ? (
            <ThemedCard>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
                </div>
              </CardContent>
            </ThemedCard>
          ) : statsData ? (
            <ModelsTable data={statsData} />
          ) : (
            <ThemedCard>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">無法載入詳細數據</p>
                </div>
              </CardContent>
            </ThemedCard>
          )}
        </TabsContent>
        
        <TabsContent value="models" className="space-y-4">
          <ThemedCard>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">模型效能比較</CardTitle>
              <CardDescription>比較不同LLM模型在各種任務上的表現</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 space-y-4 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300">
                  <h3 className="font-semibold flex items-center">
                    <span className="inline-block h-3 w-3 rounded-full bg-emerald-400 mr-2"></span>
                    OpenAI GPT-4
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>文本摘要</span>
                      <span className="font-medium">96%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-emerald-400 w-[96%]" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>資訊擷取</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-emerald-400 w-[92%]" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>程式碼生成</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-emerald-400 w-[94%]" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>創意寫作</span>
                      <span className="font-medium">89%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-emerald-400 w-[89%]" />
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 space-y-4 hover:border-purple-100 dark:hover:border-purple-900/30 transition-all duration-300">
                  <h3 className="font-semibold flex items-center">
                    <span className="inline-block h-3 w-3 rounded-full bg-purple-400 mr-2"></span>
                    Google Gemini
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>文本摘要</span>
                      <span className="font-medium">89%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-purple-400 w-[89%]" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>資訊擷取</span>
                      <span className="font-medium">91%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-purple-400 w-[91%]" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>程式碼生成</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-purple-400 w-[87%]" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>創意寫作</span>
                      <span className="font-medium">84%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-purple-400 w-[84%]" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300">
                <h3 className="font-semibold mb-4">效能與價格比較</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="pb-2 text-left font-medium">模型</th>
                      <th className="pb-2 text-right font-medium">平均回應時間</th>
                      <th className="pb-2 text-right font-medium">每千令牌價格</th>
                      <th className="pb-2 text-right font-medium">性價比指數</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 flex items-center">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                        OpenAI GPT-4
                      </td>
                      <td className="py-3 text-right">1.8 秒</td>
                      <td className="py-3 text-right">$0.03</td>
                      <td className="py-3 text-right">87%</td>
                    </tr>
                    <tr>
                      <td className="py-3 flex items-center">
                        <span className="inline-block h-2 w-2 rounded-full bg-purple-400 mr-2"></span>
                        Google Gemini
                      </td>
                      <td className="py-3 text-right">1.2 秒</td>
                      <td className="py-3 text-right">$0.0025</td>
                      <td className="py-3 text-right">93%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </ThemedCard>
        </TabsContent>
        
        <TabsContent value="optimization" className="space-y-4">
          <ThemedCard>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">令牌使用優化建議</CardTitle>
              <CardDescription>根據您當前的使用模式提供的優化建議</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2">提示詞優化</h3>
                  <p className="text-sm text-muted-foreground mb-4">精簡提示詞可減少令牌使用並降低成本</p>
                  
                  <div className="space-y-4">
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex items-center">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-400 mr-2"></span>
                        <h4 className="font-medium">目前提示詞模式:</h4>
                      </div>
                      <p className="mt-2 text-sm">
                        "請給我提供關於人工智能的詳細信息，包括它的定義、歷史、當前應用、未來發展以及可能帶來的社會影響。請盡可能詳細描述各個方面，並提供具體的例子來說明。"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">32 個令牌</p>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex items-center">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                        <h4 className="font-medium">優化後的提示詞:</h4>
                      </div>
                      <p className="mt-2 text-sm">
                        "簡述AI的定義、歷史、應用和社會影響。"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">12 個令牌 (-62%)</p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2">模型選擇優化</h3>
                  <p className="text-sm text-muted-foreground mb-4">針對不同任務選擇適合的模型</p>
                  
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm text-muted-foreground">
                        <th className="pb-2 text-left font-medium">任務類型</th>
                        <th className="pb-2 text-left font-medium">建議模型</th>
                        <th className="pb-2 text-right font-medium">潛在節約</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">簡單問答、摘要</td>
                        <td className="py-2">Gemini</td>
                        <td className="py-2 text-right text-emerald-400">-80%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">基礎內容生成</td>
                        <td className="py-2">Gemini</td>
                        <td className="py-2 text-right text-emerald-400">-70%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">複雜推理、分析</td>
                        <td className="py-2">OpenAI (GPT-3.5)</td>
                        <td className="py-2 text-right text-emerald-400">-50%</td>
                      </tr>
                      <tr>
                        <td className="py-2">高級創意、專業內容</td>
                        <td className="py-2">OpenAI (GPT-4)</td>
                        <td className="py-2 text-right">--</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2">批量處理優化</h3>
                  <p className="text-sm text-muted-foreground mb-4">合併類似請求以減少API調用次數</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-500 text-xs flex items-center justify-center mt-0.5 mr-2">1</span>
                      <div>
                        <p className="text-sm">將多個相似問題合併為一個API請求</p>
                        <p className="text-xs text-muted-foreground mt-0.5">每批處理預計節省15-25%的令牌</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-500 text-xs flex items-center justify-center mt-0.5 mr-2">2</span>
                      <div>
                        <p className="text-sm">實施令牌緩存機制，避免重複生成相同內容</p>
                        <p className="text-xs text-muted-foreground mt-0.5">針對常見查詢可節省30-40%的令牌使用</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="inline-block h-5 w-5 rounded-full bg-emerald-100 text-emerald-500 text-xs flex items-center justify-center mt-0.5 mr-2">3</span>
                      <div>
                        <p className="text-sm">設定最大輸出長度限制</p>
                        <p className="text-xs text-muted-foreground mt-0.5">可以有效控制模型的輸出令牌數量</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </ThemedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
} 