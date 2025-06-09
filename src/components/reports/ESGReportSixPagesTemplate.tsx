"use client";

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
} from 'chart.js';
import { ESGReportSixPages } from '@/lib/esg-report-data';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
);

// Configure ChartJS defaults for better Chinese font rendering
ChartJS.defaults.font.family = "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif";
ChartJS.defaults.color = '#374151'; // text color

interface ESGReportSixPagesTemplateProps {
  data: ESGReportSixPages;
}

/**
 * 六頁式ESG報告模板
 * 包含:
 * 1. 封面頁
 * 2. 目錄頁
 * 3. 公司簡介頁
 * 4. ESG永續目標頁
 * 5. 永續項目頁
 * 6. 永續項目執行結果頁
 */
const ESGReportSixPagesTemplate: React.FC<ESGReportSixPagesTemplateProps> = ({ data }) => {
  // 定義全局中文字型樣式
  const chineseFontStyle = {
    fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', '微軟正黑體', 'STSong', 'Songti TC', sans-serif",
    color: '#1f2937',
    letterSpacing: '0.025em',
    lineHeight: '1.6',
    textRendering: 'optimizeLegibility' as const
  };

  // 添加 PDF 頁面斷點樣式
  React.useEffect(() => {
    // 創建樣式元素
    const styleEl = document.createElement('style');
    styleEl.id = 'pdf-page-break-styles';
    styleEl.textContent = `
      @media print {
        /* 基礎頁面設定 */
        .page {
          break-after: page;
          overflow: visible;
          position: relative;
          height: 297mm;
          max-height: none;
          width: 210mm;
          padding: 15mm;
          box-sizing: border-box;
          margin: 0;
        }
        .page:last-child {
          break-after: auto;
        }
        
        /* 防止內容截斷 */
        .no-break {
          break-inside: avoid;
        }
        h1, h2, h3, 
        .chart-container, 
        table, tr, 
        img, 
        .flex, .grid {
          break-inside: avoid;
        }
        
        /* 移除頁面容器的額外邊距以避免空白頁 */
        .page-container {
          margin: 0 !important;
          padding: 0 !important;
        }
        .page-container > .page {
          display: block !important;
          margin: 0 !important;
        }
        
        /* 文字排版相關樣式 - 保持與web一致 */
        p, li, span, div {
          line-height: 1.6 !important;
          letter-spacing: 0.025em !important;
        }
        h1 {
          font-size: 24pt !important;
          margin-bottom: 15pt !important;
          margin-top: 0 !important;
        }
        h2 {
          font-size: 18pt !important;
          margin-bottom: 10pt !important;
          margin-top: 0 !important;
        }
        h3 {
          font-size: 14pt !important;
          margin-bottom: 8pt !important;
          margin-top: 0 !important;
        }
        .text-sm {
          font-size: 9pt !important;
        }
        .text-lg {
          font-size: 12pt !important;
        }
        .text-xl {
          font-size: 14pt !important;
        }
        .text-2xl {
          font-size: 16pt !important;
        }
        .text-3xl {
          font-size: 18pt !important;
        }
        .text-4xl {
          font-size: 24pt !important;
        }
        
        /* 文字對齊樣式 - 確保在 PDF 中正確顯示 */
        .text-center {
          text-align: center !important;
        }
        .text-left {
          text-align: left !important;
        }
        .text-right {
          text-align: right !important;
        }
        .justify-center {
          justify-content: center !important;
        }
        .justify-between {
          justify-content: space-between !important;
        }
        .items-center {
          align-items: center !important;
        }
        .mx-auto {
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        /* 確保背景色列印 */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        /* 為所有背景色類別設置明確的背景色值 */
        .bg-gray-50 { background-color: #f9fafb !important; }
        .bg-blue-50 { background-color: #eff6ff !important; }
        .bg-green-50 { background-color: #f0fdf4 !important; }
        .bg-purple-50 { background-color: #faf5ff !important; }
        .bg-orange-50 { background-color: #fff7ed !important; }
        .bg-indigo-50 { background-color: #eef2ff !important; }
        .bg-blue-100 { background-color: #dbeafe !important; }
        .bg-green-100 { background-color: #dcfce7 !important; }
        .bg-purple-100 { background-color: #f3e8ff !important; }
        .bg-orange-100 { background-color: #fed7aa !important; }
        .bg-yellow-100 { background-color: #fef3c7 !important; }
        .bg-white { background-color: #ffffff !important; }
        .bg-teal-50 { background-color: #f0fdfa !important; }
        
        /* 確保三欄布局正確工作 */
        .esg-metrics-grid {
          display: flex !important;
          gap: 1.5rem !important;
          margin-bottom: 2rem !important;
        }
        .esg-metrics-grid > div {
          flex: 1 !important;
          min-width: 0 !important;
          width: 33.333% !important;
          box-sizing: border-box !important;
        }
        
        /* 確保 flexbox 布局正確工作 */
        .flex {
          display: flex !important;
        }
        .flex-1 {
          flex: 1 !important;
        }
        .flex-col {
          flex-direction: column !important;
        }
        .flex-wrap {
          flex-wrap: wrap !important;
        }
        .gap-6 {
          gap: 1.5rem !important;
        }
        .gap-3 {
          gap: 0.75rem !important;
        }
        
        /* 間距樣式 - 保持與web一致 */
        .space-y-6 > * + * {
          margin-top: 1.5rem !important;
        }
        .space-y-4 > * + * {
          margin-top: 1rem !important;
        }
        .space-y-3 > * + * {
          margin-top: 0.75rem !important;
        }
        .space-y-8 > * + * {
          margin-top: 2rem !important;
        }
        
        /* 具體邊距樣式 - 保持與web一致 */
        .mt-6 { margin-top: 1.5rem !important; }
        .mt-3 { margin-top: 0.75rem !important; }
        .mt-1 { margin-top: 0.25rem !important; }
        .mt-4 { margin-top: 1rem !important; }
        .mt-8 { margin-top: 2rem !important; }
        .mt-10 { margin-top: 2.5rem !important; }
        .mt-12 { margin-top: 3rem !important; }
        .mt-20 { margin-top: 5rem !important; }
        .mt-auto { margin-top: auto !important; }
        
        .mb-1 { margin-bottom: 0.25rem !important; }
        .mb-2 { margin-bottom: 0.5rem !important; }
        .mb-3 { margin-bottom: 0.75rem !important; }
        .mb-4 { margin-bottom: 1rem !important; }
        .mb-6 { margin-bottom: 1.5rem !important; }
        .mb-8 { margin-bottom: 2rem !important; }
        .mb-10 { margin-bottom: 2.5rem !important; }
        
        .p-4 { padding: 1rem !important; }
        .p-6 { padding: 1.5rem !important; }
        .p-8 { padding: 2rem !important; }
        .p-10 { padding: 2.5rem !important; }
        .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
        .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
        .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
        .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .pt-4 { padding-top: 1rem !important; }
        .pl-5 { padding-left: 1.25rem !important; }
        
        /* 寬度和高度 */
        .h-10 { height: 2.5rem !important; }
        .h-16 { height: 4rem !important; }
        .h-40 { height: 10rem !important; }
        .h-60 { height: 15rem !important; }
        .w-16 { width: 4rem !important; }
        .w-64 { width: 16rem !important; }
        .max-w-2xl { max-width: 42rem !important; }
        
        /* 邊框和圓角 */
        .rounded { border-radius: 0.25rem !important; }
        .rounded-lg { border-radius: 0.5rem !important; }
        .rounded-full { border-radius: 9999px !important; }
        .border-b { border-bottom-width: 1px !important; }
        .border-t { border-top-width: 1px !important; }
        .border-2 { border-width: 2px !important; }
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-blue-200 { border-color: #bfdbfe !important; }
        .border-purple-100 { border-color: #e9d5ff !important; }
        
        /* 陰影 */
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important; }
        
        /* 字體粗細和顏色 */
        .font-medium { font-weight: 500 !important; }
        .font-semibold { font-weight: 600 !important; }
        .font-bold { font-weight: 700 !important; }
        
        /* 手動分頁控制 - 僅使用現代 CSS 屬性 */
        .break-before {
          break-before: page !important;
        }
        .break-after {
          break-after: page !important;
        }
        .break-inside-avoid {
          break-inside: avoid !important;
        }
        .break-manual {
          break-before: page !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          visibility: hidden !important;
          font-size: 0 !important;
          line-height: 0 !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
          z-index: -1 !important;
        }
      }
      
      /* 螢幕樣式 - 確保web預覽正確 */
      @media screen {
        .page {
          min-height: 297mm;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }
      }
    `;
    
    // 添加到文檔
    document.head.appendChild(styleEl);
    
    // 清理函數
    return () => {
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

  return (
    <div id="esg-report" className="esg-report bg-white w-[210mm] mx-auto pdf-container" style={chineseFontStyle}>
      {/* 將在各個頁面組件中實現 */}
      <div className="page-container">
        {/* 頁面1: 封面頁 */}
        <CoverPage data={data} />

        {/* 頁面2: 目錄頁 - 在目錄頁組件上直接添加分頁類 */}
        <TableOfContentsPage data={data} />

        
        {/* 頁面3: 公司簡介頁 - 在組件上直接添加分頁類 */}
        <CompanyProfilePage data={data} />

        
        {/* 頁面4: ESG永續目標頁 */}
        <SustainabilityGoalsPage data={data} />

        
        {/* 頁面5: 永續項目頁 */}
        <SustainabilityProjectsPage data={data} />
        
        {/* 頁面6: 永續項目執行結果頁 */}
        <ProjectResultsPage data={data} />
      </div>
    </div>
  );
};

// 進度條元件
const ProgressBar = ({ value, color = '#4ade80' }: { value: number, color?: string }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="h-2.5 rounded-full" 
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      ></div>
      <div className="text-sm mt-1 text-gray-600">{value}%</div>
    </div>
  );
};

// 標籤元件
const Tag = ({ text, color = 'bg-blue-100 text-blue-800' }: { text: string, color?: string }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  );
};

// 封面頁元件
const CoverPage = ({ data }: { data: ESGReportSixPages }) => {
  return (
    <div className="page min-h-[297mm] max-h-[297mm] flex flex-col justify-between p-8 border-b border-gray-200 overflow-hidden">
      <div className="page-content flex flex-col items-center justify-center flex-grow text-center">
        <h1 className="text-4xl font-bold mb-3 text-gray-800">{data.companyName}</h1>
        <h2 className="text-3xl font-semibold mb-8 text-gray-700">{data.coverPage.title}</h2>
        <p className="text-xl text-gray-600 mb-10">{data.coverPage.subtitle}</p>
        
        <div className="cover-image my-8">
          {data.coverPage.imageUrl && (
            <img 
              src={data.coverPage.imageUrl} 
              alt="永續發展封面" 
              className="max-w-[60%] mx-auto rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f9ff" /><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%2360a5fa" text-anchor="middle">永續發展願景圖</text></svg>';
              }}
            />
          )}
          {!data.coverPage.imageUrl && (
            <div className="h-40 w-64 bg-blue-50 flex items-center justify-center rounded-lg shadow-md mx-auto">
              <span className="text-blue-500">永續發展願景圖</span>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-gray-500 mt-6 mb-2">
        <p>報告日期: {data.reportDate}</p>
        {data.coverPage.companyLogo && (
          <img 
            src={data.coverPage.companyLogo} 
            alt={`${data.companyName} Logo`} 
            className="h-10 mx-auto mt-3"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect width="200" height="60" fill="%23f0f9ff" /><text x="50%" y="50%" font-family="Arial" font-size="16" fill="%2360a5fa" text-anchor="middle">公司標誌</text></svg>';
            }}
          />
        )}
      </footer>
    </div>
  );
};

