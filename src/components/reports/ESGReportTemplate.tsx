"use client";

import React from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

// Configure ChartJS defaults for better Chinese font rendering
ChartJS.defaults.font.family = "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif";
ChartJS.defaults.color = '#374151'; // text color

// ESG報告數據介面
export interface ESGReportData {
  companyName: string;
  reportPeriod: {
    from: Date;
    to: Date;
  };
  summary: {
    title: string;
    description: string;
    highlights: string[];
  };
  energyUsage: {
    totalConsumption: number;
    distribution: {
      electricity: number;
      renewableEnergy: number;
      fuel: number;
      other: number;
    };
    trend: {
      months: string[];
      values: number[];
    };
    carbonEmission: number;
    previousYearComparison: number;
  };
  environmentalMetrics: {
    waterUsage: {
      total: number;
      recycled: number;
      previousYearComparison: number;
    };
    wasteManagement: {
      total: number;
      recycled: number;
      previousYearComparison: number;
    };
    airQuality: {
      emissionReduction: number;
      previousYearComparison: number;
    };
  };
  socialResponsibility: {
    employeeWellbeing: {
      trainingHours: number;
      diversityScore: number;
      safetyIncidents: number;
    };
    communityEngagement: {
      volunteerHours: number;
      donationsAmount: number;
      projectsSupported: number;
    };
  };
  governance: {
    boardDiversity: number;
    ethicsTrainingCompletion: number;
    riskAssessment: number;
    transparencyScore: number;
  };
  sdgContributions: {
    goals: number[];
    highlights: string[];
  };
  recommendations: string[];
}

interface ESGReportTemplateProps {
  data: ESGReportData;
}

// 環境績效指標顏色
const COLORS = {
  green: '#4ade80',
  lightGreen: '#86efac',
  yellow: '#facc15',
  orange: '#fb923c',
  red: '#f87171',
  blue: '#60a5fa',
  lightBlue: '#93c5fd',
  purple: '#a78bfa',
  teal: '#2dd4bf',
  gray: '#94a3b8',
};

// 評分標籤元件
const ScoreLabel = ({ score, maxScore = 100 }: { score: number, maxScore?: number }) => {
  const percentage = (score / maxScore) * 100;
  let color = '';
  
  if (percentage >= 80) color = COLORS.green;
  else if (percentage >= 60) color = COLORS.lightGreen;
  else if (percentage >= 40) color = COLORS.yellow;
  else if (percentage >= 20) color = COLORS.orange;
  else color = COLORS.red;
  
  return (
    <div className="flex items-center">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
      <span className="ml-2 text-sm font-medium">{score}/{maxScore}</span>
    </div>
  );
};

// 指標趨勢箭頭
const TrendIndicator = ({ percentage }: { percentage: number }) => {
  if (percentage > 0) {
    return <span className="text-green-500">↑ {percentage}%</span>;
  } else if (percentage < 0) {
    return <span className="text-red-500">↓ {Math.abs(percentage)}%</span>;
  }
  return <span className="text-gray-500">—</span>;
};

