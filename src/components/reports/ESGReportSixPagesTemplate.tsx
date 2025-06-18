'use client';

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
  Filler,
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
ChartJS.defaults.font.family =
  "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif";
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
const ESGReportSixPagesTemplate: React.FC<ESGReportSixPagesTemplateProps> = ({
  data,
}) => {
  // 定義全局中文字型樣式
  const chineseFontStyle = {
    fontFamily:
      "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', '微軟正黑體', 'STSong', 'Songti TC', sans-serif",
    color: '#1f2937',
    letterSpacing: '0.025em',
    lineHeight: '1.6',
    textRendering: 'optimizeLegibility' as const,
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
    <div
      id="esg-report"
      className="esg-report bg-white w-[210mm] mx-auto pdf-container"
      style={chineseFontStyle}
    >
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
const ProgressBar = ({
  value,
  color = '#4ade80',
}: {
  value: number;
  color?: string;
}) => {
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
const Tag = ({
  text,
  color = 'bg-blue-100 text-blue-800',
}: {
  text: string;
  color?: string;
}) => {
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
        <h1 className="text-4xl font-bold mb-3 text-gray-800">
          {data.companyName}
        </h1>
        <h2 className="text-3xl font-semibold mb-8 text-gray-700">
          {data.coverPage.title}
        </h2>
        <p className="text-xl text-gray-600 mb-10">{data.coverPage.subtitle}</p>

        <div className="cover-image my-8">
          {data.coverPage.imageUrl && (
            <img
              src={data.coverPage.imageUrl}
              alt="永續發展封面"
              className="max-w-[60%] mx-auto rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f9ff" /><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%2360a5fa" text-anchor="middle">永續發展願景圖</text></svg>';
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
              target.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect width="200" height="60" fill="%23f0f9ff" /><text x="50%" y="50%" font-family="Arial" font-size="16" fill="%2360a5fa" text-anchor="middle">公司標誌</text></svg>';
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
            <div
              key={index}
              className="flex justify-between items-center pb-2 border-b border-gray-200"
            >
              <h2 className="text-xl font-medium">{section.title}</h2>
              <span className="text-lg">{section.page}</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-20 text-center text-gray-600">
        <p>
          本報告依據國際永續標準委員會 (ISSB) 準則與全球報告倡議組織 (GRI)
          標準編製
        </p>
        <p className="mt-4 text-sm">
          © {new Date().getFullYear()} {data.companyName}. 版權所有。
        </p>
      </footer>
    </div>
  );
};

// 公司簡介頁元件
const CompanyProfilePage = ({ data }: { data: ESGReportSixPages }) => {
  // 主色
  const colorMain = '#2563eb'; // 藍色
  const colorGreen = '#16a34a'; // 綠色
  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #F0F1F3',
  };
  return (
    <div className="page min-h-[297mm] p-10 border-b border-gray-200" style={{ background: '#FAFAFA' }}>
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#222' }}>公司簡介</h1>
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...cardStyle, marginBottom: 32 }}>
          <p style={{ color: '#444', fontSize: '1.08rem', lineHeight: 1.7 }}>{data.companyProfile.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {/* 基本資訊 */}
          <div style={{ ...cardStyle, flex: 1, minWidth: 280 }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: colorMain, marginBottom: 16 }}>基本資訊</div>
            <div style={{ color: '#222', fontSize: '1rem', display: 'grid', rowGap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>成立年份</span>
                <span>{data.companyProfile.foundedYear}年</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>員工人數</span>
                <span>{data.companyProfile.employeeCount.toLocaleString()}人</span>
              </div>
              {data.companyProfile.femaleEmployeePercentage !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>女性員工比例</span>
                  <span style={{ color: colorMain, fontWeight: 600 }}>{data.companyProfile.femaleEmployeePercentage}%</span>
                </div>
              )}
              {data.companyProfile.employeeTurnoverRate !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>員工流動率</span>
                  <span style={{ color: colorMain, fontWeight: 600 }}>{data.companyProfile.employeeTurnoverRate}%</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>總部位置</span>
                <span>{data.companyProfile.headquarters}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>產業類別</span>
                <span>{data.companyProfile.industry}</span>
              </div>
              {data.companyProfile.keyFinancials && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>年營收 ({data.companyProfile.keyFinancials.year})</span>
                    <span style={{ color: colorGreen, fontWeight: 700 }}>{data.companyProfile.keyFinancials.revenue.toLocaleString()} 萬元</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>年度淨利 ({data.companyProfile.keyFinancials.year})</span>
                    <span style={{ color: colorGreen, fontWeight: 700 }}>{data.companyProfile.keyFinancials.profit.toLocaleString()} 萬元</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* 企業願景與使命 */}
          <div style={{ ...cardStyle, flex: 1, minWidth: 280 }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: colorGreen, marginBottom: 16 }}>企業願景與使命</div>
            <div style={{ color: '#222', fontSize: '1rem', marginBottom: 8 }}>
              <div style={{ fontWeight: 500, color: colorGreen, marginBottom: 4 }}>願景</div>
              <div style={{ color: '#444', marginBottom: 12 }}>{data.companyProfile.vision}</div>
              <div style={{ fontWeight: 500, color: colorGreen, marginBottom: 4 }}>使命</div>
              <div style={{ color: '#444' }}>{data.companyProfile.mission}</div>
            </div>
          </div>
        </div>
        {/* 核心價值 */}
        <div style={{ ...cardStyle, marginTop: 32 }}>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: colorMain, marginBottom: 16 }}>核心價值</div>
          <div>
            {data.companyProfile.coreValues.map((value, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: idx !== data.companyProfile.coreValues.length - 1 ? '1px solid #F0F1F3' : 'none',
              }}>
                <span style={{
                  color: colorMain,
                  fontSize: '1.2rem',
                  marginRight: 16,
                  flexShrink: 0,
                }}>✦</span>
                <span style={{
                  color: '#222',
                  fontWeight: 500,
                  fontSize: '1.08rem',
                  letterSpacing: 1,
                }}>{value}</span>
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
  // 目標卡片樣式
  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #F0F1F3',
  };
  // 標籤樣式（移除底色）
  const tagStyle = {
    background: 'transparent', // 無底色
    color: '#6B7280',
    fontSize: '0.98rem',
    borderRadius: '8px',
    padding: '2px 10px',
    fontWeight: 500,
    marginLeft: 8,
    border: 'none',
    boxShadow: 'none',
    letterSpacing: 0.5,
  };
  return (
    <>
      <div className="page min-h-[297mm] p-10 border-b border-gray-200" style={{ background: '#FAFAFA' }}>
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#222' }}>ESG永續目標</h1>
        {/* 概述 */}
        <div className="p-4 rounded-lg mb-6" style={{ background: '#F7F7FA', color: '#666', fontSize: '1.05rem' }}>
          <p>{data.sustainabilityGoals.overview}</p>
        </div>
        {/* SDG貢獻目標 */}
        <div className="p-4 rounded-lg mb-8" style={{ background: '#F7F7FA', color: '#444', fontSize: '1rem' }}>
          <div style={{ fontWeight: 600 }}>聯合國永續發展目標 (SDGs) 貢獻</div>
          <div style={{ marginTop: 8, letterSpacing: 1 }}>{data.sustainabilityGoals.sdgContributions.map((sdg, i) => `SDG ${sdg}`).join('、')}</div>
        </div>
        {/* E目標 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#222', marginBottom: 16 }}>環境目標 (E)</div>
          {data.sustainabilityGoals.environmentalGoals.map((goal, idx) => (
            <div key={idx} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 500, fontSize: '1.05rem', color: '#222' }}>{goal.title}</div>
                <span style={tagStyle}>目標年：{goal.targetYear}</span>
              </div>
              <div style={{ color: '#666', fontSize: '0.98rem', marginBottom: 12 }}>{goal.description}</div>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>完成進度</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#222' }}>{goal.currentProgress}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* S目標 */}
      <div className="page min-h-[297mm] p-10 border-b border-gray-200" style={{ background: '#FAFAFA' }}>
        <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#222', marginBottom: 16 }}>社會目標 (S)</div>
        {data.sustainabilityGoals.socialGoals.map((goal, idx) => (
          <div key={idx} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 500, fontSize: '1.05rem', color: '#222' }}>{goal.title}</div>
              <span style={tagStyle}>目標年：{goal.targetYear}</span>
            </div>
            <div style={{ color: '#666', fontSize: '0.98rem', marginBottom: 12 }}>{goal.description}</div>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>完成進度</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#222' }}>{goal.currentProgress}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* G目標 */}
      <div className="page min-h-[297mm] p-10 border-b border-gray-200" style={{ background: '#FAFAFA' }}>
        <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#222', marginBottom: 16 }}>治理目標 (G)</div>
        {data.sustainabilityGoals.governanceGoals.map((goal, idx) => (
          <div key={idx} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 500, fontSize: '1.05rem', color: '#222' }}>{goal.title}</div>
              <span style={tagStyle}>目標年：{goal.targetYear}</span>
            </div>
            <div style={{ color: '#666', fontSize: '0.98rem', marginBottom: 12 }}>{goal.description}</div>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>完成進度</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#222' }}>{goal.currentProgress}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// 永續項目頁元件
const SustainabilityProjectsPage = ({ data }: { data: ESGReportSixPages }) => {
  // 格式化日期
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // 分頁配置 - 每頁最多顯示的項目數
  const ITEMS_PER_PAGE = 3;
  const projects = data.sustainabilityProjects.projects;

  // 將項目分組 - 智能分頁：特定項目開始新頁
  const projectPages: (typeof projects)[] = [];
  let currentPage: typeof projects = [];
  let currentPageCount = 0;

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    if (project.name.includes('數位轉型') && currentPage.length > 0) {
      projectPages.push(currentPage);
      currentPage = [project];
      currentPageCount = 1;
    } else if (currentPageCount >= ITEMS_PER_PAGE) {
      projectPages.push(currentPage);
      currentPage = [project];
      currentPageCount = 1;
    } else {
      currentPage.push(project);
      currentPageCount++;
    }
  }
  if (currentPage.length > 0) {
    projectPages.push(currentPage);
  }

  // 狀態中文
  const statusNames = {
    planning: '規劃中',
    'in-progress': '執行中',
    completed: '已完成',
  };

  // 狀態顏色
  const statusColor = {
    planning: '#64748b', // slate-500
    'in-progress': '#eab308', // amber-500
    completed: '#16a34a', // green-600
  };

  return (
    <>
      {projectPages.map((pageProjects, pageIndex) => (
        <div
          key={pageIndex}
          className="page min-h-[297mm] p-10 border-b border-gray-200"
          style={{ background: '#FAFAFA' }}
        >
          {/* 只在第一頁顯示標題和概述 */}
          {pageIndex === 0 && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#222' }}>
                永續項目
              </h1>
              <div
                className="p-4 rounded-lg mb-6"
                style={{ background: '#F7F7FA', color: '#666', fontSize: '1.05rem' }}
              >
                <p>{data.sustainabilityProjects.overview}</p>
              </div>
            </>
          )}
          {pageIndex > 0 && (
            <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#222' }}>
              永續項目 (續)
            </h1>
          )}
          <div>
            {pageProjects.map((project, index) => (
              <div
                key={pageIndex * ITEMS_PER_PAGE + index}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid #F0F1F3',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#222' }}>{project.name}</div>
                  <span style={{
                    background: 'transparent', // 無底色
                    color: statusColor[project.status],
                    fontSize: '0.98rem',
                    borderRadius: '8px',
                    padding: '2px 10px',
                    fontWeight: 700,
                    marginLeft: 8,
                    border: 'none',
                    boxShadow: 'none',
                    letterSpacing: 0.5,
                  }}>
                    {statusNames[project.status]}
                  </span>
                </div>
                <div style={{ color: '#666', fontSize: '0.98rem', margin: '12px 0 18px 0' }}>
                  {project.description}
                </div>
                <div style={{ display: 'flex', gap: '32px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>投資金額</div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#222' }}>
                      {project.keyMetrics?.investmentAmount?.toLocaleString()} 萬元
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>預期影響</div>
                    <div style={{ fontWeight: 500, fontSize: '1rem', color: '#444' }}>
                      {project.keyMetrics?.estimatedImpact}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#AAA', marginTop: '8px' }}>
                  開始日期：{formatDate(project.startDate)}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 'auto',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#AAA',
              paddingTop: '1rem',
            }}
          >
            第 {pageIndex + 1} 頁，共 {projectPages.length} 頁
          </div>
        </div>
      ))}
    </>
  );
};

// 永續項目執行結果頁元件
const ProjectResultsPage = ({ data }: { data: ESGReportSixPages }) => {
  // 主色
  const colorE = '#16a34a'; // 綠
  const colorS = '#7c3aed'; // 紫
  const colorG = '#ea580c'; // 橘
  return (
    <div className="page min-h-[297mm] p-10 flex flex-col" style={{ background: '#FAFAFA' }}>
      {/* 三大績效指標卡片區塊 */}
      <div style={{
        display: 'flex',
        gap: 20,
        marginBottom: 12,
        breakInside: 'avoid',
        flexWrap: 'wrap',
      }}>
        {/* 環境績效 (E) */}
        <div style={{
          flex: 1,
          minWidth: 240,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          padding: 16,
          border: '1px solid #F0F1F3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 0,
        }}>
          <div style={{ color: colorE, fontWeight: 700, fontSize: '1.15rem', marginBottom: 12 }}>環境績效 (E)</div>
          {[
            { label: '碳減排量 (噸)', value: data.projectResults.environmentalMetrics.carbonReduction },
            { label: '節約能源 (度)', value: data.projectResults.environmentalMetrics.energySaved },
            { label: '再生能源比例', value: data.projectResults.environmentalMetrics.renewablePercentage + '%' },
            { label: '廢棄物減少 (噸)', value: data.projectResults.environmentalMetrics.wasteReduction },
            { label: '節約用水 (立方米)', value: data.projectResults.environmentalMetrics.waterSaved },
          ].map((item, idx) => (
            <div key={idx} style={{ marginBottom: 8, textAlign: 'center' }}>
              <div style={{ color: colorE, fontWeight: 700, fontSize: '1.3rem' }}>{item.value}</div>
              <div style={{ color: '#666', fontSize: '0.98rem' }}>{item.label}</div>
            </div>
          ))}
        </div>
        {/* 社會績效 (S) */}
        <div style={{
          flex: 1,
          minWidth: 240,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          padding: 16,
          border: '1px solid #F0F1F3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 0,
        }}>
          <div style={{ color: colorS, fontWeight: 700, fontSize: '1.15rem', marginBottom: 12 }}>社會績效 (S)</div>
          {[
            { label: '社區受益人數 (人)', value: data.projectResults.socialMetrics.communityBeneficiaries },
            { label: '員工志工時數 (小時)', value: data.projectResults.socialMetrics.employeeVolunteerHours },
            { label: '多元化評分', value: data.projectResults.socialMetrics.diversityScore + '%' },
            { label: '女性員工比例', value: data.projectResults.socialMetrics.femaleEmployeePercentage + '%' },
            { label: '員工流動率', value: data.projectResults.socialMetrics.employeeTurnoverRate + '%' },
          ].map((item, idx) => (
            <div key={idx} style={{ marginBottom: 8, textAlign: 'center' }}>
              <div style={{ color: colorS, fontWeight: 700, fontSize: '1.3rem' }}>{item.value}</div>
              <div style={{ color: '#666', fontSize: '0.98rem' }}>{item.label}</div>
            </div>
          ))}
        </div>
        {/* 治理績效 (G) */}
        <div style={{
          flex: 1,
          minWidth: 240,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          padding: 16,
          border: '1px solid #F0F1F3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 0,
        }}>
          <div style={{ color: colorG, fontWeight: 700, fontSize: '1.15rem', marginBottom: 12 }}>治理績效 (G)</div>
          {[
            { label: '透明度評分', value: data.projectResults.governanceMetrics.transparencyScore + '%' },
            { label: '道德培訓完成率', value: data.projectResults.governanceMetrics.ethicsTraining + '%' },
            { label: '風險評估完整性', value: data.projectResults.governanceMetrics.riskAssessment + '%' },
          ].map((item, idx) => (
            <div key={idx} style={{ marginBottom: 8, textAlign: 'center' }}>
              <div style={{ color: colorG, fontWeight: 700, fontSize: '1.3rem' }}>{item.value}</div>
              <div style={{ color: '#666', fontSize: '0.98rem' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* 未來展望區塊更緊湊 */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        padding: '14px 16px',
        marginBottom: 8,
        border: '1px solid #F0F1F3',
      }}>
        <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginBottom: 8 }}>未來展望</div>
        <ul style={{ paddingLeft: 18, color: '#444', fontSize: '0.98rem', marginBottom: 0 }}>
          {data.projectResults.futureOutlook.map((item, index) => (
            <li key={index} style={{ marginBottom: 4 }}>{item}</li>
          ))}
        </ul>
      </div>
      {/* footer 貼底，不分頁 */}
      <div style={{ marginTop: 'auto' }}>
        <footer className="text-center text-gray-500 text-sm pt-4 border-t border-gray-200">
          <p>
            本報告依據國際永續標準委員會 (ISSB) 準則與全球報告倡議組織 (GRI)
            標準編製
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} {data.companyName}. 版權所有。
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ESGReportSixPagesTemplate;
