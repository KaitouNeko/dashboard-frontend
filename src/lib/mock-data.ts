// 能源使用模擬數據
import { addHours, format, subDays, subHours } from 'date-fns';

// 設施數據
export const facilities = [
  {
    id: '1',
    name: "台北數據中心 A",
    location: "台灣台北市",
    total_capacity_kw: 5000
  },
  {
    id: '2',
    name: "新竹數據中心 B",
    location: "台灣新竹市",
    total_capacity_kw: 3500
  },
  {
    id: '3',
    name: "台中數據中心 C",
    location: "台灣台中市",
    total_capacity_kw: 4200
  }
];

// 生成歷史能源使用數據 (過去7天，每小時一筆)
export const generateHistoricalEnergyData = (facilityId: string) => {
  console.warn("mock data")
  const data = [];
  const now = new Date();
  const startDate = subDays(now, 7);
  
  // 基本負載
  const baseLoad = facilityId === '1' ? 450 : facilityId === '2' ? 320 : 380;
  
  // 從7天前開始，每小時生成一筆數據
  for (let i = 0; i < 24 * 7; i++) {
    const timestamp = addHours(startDate, i);
    const hour = timestamp.getHours();
    
    // 根據時間生成波動
    // 白天負載較高，夜間較低
    const timeVariation = hour >= 8 && hour <= 18 
      ? Math.random() * 50 + 30  // 工作時間
      : Math.random() * 20;      // 非工作時間
      
    // 溫度也根據時間變化
    const baseTemp = 24;
    const tempVariation = hour >= 10 && hour <= 15
      ? Math.random() * 5 + 3    // 中午溫度較高
      : Math.random() * 3;       // 其他時間溫度較低
    
    const temperature = baseTemp + tempVariation;
    
    // 能源使用量受溫度影響
    // 當溫度高於26度，每增加1度，能源消耗增加約10-15 kWh
    const tempEffect = temperature > 26 
      ? (temperature - 26) * (Math.random() * 5 + 10)
      : 0;
    
    // 最終能源使用量
    const energyUsage = baseLoad + timeVariation + tempEffect;
    
    data.push({
      id: i + 1,
      facility_id: facilityId,
      timestamp: timestamp.toISOString(),
      energy_kwh: parseFloat(energyUsage.toFixed(1)),
      temperature_celsius: parseFloat(temperature.toFixed(1)),
      humidity_percent: parseFloat((60 + Math.random() * 15).toFixed(1))
    });
  }
  
  return data;
};