// 目錄頁元件
const TableOfContentsPage = ({ data }: { data: ESGReportSixPages }) => {
  return (
    <div className="page min-h-[297mm] p-10 border-b border-gray-200">
      <h1 className="text-3xl font-bold mb-10 text-center">目錄</h1>
      
      <div className="mx-auto max-w-2xl">
        <div className="space-y-6">
          {data.tableOfContents.sections.map((section, index) => (
            <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h2 className="text-xl font-medium">{section.title}</h2>
              <span className="text-lg">{section.page}</span>
            </div>
          ))}
        </div>
      </div>
      
      <footer className="mt-20 text-center text-gray-600">
        <p>本報告依據國際永續標準委員會 (ISSB) 準則與全球報告倡議組織 (GRI) 標準編製</p>
        <p className="mt-4 text-sm">© {new Date().getFullYear()} {data.companyName}. 版權所有。</p>
      </footer>
    </div>
  );
};

// 公司簡介頁元件
const CompanyProfilePage = ({ data }: { data: ESGReportSixPages }) => {
  return (
    <div className="page min-h-[297mm] p-8 border-b border-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center">公司簡介</h1>
      
      <div className="space-y-6">
        {/* 公司描述 */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-lg leading-relaxed">{data.companyProfile.description}</p>
        </div>
        
        {/* 基本資訊和企業願景與使命 - 使用 flexbox 代替 grid */}
        <div className="flex gap-6">
          <div className="flex-1 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">基本資訊</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">成立年份</span>
                <span>{data.companyProfile.foundedYear}年</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">員工人數</span>
                <span>{data.companyProfile.employeeCount.toLocaleString()}人</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">總部位置</span>
                <span>{data.companyProfile.headquarters}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">產業類別</span>
                <span>{data.companyProfile.industry}</span>
              </div>
              {data.companyProfile.keyFinancials && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">年營收 ({data.companyProfile.keyFinancials.year})</span>
                    <span>{data.companyProfile.keyFinancials.revenue.toLocaleString()} 萬元</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">年度淨利 ({data.companyProfile.keyFinancials.year})</span>
                    <span>{data.companyProfile.keyFinancials.profit.toLocaleString()} 萬元</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* 企業願景與使命 */}
          <div className="flex-1 bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-800">企業願景與使命</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-green-700 mb-2">願景</h3>
                <p className="text-sm">{data.companyProfile.vision}</p>
              </div>
              <div>
                <h3 className="font-medium text-green-700 mb-2">使命</h3>
                <p className="text-sm">{data.companyProfile.mission}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 核心價值 */}
        <div className="bg-purple-50 p-6 rounded-lg" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
          <h2 className="text-xl font-semibold mb-4 text-purple-800" style={{ color: '#6b21a8' }}>核心價值</h2>
          <div 
            style={{ 
              textAlign: 'center',
              fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif"
            }}
          >
            {data.companyProfile.coreValues.map((value, index) => (
              <div 
                key={index}
                style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: '#7c3aed',
                  fontWeight: '500',
                  marginBottom: '0.75rem',
                  padding: '0.5rem 0'
                }}
              >
                ✦ {value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ESG永續目標頁元件
const SustainabilityGoalsPage = ({ data }: { data: ESGReportSixPages }) => {
  return (
    <>
    <div className="page min-h-[297mm] p-8 border-b border-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center">ESG永續目標</h1>
      
      {/* 概述 */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <p className="text-lg leading-relaxed">{data.sustainabilityGoals.overview}</p>
      </div>
      
      {/* SDG貢獻目標 */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">聯合國永續發展目標 (SDGs) 貢獻</h2>
        <div 
          style={{ 
            textAlign: 'center',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: '#1e40af',
            fontWeight: '600',
            fontFamily: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif"
          }}
        >
          SDG {data.sustainabilityGoals.sdgContributions.join(' • SDG ')}
        </div>
      </div>
      
      {/* ESG目標 */}
      <div className="grid grid-cols-1 gap-8">
        {/* 環境目標 */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-800">環境目標 (E)</h2>
          <div className="space-y-6">
            {data.sustainabilityGoals.environmentalGoals.map((goal, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 className="font-medium text-green-700" style={{ marginBottom: '0.5rem' }}>{goal.title}</h3>
                  <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#166534', fontWeight: '500' }}>
                    目標年: {goal.targetYear}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{goal.description}</p>
                <div>
                  <span className="text-sm font-medium mb-1 block">完成進度:</span>
                  <ProgressBar value={goal.currentProgress} color="#4ade80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className='page min-h-[297mm] p-8 border-b border-gray-200'>
        {/* 社會目標 */}
        <div className="bg-purple-50 p-6 rounded-lg break-inside-avoid" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
          <h2 className="text-xl font-semibold mb-4 text-purple-800" style={{ color: '#6b21a8' }}>社會目標 (S)</h2>
          <div className="space-y-6">
            {data.sustainabilityGoals.socialGoals.map((goal, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm break-inside-avoid" style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-purple-700" style={{ color: '#7c3aed' }}>{goal.title}</h3>
                  <span className="text-sm text-purple-800 px-2 py-1 rounded" style={{  color: '#6b21a8' }}>
                    目標年: {goal.targetYear}
                  </span>
                </div>
                <p className="text-gray-700 mb-3" style={{ color: '#374151' }}>{goal.description}</p>
                <div>
                  <span className="text-sm font-medium mb-1 block" style={{ color: '#374151' }}>完成進度:</span>
                  <ProgressBar value={goal.currentProgress} color="#a78bfa" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> 
    <div className='page min-h-[297mm] p-8 border-b border-gray-200'>
        {/* 治理目標 */}
        <div className="bg-orange-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-orange-800">治理目標 (G)</h2>
          <div className="space-y-6">
            {data.sustainabilityGoals.governanceGoals.map((goal, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 className="font-medium text-orange-700" style={{ marginBottom: '0.5rem' }}>{goal.title}</h3>
                  <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#c2410c', fontWeight: '500' }}>
                    目標年: {goal.targetYear}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{goal.description}</p>
                <div>
                  <span className="text-sm font-medium mb-1 block">完成進度:</span>
                  <ProgressBar value={goal.currentProgress} color="#fb923c" />
                </div>
              </div>
            ))}
          </div>
        </div>  
      
    </div> 
    </>


  );
};

// 永續項目頁元件
const SustainabilityProjectsPage = ({ data }: { data: ESGReportSixPages }) => {
  // 專案狀態標籤顏色對應
  const statusColors = {
    'planning': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800'
  };
  
  // 專案類型顏色對應
  const categoryColors = {
    'environmental': 'bg-green-50 border-green-200',
    'social': 'bg-purple-50 border-purple-200',
    'governance': 'bg-orange-50 border-orange-200'
  };
  
  // 專案類型中文名稱對應
  const categoryNames = {
    'environmental': '環境永續',
    'social': '社會責任',
    'governance': '公司治理'
  };
  
  // 專案狀態中文名稱對應
  const statusNames = {
    'planning': '規劃中',
    'in-progress': '執行中',
    'completed': '已完成'
  };
  
  // 格式化日期
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-TW', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // 分頁配置 - 每頁最多顯示的項目數
  const ITEMS_PER_PAGE = 3; // 可以根據需要調整，建議2-3個項目一頁
  const projects = data.sustainabilityProjects.projects;
  
  // 將項目分組 - 智能分頁：特定項目開始新頁
  const projectPages: typeof projects[] = [];
  let currentPage: typeof projects = [];
  let currentPageCount = 0;
  
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    
    // 如果是"數位轉型減碳計畫"且當前頁不為空，則開始新頁
    if (project.name.includes('數位轉型') && currentPage.length > 0) {
      projectPages.push(currentPage);
      currentPage = [project];
      currentPageCount = 1;
    } 
    // 如果當前頁已滿，開始新頁
    else if (currentPageCount >= ITEMS_PER_PAGE) {
      projectPages.push(currentPage);
      currentPage = [project];
      currentPageCount = 1;
    } 
    // 否則添加到當前頁
    else {
      currentPage.push(project);
      currentPageCount++;
    }
  }
  
  // 添加最後一頁
  if (currentPage.length > 0) {
    projectPages.push(currentPage);
  }

  return (
    <>
      {projectPages.map((pageProjects, pageIndex) => (
        <div key={pageIndex} className="page min-h-[297mm] p-8 border-b border-gray-200">
          {/* 只在第一頁顯示標題和概述 */}
          {pageIndex === 0 && (
            <>
              <h1 className="text-3xl font-bold mb-3 text-center">永續項目</h1>
              
              {/* 概述 - 縮小高度 */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                <p>{data.sustainabilityProjects.overview}</p>
              </div>
            </>
          )}
          
          {/* 後續頁面的標題 */}
          {pageIndex > 0 && (
            <h1 className="text-3xl font-bold mb-3 text-center">永續項目 (續)</h1>
          )}
          
          {/* 項目列表 - 減少間距 */}
          <div className="space-y-2">
            {pageProjects.map((project, index) => (
              <div 
                key={pageIndex * ITEMS_PER_PAGE + index} 
                className={`p-3 rounded-lg border-2 ${categoryColors[project.category]} break-inside-avoid`}
                style={{ marginBottom: '0.5rem' }}
              >
                {/* 標題區域 - 更緊湊 */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <h2 className="text-lg font-semibold" style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>{project.name}</h2>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span 
                      className="text-xs px-1 py-0.5 rounded" 
                      style={{ 
                        backgroundColor: project.category === 'environmental' ? '#dcfce7' : project.category === 'social' ? '#f3e8ff' : '#fed7aa',
                        color: project.category === 'environmental' ? '#166534' : project.category === 'social' ? '#6b21a8' : '#c2410c',
                        fontSize: '0.7rem'
                      }}
                    >
                      {categoryNames[project.category]}
                    </span>
                    <span 
                      className="text-xs px-1 py-0.5 rounded"
                      style={{ 
                        backgroundColor: project.status === 'completed' ? '#dcfce7' : project.status === 'in-progress' ? '#fef3c7' : '#dbeafe',
                        color: project.status === 'completed' ? '#166534' : project.status === 'in-progress' ? '#a16207' : '#1e40af',
                        fontSize: '0.7rem'
                      }}
                    >
                      {statusNames[project.status]}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>
                    開始日期: {formatDate(project.startDate)}
                  </div>
                </div>
                
                {/* 描述區域 - 縮小字體 */}
                <div className="bg-white p-2 rounded-lg mb-2" style={{ fontSize: '0.85rem', lineHeight: '1.3' }}>
                  <p className="text-gray-700">{project.description}</p>
                </div>
                
                {/* 關鍵指標 - 更緊湊的橫向佈局 */}
                {project.keyMetrics && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="bg-blue-50 p-2 rounded-lg" style={{ flex: '1', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: '500', marginBottom: '0.125rem' }}>投資金額</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e40af' }}>
                        {project.keyMetrics.investmentAmount.toLocaleString()} 萬元
                      </div>
                    </div>
                    <div className="bg-teal-50 p-2 rounded-lg" style={{ flex: '1', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#0f766e', fontWeight: '500', marginBottom: '0.125rem' }}>預期影響</div>
                      <div style={{ fontSize: '0.8rem', color: '#0f766e', lineHeight: '1.2' }}>
                        {project.keyMetrics.estimatedImpact}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* 頁面底部顯示頁碼 */}
          <div style={{ 
            marginTop: 'auto', 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            color: '#6b7280',
            paddingTop: '1rem'
          }}>
            第 {pageIndex + 1} 頁，共 {projectPages.length} 頁
          </div>
        </div>
      ))}
    </>
  );
};

// 永續項目執行結果頁元件
const ProjectResultsPage = ({ data }: { data: ESGReportSixPages }) => {
  // 圖表數據 - 年度比較
  const yearComparisonData = {
    labels: data.projectResults.yearOnYearComparison.categories,
    datasets: [
      {
        label: '去年基準',
        data: data.projectResults.yearOnYearComparison.previousYearData,
        backgroundColor: 'rgba(96, 165, 250, 0.5)', // blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: '今年表現',
        data: data.projectResults.yearOnYearComparison.currentYearData,
        backgroundColor: 'rgba(74, 222, 128, 0.5)', // green
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // 圖表選項
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}%`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y}%`
        }
      }
    }
  };
  
  return (
    <>
      {/* 第一頁：概述 + 圖表 + 環境績效 */}
      <div className="page min-h-[297mm] p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">永續項目執行結果</h1>
        
        {/* 概述 */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <p className="text-lg leading-relaxed">{data.projectResults.overview}</p>
        </div>
        
        {/* 年度比較圖表 */}
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">年度績效比較</h2>
          <div className="chart-container h-60 mb-4">
            <Bar 
              data={yearComparisonData} 
              options={{
                ...chartOptions,
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#333',
                    titleFont: {
                      family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
                      size: 14,
                      weight: 'bold'
                    },
                    bodyFont: {
                      family: "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif",
                      size: 13
                    },
                    padding: 10,
                    boxPadding: 6,
                    borderColor: '#ddd',
                    borderWidth: 1
                  }
                }
              }} 
            />
          </div>
          <p className="text-sm text-gray-600 text-center">註: 基準年度 = 100%，低於100%表示減少，高於100%表示增加</p>
        </div>
        
        {/* 環境績效 */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6 text-green-800 text-center">環境績效 (E)</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem' }}>
                {data.projectResults.environmentalMetrics.carbonReduction.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#065f46' }}>碳減排量 (噸)</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem' }}>
                {data.projectResults.environmentalMetrics.energySaved.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#065f46' }}>節約能源 (度)</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem' }}>
                {data.projectResults.environmentalMetrics.renewablePercentage}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#065f46' }}>再生能源比例</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem' }}>
                {data.projectResults.environmentalMetrics.wasteReduction.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#065f46' }}>廢棄物減少 (噸)</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem' }}>
                {data.projectResults.environmentalMetrics.waterSaved.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#065f46' }}>節約用水 (立方米)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 第二頁：社會績效 + 治理績效 + 未來展望 */}
      <div className="page min-h-[297mm] p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">永續項目執行結果 (續)</h1>
        
        {/* 社會績效 */}
        <div className="bg-purple-50 p-6 rounded-lg break-inside-avoid" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', marginBottom: '1.5rem' }}>
          <h2 className="text-xl font-semibold mb-6 text-purple-800 text-center" style={{ color: '#6b21a8' }}>社會績效 (S)</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.5rem' }}>
                {data.projectResults.socialMetrics.communityBeneficiaries.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#581c87' }}>社區受益人數 (人)</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.5rem' }}>
                {data.projectResults.socialMetrics.employeeVolunteerHours.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#581c87' }}>員工志工時數 (小時)</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.5rem' }}>
                {data.projectResults.socialMetrics.diversityScore}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#581c87' }}>多元化評分</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.5rem' }}>
                {data.projectResults.socialMetrics.trainingHours}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#581c87' }}>員工培訓時數 (小時/人)</div>
            </div>
          </div>
        </div>
        
        {/* 治理績效 */}
        <div className="bg-orange-50 p-6 rounded-lg" style={{ marginBottom: '2rem' }}>
          <h2 className="text-xl font-semibold mb-6 text-orange-800 text-center">治理績效 (G)</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '0.5rem' }}>
                {data.projectResults.governanceMetrics.transparencyScore}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#9a3412' }}>透明度評分</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '0.5rem' }}>
                {data.projectResults.governanceMetrics.ethicsTraining}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#9a3412' }}>道德培訓完成率</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '0.5rem' }}>
                {data.projectResults.governanceMetrics.riskAssessment}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#9a3412' }}>風險評估完整性</div>
            </div>
          </div>
        </div>
        
        {/* 未來展望 */}
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-indigo-800">未來展望</h2>
          <ul className="list-disc pl-5 space-y-2">
            {data.projectResults.futureOutlook.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
        
        {/* 頁尾 */}
        <footer className="text-center text-gray-500 text-sm mt-12 pt-4 border-t border-gray-200 no-break">
          <p>本報告依據國際永續標準委員會 (ISSB) 準則與全球報告倡議組織 (GRI) 標準編製</p>
          <p className="mt-1">© {new Date().getFullYear()} {data.companyName}. 版權所有。</p>
        </footer>
      </div>
    </>
  );
};

export default ESGReportSixPagesTemplate; 