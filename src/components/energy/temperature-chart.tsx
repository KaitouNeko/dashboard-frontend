'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TemperatureChartProps {
  data: any[];
  height?: number;
}

export function TemperatureChart({
  data,
  height = 300,
}: TemperatureChartProps) {
  // 分離歷史數據和預測數據
  const historyData = data.filter((item) => !item.is_prediction);
  const predictedData = data.filter((item) => item.is_prediction);

  // 計算趨勢線
  const calculateTrendLine = (inputData: any[]) => {
    // 獲取所有資料點
    const points = inputData.map((item) => ({
      x: item.temperature_celsius,
      y: item.energy_kwh,
    }));

    // 平均值
    const avgX =
      points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const avgY =
      points.reduce((sum, point) => sum + point.y, 0) / points.length;

    // 計算斜率 (線性回歸)
    let numerator = 0;
    let denominator = 0;

    for (const point of points) {
      numerator += (point.x - avgX) * (point.y - avgY);
      denominator += (point.x - avgX) * (point.x - avgX);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = avgY - slope * avgX;

    // 建立趨勢線的兩個端點
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));

    return [
      { temperature: minX, energy: slope * minX + intercept },
      { temperature: maxX, energy: slope * maxX + intercept },
    ];
  };

  const trendLine = calculateTrendLine(historyData);

  // 工具提示
  const renderTooltip = (props: any) => {
    const { active, payload } = props;

    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div
          className="glass-effect border shadow-md p-3 rounded-md"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <p className="text-sm">
            <span className="font-medium">溫度: </span>
            <span>{data.temperature_celsius}°C</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">能源使用: </span>
            <span>{data.energy_kwh.toLocaleString()} kWh</span>
          </p>
          {data.is_prediction && (
            <p className="text-xs text-muted-foreground mt-1">(預測數據)</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          type="number"
          dataKey="temperature_celsius"
          name="溫度"
          label={{
            value: '溫度 (°C)',
            position: 'insideBottomRight',
            offset: -10,
          }}
          domain={['auto', 'auto']}
          stroke="var(--border)"
        />
        <YAxis
          type="number"
          dataKey="energy_kwh"
          name="能源使用"
          label={{
            value: '能源使用 (kWh)',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle' },
          }}
          domain={['auto', 'auto']}
          stroke="var(--border)"
        />
        <Tooltip content={renderTooltip} />
        <Legend />

        {/* 歷史數據散點圖 */}
        <Scatter
          name="歷史數據"
          data={historyData}
          fill="var(--metrics-load-text)"
          opacity={0.7}
        />

        {/* 預測數據散點圖 */}
        <Scatter
          name="預測數據"
          data={predictedData}
          fill="var(--primary)"
          opacity={0.7}
        />

        {/* 趨勢線 */}
        <Scatter
          name="趨勢線"
          data={trendLine}
          fill="none"
          line={{ stroke: 'var(--metrics-temperature-text)', strokeWidth: 2 }}
          lineType="fitting"
          shape="circle"
          legendType="line"
          opacity={0}
          xAxisId={0}
          yAxisId={0}
          dataKey="energy"
          // xAxisKey="temperature"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