// 能源使用預測模型（簡化的線性回歸模型）
export const predictEnergyUsage = (
  historicalData: any[], 
  hoursToPredict: number
) => {
  const predictions = [];
  
  // 檢查歷史數據是否為空
  if (!historicalData || historicalData.length === 0) {
    const now = new Date();
    
    // 如果沒有歷史數據，生成一些模擬預測數據
    for (let i = 1; i <= hoursToPredict; i++) {
      const predictedTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hour = predictedTime.getHours();
      
      // 簡單的負載模式
      let baseLoad = 350; // 基本負載
      if (hour >= 8 && hour <= 18) {
        baseLoad += 80; // 工作時間負載較高
      }
      
      // 隨機變化
      const randomVariation = (Math.random() * 50) - 25;
      const energy = baseLoad + randomVariation;
      
      // 溫度和濕度也有些變化
      const temperature = 25 + (Math.random() * 5);
      const humidity = 60 + (Math.random() * 15);
      
      predictions.push({
        id: `pred-${i}`,
        facility_id: "Building-A", // 預設設施ID
        timestamp: predictedTime.toISOString(),
        energy_kwh: parseFloat(energy.toFixed(1)),
        temperature_celsius: parseFloat(temperature.toFixed(1)),
        humidity_percent: parseFloat(humidity.toFixed(1)),
        is_prediction: true,
        confidence_level: parseFloat((0.95 - (i / hoursToPredict) * 0.2).toFixed(2))
      });
    }
    
    return predictions;
  }
  
  const lastEntry = historicalData[historicalData.length - 1];
  const lastTimestamp = new Date(lastEntry.timestamp);
  
  // 簡單的線性模型參數 (在實際應用中，這應該通過適當的回歸分析來確定)
  const tempCoefficient = 12.5;  // 每升高1度溫度，能源增加12.5 kWh
  const baseTemp = 26;           // 基準溫度
  const hourlyPattern = [
    0.85, 0.82, 0.8, 0.78, 0.75, 0.78,             // 0-5 凌晨
    0.85, 0.95, 1.05, 1.15, 1.2, 1.25,             // 6-11 上午
    1.3, 1.28, 1.25, 1.2, 1.15, 1.1,               // 12-17 下午
    1.05, 1.0, 0.95, 0.9, 0.88, 0.87               // 18-23 晚上
  ];
  
  // 基本負載
  const facilityId = lastEntry.facility_id;
  const baseLoad = facilityId === '1' ? 450 : facilityId === '2' ? 320 : 380;
  
  for (let i = 1; i <= hoursToPredict; i++) {
    const predictedTime = addHours(lastTimestamp, i);
    const hour = predictedTime.getHours();
    
    // 預測溫度 - 在實際應用中，這應該來自天氣預報API
    // 這裡我們使用一個簡化模型，基於時間
    const baseTemp = 24;
    const tempVariation = hour >= 10 && hour <= 15
      ? Math.random() * 4 + 4    // 中午溫度較高
      : Math.random() * 3 + 1;   // 其他時間溫度較低
    
    const predictedTemp = baseTemp + tempVariation;
    
    // 預測能源使用量
    const hourCoefficient = hourlyPattern[hour];
    const tempEffect = predictedTemp > baseTemp 
      ? (predictedTemp - baseTemp) * tempCoefficient
      : 0;
    
    const predictedEnergy = (baseLoad * hourCoefficient) + tempEffect;
    
    // 加入預測不確定性
    const randomVariation = (Math.random() * 0.1 - 0.05) * predictedEnergy;
    const finalPrediction = predictedEnergy + randomVariation;
    
    predictions.push({
      id: `pred-${i}`,
      facility_id: facilityId,
      timestamp: predictedTime.toISOString(),
      energy_kwh: parseFloat(finalPrediction.toFixed(1)),
      temperature_celsius: parseFloat(predictedTemp.toFixed(1)),
      humidity_percent: parseFloat((60 + Math.random() * 15).toFixed(1)),
      is_prediction: true,
      confidence_level: parseFloat((0.95 - (i / hoursToPredict) * 0.2).toFixed(2)) // 隨著預測時間延長，置信度降低
    });
  }
  
  return predictions;
};

// 獲取能源異常警報
export const getEnergyAnomalies = (data: any[]) => {
  // 在實際應用中，這應該使用更複雜的異常檢測算法
  // 這裡我們使用一個簡單的閾值法
  const anomalies = data.filter(entry => {
    // 如果能源使用超過500 kWh且溫度不足以解釋這種高使用量，則標記為異常
    return entry.energy_kwh > 500 && entry.temperature_celsius < 30;
  });
  
  return anomalies.map(anomaly => ({
    ...anomaly,
    anomaly_type: 'high_usage',
    description: `異常高能源使用：${anomaly.energy_kwh} kWh，而溫度僅為 ${anomaly.temperature_celsius}°C`
  }));
};

// 生成設備數據
export const equipment = [
  {
    id: 1,
    facility_id: '1',
    type: "HVAC",
    name: "冷卻系統 A-1",
    installed_date: "2022-01-15",
    capacity: 500,
    status: "operational"
  },
  {
    id: 2,
    facility_id: '1',
    type: "Battery",
    name: "備用電源系統 B-1",
    installed_date: "2021-11-10",
    capacity: 1000,
    status: "warning"
  },
  {
    id: 3,
    facility_id: '1',
    type: "Server",
    name: "服務器集群 C-1",
    installed_date: "2022-03-22",
    capacity: 2000,
    status: "operational"
  },
  {
    id: 4,
    facility_id: '2',
    type: "HVAC",
    name: "冷卻系統 D-1",
    installed_date: "2022-02-05",
    capacity: 400,
    status: "operational"
  },
  {
    id: 5,
    facility_id: '2',
    type: "Battery",
    name: "備用電源系統 E-1",
    installed_date: "2021-10-18",
    capacity: 800,
    status: "critical"
  }
];