// 主要ESG報告模板元件
const ESGReportTemplate: React.FC<ESGReportTemplateProps> = ({ data }) => {
  // 能源分佈圓餅圖數據
  const energyDistributionData = {
    labels: ['電力', '再生能源', '燃料', '其他'],
    datasets: [
      {
        data: [
          data.energyUsage.distribution.electricity,
          data.energyUsage.distribution.renewableEnergy,
          data.energyUsage.distribution.fuel,
          data.energyUsage.distribution.other,
        ],
        backgroundColor: [COLORS.blue, COLORS.green, COLORS.orange, COLORS.gray],
        borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 1,
      },
    ],
  };

  // 能源使用趨勢折線圖數據
  const energyTrendData = {
    labels: data.energyUsage.trend.months,
    datasets: [
      {
        label: '能源使用量 (kWh)',
        data: data.energyUsage.trend.values,
        fill: true,
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        borderColor: COLORS.blue,
        tension: 0.4,
      },
    ],
  };

  // 折線圖選項
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
            size: 12
          },
          color: '#374151',
          usePointStyle: true,
          padding: 20
        },
      },
      tooltip: {
        titleFont: {
          family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
          size: 13
        },
        padding: 10,
        boxPadding: 6
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // 圓餅圖選項
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
            size: 12
          },
          color: '#374151',
          usePointStyle: true,
          padding: 20
        },
      },
      tooltip: {
        titleFont: {
          family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
          size: 13
        },
        padding: 10,
        boxPadding: 6
      }
    },
  };

  // 格式化日期範圍
  const formattedDateRange = `${format(data.reportPeriod.from, 'yyyy年MM月dd日', { locale: zhTW })} - ${format(data.reportPeriod.to, 'yyyy年MM月dd日', { locale: zhTW })}`;

  // 定義全局中文字型樣式
  const chineseFontStyle = {
    fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', '微軟正黑體', 'STSong', 'Songti TC', sans-serif",
    color: '#1f2937'
  };

  return (
    <div id="esg-report" className="esg-report bg-white p-8 w-[210mm] mx-auto" style={chineseFontStyle}>
      {/* 報告標題區 */}
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
        <h1 className="text-3xl font-bold mb-3 text-gray-800">{data.companyName}</h1>
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">ESG永續報告</h2>
        <p className="text-gray-600">{formattedDateRange}</p>
      </div>

      {/* 摘要區 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">{data.summary.title}</h2>
        <p className="mb-4 text-gray-700">{data.summary.description}</p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-800">重點摘要：</h3>
          <ul className="list-disc pl-5 space-y-1">
            {data.summary.highlights.map((highlight, index) => (
              <li key={index} className="text-gray-700">{highlight}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 能源使用區 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-green-500 pl-3">能源使用分析</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-800">能源分佈</h3>
            <div className="h-60">
              <Pie data={energyDistributionData} options={pieOptions} />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-800">能源使用趨勢</h3>
            <div className="h-60">
              <Line data={energyTrendData} options={lineOptions} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">總能源消耗 (kWh)</h4>
            <p className="text-xl font-bold">{data.energyUsage.totalConsumption.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">
              同比變化: <TrendIndicator percentage={data.energyUsage.previousYearComparison} />
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-1">再生能源佔比</h4>
            <p className="text-xl font-bold">
              {(data.energyUsage.distribution.renewableEnergy / 
                (data.energyUsage.distribution.electricity + 
                 data.energyUsage.distribution.renewableEnergy + 
                 data.energyUsage.distribution.fuel + 
                 data.energyUsage.distribution.other) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-orange-800 mb-1">碳排放量 (噸)</h4>
            <p className="text-xl font-bold">{data.energyUsage.carbonEmission.toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* 環境績效區 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-teal-500 pl-3">環境績效指標</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-teal-800">水資源管理</h3>
            <p className="mb-1">總用水量: {data.environmentalMetrics.waterUsage.total.toLocaleString()} 立方米</p>
            <p className="mb-1">水資源回收率: {(data.environmentalMetrics.waterUsage.recycled * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">
              同比變化: <TrendIndicator percentage={data.environmentalMetrics.waterUsage.previousYearComparison} />
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-green-800">廢棄物管理</h3>
            <p className="mb-1">總廢棄物: {data.environmentalMetrics.wasteManagement.total.toLocaleString()} 噸</p>
            <p className="mb-1">廢棄物回收率: {(data.environmentalMetrics.wasteManagement.recycled * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">
              同比變化: <TrendIndicator percentage={data.environmentalMetrics.wasteManagement.previousYearComparison} />
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-800">空氣品質</h3>
            <p className="mb-1">排放減少率: {(data.environmentalMetrics.airQuality.emissionReduction * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">
              同比變化: <TrendIndicator percentage={data.environmentalMetrics.airQuality.previousYearComparison} />
            </p>
          </div>
        </div>
      </section>

      {/* 社會責任區 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-purple-500 pl-3">社會責任</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-purple-800">員工福祉</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">每位員工年度培訓時數</p>
                <p className="text-lg font-bold">{data.socialResponsibility.employeeWellbeing.trainingHours} 小時</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">多元化指標</p>
                <ScoreLabel score={data.socialResponsibility.employeeWellbeing.diversityScore} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">安全事故數</p>
                <p className="text-lg font-bold">{data.socialResponsibility.employeeWellbeing.safetyIncidents}</p>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-indigo-800">社區參與</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">志工服務時數</p>
                <p className="text-lg font-bold">{data.socialResponsibility.communityEngagement.volunteerHours.toLocaleString()} 小時</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">捐款金額</p>
                <p className="text-lg font-bold">NT$ {data.socialResponsibility.communityEngagement.donationsAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">支持專案數</p>
                <p className="text-lg font-bold">{data.socialResponsibility.communityEngagement.projectsSupported}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 公司治理區 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-orange-500 pl-3">公司治理</h2>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-orange-800">治理績效指標</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">董事會多元化</p>
                  <ScoreLabel score={data.governance.boardDiversity} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">道德培訓完成率</p>
                  <ScoreLabel score={data.governance.ethicsTrainingCompletion} />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-orange-800">風險評估與透明度</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">風險評估完整性</p>
                  <ScoreLabel score={data.governance.riskAssessment} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">資訊透明度</p>
                  <ScoreLabel score={data.governance.transparencyScore} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDG貢獻區 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">永續發展目標 (SDGs) 貢獻</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex flex-wrap gap-2 mb-4">
            {data.sdgContributions.goals.map((goal) => (
              <div 
                key={goal} 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold border-2 border-blue-200"
              >
                {goal}
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-blue-800">貢獻亮點：</h3>
            <ul className="list-disc pl-5 space-y-1">
              {data.sdgContributions.highlights.map((highlight, index) => (
                <li key={index} className="text-gray-700">{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 改善建議區 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-l-4 border-green-500 pl-3">永續發展改善建議</h2>
        <div className="bg-green-50 p-4 rounded-lg">
          <ol className="list-decimal pl-5 space-y-2">
            {data.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700">{recommendation}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* 頁尾 */}
      <footer className="text-center text-gray-500 text-sm mt-12 pt-4 border-t border-gray-200">
        <p>本報告依據國際永續標準委員會 (ISSB) 準則與全球報告倡議組織 (GRI) 標準編製</p>
        <p className="mt-1">© {new Date().getFullYear()} {data.companyName}. 版權所有。</p>
      </footer>
    </div>
  );
};

export default ESGReportTemplate; 
