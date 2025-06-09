import React from "react";
import { EnergyUsageChart } from "./EnergyUsageChart";
import { EnergyTimeRangeSelector } from "./EnergyTimeRangeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, subHours, subMonths, subWeeks } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, LightbulbIcon, BarChart3Icon, TrendingDownIcon, ThermometerIcon } from "lucide-react";

interface EnergyOverviewProps {
  buildingId: string;
}

export function EnergyOverview({ buildingId }: EnergyOverviewProps) {
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = React.useState<"hourly" | "daily" | "weekly">("daily");

  // 這裡只是模擬數據，實際應用中應該從API獲取
  const generateMockData = React.useCallback(() => {
    const hourlyData = [];
    const dailyData = [];
    const weeklyData = [];

    // 生成小時數據
    let startDate = subHours(new Date(), 48);
    for (let i = 0; i < 48; i++) {
      const time = new Date(startDate.getTime() + i * 60 * 60 * 1000);
      const baseUsage = 2 + Math.random() * 3; // 基礎用電量
      const hourlyFactor = 1 + Math.sin((time.getHours() - 6) * Math.PI / 12) * 0.7; // 早上6點最低，下午6點最高
      const temperature = 22 + Math.sin((time.getHours() - 6) * Math.PI / 12) * 3; // 溫度變化

      hourlyData.push({
        time,
        usage: baseUsage * hourlyFactor,
        temperature,
      });
    }

    // 生成每日數據
    startDate = subDays(new Date(), 30);
    for (let i = 0; i < 30; i++) {
      const time = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const isWeekend = time.getDay() === 0 || time.getDay() === 6;
      const baseUsage = isWeekend ? 30 + Math.random() * 10 : 45 + Math.random() * 15;
      
      dailyData.push({
        time,
        usage: baseUsage,
      });
    }

    // 生成每週數據
    startDate = subWeeks(new Date(), 12);
    for (let i = 0; i < 12; i++) {
      const time = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const baseUsage = 280 + Math.random() * 50;
      
      weeklyData.push({
        time,
        usage: baseUsage,
      });
    }

    return { hourlyData, dailyData, weeklyData };
  }, []);

  const { hourlyData, dailyData, weeklyData } = React.useMemo(() => generateMockData(), [generateMockData]);

  // 計算當前的能源使用統計數據
  const energyStats = React.useMemo(() => {
    // 計算總消耗量
    const totalConsumption = dailyData.slice(23, 30).reduce((sum, item) => sum + item.usage, 0);
    const prevTotalConsumption = dailyData.slice(16, 23).reduce((sum, item) => sum + item.usage, 0);
    const consumptionChange = (totalConsumption - prevTotalConsumption) / prevTotalConsumption * 100;

    // 計算平均日消耗量
    const avgDailyConsumption = totalConsumption / 7;
    const prevAvgDailyConsumption = prevTotalConsumption / 7;
    const avgDailyChange = (avgDailyConsumption - prevAvgDailyConsumption) / prevAvgDailyConsumption * 100;

    // 計算尖峰負載
    const peakLoad = Math.max(...hourlyData.map(item => item.usage));
    const prevHourlyData = Array(48).fill(0).map((_, i) => ({
      usage: 2 + Math.random() * 4 + Math.sin(i * Math.PI / 12) * 0.7,
    }));
    const prevPeakLoad = Math.max(...prevHourlyData.map(item => item.usage));
    const peakLoadChange = (peakLoad - prevPeakLoad) / prevPeakLoad * 100;

    // 計算碳排放
    const carbonFactor = 0.509; // 每度電排放的CO2公斤數
    const carbonEmission = totalConsumption * carbonFactor;
    const prevCarbonEmission = prevTotalConsumption * carbonFactor;
    const carbonChange = (carbonEmission - prevCarbonEmission) / prevCarbonEmission * 100;

    return {
      totalConsumption: totalConsumption.toFixed(1),
      consumptionChange,
      avgDailyConsumption: avgDailyConsumption.toFixed(1),
      avgDailyChange,
      peakLoad: peakLoad.toFixed(1),
      peakLoadChange,
      carbonEmission: carbonEmission.toFixed(1),
      carbonChange,
    };
  }, [dailyData, hourlyData]);

  const handleDateSubmit = () => {
    console.log("Fetching new data for date range:", dateRange);
    // 這裡實際應該調用API重新獲取數據
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">能源使用分析</h2>
        <EnergyTimeRangeSelector 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          onSubmit={handleDateSubmit} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總用電量</CardTitle>
            <LightbulbIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyStats.totalConsumption} kWh</div>
            <p className="text-xs text-muted-foreground">
              過去7天總計用電量
            </p>
            <div className="flex items-center pt-1">
              {energyStats.consumptionChange > 0 ? (
                <ArrowUpIcon className="mr-1 h-3.5 w-3.5 text-destructive" />
              ) : (
                <ArrowDownIcon className="mr-1 h-3.5 w-3.5 text-emerald-500" />
              )}
              <span className={`text-xs font-medium ${
                energyStats.consumptionChange > 0 ? 'text-destructive' : 'text-emerald-500'
              }`}>
                {Math.abs(energyStats.consumptionChange).toFixed(1)}% 
                {energyStats.consumptionChange > 0 ? '增加' : '減少'}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                相比上週
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均日用電量</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyStats.avgDailyConsumption} kWh</div>
            <p className="text-xs text-muted-foreground">
              過去7天平均每日用電量
            </p>
            <div className="flex items-center pt-1">
              {energyStats.avgDailyChange > 0 ? (
                <ArrowUpIcon className="mr-1 h-3.5 w-3.5 text-destructive" />
              ) : (
                <ArrowDownIcon className="mr-1 h-3.5 w-3.5 text-emerald-500" />
              )}
              <span className={`text-xs font-medium ${
                energyStats.avgDailyChange > 0 ? 'text-destructive' : 'text-emerald-500'
              }`}>
                {Math.abs(energyStats.avgDailyChange).toFixed(1)}% 
                {energyStats.avgDailyChange > 0 ? '增加' : '減少'}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                相比上週
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">尖峰負載</CardTitle>
            <ThermometerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyStats.peakLoad} kW</div>
            <p className="text-xs text-muted-foreground">
              過去48小時內最高用電需求
            </p>
            <div className="flex items-center pt-1">
              {energyStats.peakLoadChange > 0 ? (
                <ArrowUpIcon className="mr-1 h-3.5 w-3.5 text-destructive" />
              ) : (
                <ArrowDownIcon className="mr-1 h-3.5 w-3.5 text-emerald-500" />
              )}
              <span className={`text-xs font-medium ${
                energyStats.peakLoadChange > 0 ? 'text-destructive' : 'text-emerald-500'
              }`}>
                {Math.abs(energyStats.peakLoadChange).toFixed(1)}% 
                {energyStats.peakLoadChange > 0 ? '增加' : '減少'}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                相比前48小時
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">碳排放量</CardTitle>
            <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyStats.carbonEmission} kg</div>
            <p className="text-xs text-muted-foreground">
              過去7天總計碳排放量
            </p>
            <div className="flex items-center pt-1">
              {energyStats.carbonChange > 0 ? (
                <ArrowUpIcon className="mr-1 h-3.5 w-3.5 text-destructive" />
              ) : (
                <ArrowDownIcon className="mr-1 h-3.5 w-3.5 text-emerald-500" />
              )}
              <span className={`text-xs font-medium ${
                energyStats.carbonChange > 0 ? 'text-destructive' : 'text-emerald-500'
              }`}>
                {Math.abs(energyStats.carbonChange).toFixed(1)}% 
                {energyStats.carbonChange > 0 ? '增加' : '減少'}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                相比上週
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="hourly">小時</TabsTrigger>
          <TabsTrigger value="daily">日</TabsTrigger>
          <TabsTrigger value="weekly">週</TabsTrigger>
        </TabsList>
        <TabsContent value="hourly">
          <EnergyUsageChart data={hourlyData} interval="hourly" />
        </TabsContent>
        <TabsContent value="daily">
          <EnergyUsageChart data={dailyData} interval="daily" />
        </TabsContent>
        <TabsContent value="weekly">
          <EnergyUsageChart data={weeklyData} interval="weekly" />
        </TabsContent>
      </Tabs>
    </div>
  );
} 