// 生成設備遙測數據
export const generateEquipmentTelemetry = (equipmentId: number) => {
  const data = [];
  const now = new Date();
  const startDate = subHours(now, 24); // 過去24小時的數據
  
  // 根據設備類型設定基本參數
  const equip = equipment.find(e => e.id === equipmentId);
  if (!equip) return [];
  
  let baseTemp, baseLoad, baseEfficiency, baseVibration;
  
  switch (equip.type) {
    case 'HVAC':
      baseTemp = 40;
      baseLoad = 70;
      baseEfficiency = 92;
      baseVibration = 0.05;
      break;
    case 'Battery':
      baseTemp = 30;
      baseLoad = 60;
      baseEfficiency = 95;
      baseVibration = 0.02;
      break;
    case 'Server':
      baseTemp = 45;
      baseLoad = 75;
      baseEfficiency = 90;
      baseVibration = 0.03;
      break;
    default:
      baseTemp = 35;
      baseLoad = 65;
      baseEfficiency = 93;
      baseVibration = 0.04;
  }
  
  // 如果設備狀態不是operational，添加一些異常
  let tempAnomaly = 0, loadAnomaly = 0, efficiencyAnomaly = 0, vibrationAnomaly = 0;
  
  if (equip.status === 'warning') {
    // 輕微異常
    tempAnomaly = 5;
    efficiencyAnomaly = -3;
    vibrationAnomaly = 0.03;
  } else if (equip.status === 'critical') {
    // 嚴重異常
    tempAnomaly = 12;
    efficiencyAnomaly = -8;
    vibrationAnomaly = 0.08;
    loadAnomaly = 15;
  }
  
  for (let i = 0; i < 24; i++) {
    const timestamp = addHours(startDate, i);
    const hour = timestamp.getHours();
    
    // 根據時間添加一些自然變化
    const timeVariationTemp = Math.random() * 3 - 1.5;
    const timeVariationLoad = Math.random() * 10 - 5 + (hour >= 9 && hour <= 17 ? 10 : 0);
    const timeVariationEff = Math.random() * 2 - 1;
    const timeVariationVib = Math.random() * 0.01 - 0.005;
    
    // 最終值計算
    const temperature = baseTemp + timeVariationTemp + (i > 20 ? tempAnomaly : 0);
    const load = baseLoad + timeVariationLoad + (i > 20 ? loadAnomaly : 0);
    const efficiency = baseEfficiency + timeVariationEff + (i > 20 ? efficiencyAnomaly : 0);
    const vibration = baseVibration + timeVariationVib + (i > 20 ? vibrationAnomaly : 0);
    
    // 可能的錯誤代碼
    let errorCode = null;
    if (equip.status === 'critical' && i > 22) {
      errorCode = 'E-501'; // 示例錯誤代碼
    } else if (equip.status === 'warning' && i > 22) {
      errorCode = 'W-302'; // 示例警告代碼
    }
    
    data.push({
      id: i + 1,
      equipment_id: equipmentId,
      timestamp: timestamp.toISOString(),
      temperature: parseFloat(temperature.toFixed(1)),
      load_percent: parseFloat(load.toFixed(1)),
      efficiency_percent: parseFloat(efficiency.toFixed(1)),
      vibration_level: parseFloat(vibration.toFixed(3)),
      error_code: errorCode
    });
  }
  
  return data;
};

// 生成設備故障預測
export const generateFailurePredictions = (equipmentId: number) => {
  const equip = equipment.find(e => e.id === equipmentId);
  if (!equip) return [];
  
  if (equip.status === 'operational') {
    return []; // 運行正常的設備不需要故障預測
  }
  
  const now = new Date();
  const predictions = [];
  
  if (equip.status === 'warning') {
    // 有潛在問題的設備
    predictions.push({
      id: 1,
      equipment_id: equipmentId,
      prediction_type: 'maintenance',
      probability: 0.75,
      predicted_date: addHours(now, 72).toISOString(),
      details: '效率下降趨勢表明需要在72小時內進行維護',
      created_at: subHours(now, 2).toISOString()
    });
  } else if (equip.status === 'critical') {
    // 狀態危急的設備
    predictions.push({
      id: 2,
      equipment_id: equipmentId,
      prediction_type: 'failure',
      probability: 0.92,
      predicted_date: addHours(now, 12).toISOString(),
      details: '多項指標顯示設備可能在12小時內發生故障，建議立即安排檢修',
      created_at: subHours(now, 1).toISOString()
    });
  }
  
  return predictions;
};

// 生成優化建議
export const generateOptimizationSuggestions = (facilityId: string) => {
  return [
    {
      id: 1,
      facility_id: facilityId,
      suggestion_text: "優化HVAC系統運行時間，在非峰值時段降低冷卻負載",
      estimated_savings_kwh: 120.5,
      estimated_savings_cost: 15000,
      priority: "high",
      created_at: subDays(new Date(), 1).toISOString()
    },
    {
      id: 2,
      facility_id: facilityId,
      suggestion_text: "提高數據中心平均溫度1°C，預計可節省約3%的冷卻能源",
      estimated_savings_kwh: 85.2,
      estimated_savings_cost: 10500,
      priority: "medium",
      created_at: subDays(new Date(), 2).toISOString()
    },
    {
      id: 3,
      facility_id: facilityId,
      suggestion_text: "優化伺服器負載分配，將低使用率伺服器進行整合",
      estimated_savings_kwh: 200.8,
      estimated_savings_cost: 25000,
      priority: "high",
      created_at: subDays(new Date(), 3).toISOString()
    }
  ];
};

// 能源使用統計摘要
export const generateEnergyStatistics = (facilityId: string, historyData: any[]) => {
  if (!historyData.length) return null;
  
  // 計算總能源使用量
  const totalEnergy = historyData.reduce((sum, entry) => sum + entry.energy_kwh, 0);
  
  // 找出最高和最低使用量
  const maxEntry = [...historyData].sort((a, b) => b.energy_kwh - a.energy_kwh)[0];
  const minEntry = [...historyData].sort((a, b) => a.energy_kwh - b.energy_kwh)[0];
  
  // 按日期分組計算
  const dailyUsage = historyData.reduce((result, entry) => {
    const date = entry.timestamp.split('T')[0];
    if (!result[date]) {
      result[date] = { total: 0, count: 0 };
    }
    result[date].total += entry.energy_kwh;
    result[date].count += 1;
    return result;
  }, {});
  
  // 計算平均每日使用量
  const dailyAverages = Object.entries(dailyUsage).map(([date, data]: [string, any]) => ({
    date,
    average: data.total / data.count
  }));
  
  // 溫度相關性計算
  const tempCorrelation = 0.78; // 在實際應用中應使用真實計算
  
  return {
    facility_id: facilityId,
    period_start: historyData[0].timestamp,
    period_end: historyData[historyData.length - 1].timestamp,
    total_energy_kwh: parseFloat(totalEnergy.toFixed(2)),
    average_hourly_kwh: parseFloat((totalEnergy / historyData.length).toFixed(2)),
    peak_usage: {
      energy_kwh: maxEntry.energy_kwh,
      timestamp: maxEntry.timestamp,
      temperature: maxEntry.temperature_celsius
    },
    lowest_usage: {
      energy_kwh: minEntry.energy_kwh,
      timestamp: minEntry.timestamp,
      temperature: minEntry.temperature_celsius
    },
    daily_averages: dailyAverages,
    temperature_correlation: tempCorrelation,
    cost_estimate_usd: parseFloat((totalEnergy * 0.12).toFixed(2)) // 假設電價為$0.12/kWh
  };
}; 