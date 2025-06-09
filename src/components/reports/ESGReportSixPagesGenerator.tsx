"use client";

import React, { useState } from 'react';
import ESGReportSixPagesTemplate from './ESGReportSixPagesTemplate';
import { ESGReportSixPages } from '@/lib/esg-report-data';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { generateReportPDF } from '@/utils/pdfUtils';

interface ESGReportSixPagesGeneratorProps {
  reportData: ESGReportSixPages;
  fileName?: string;
}

const ESGReportSixPagesGenerator: React.FC<ESGReportSixPagesGeneratorProps> = ({
  reportData,
  fileName = 'esg-report.pdf'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // 使用優化的PDF生成工具
      await generateReportPDF('esg-report', {
        filename: fileName,
        margin: [10, 10, 10, 10], // 上、右、下、左邊距
        pageSize: 'a4',
        orientation: 'portrait',
        scale: 2, // 提高解析度
      });

      console.log('PDF生成成功');
    } catch (err) {
      console.error('PDF生成錯誤:', err);
      setError(err instanceof Error ? err.message : '未知錯誤');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="esg-report-generator">
      {/* 報告預覽 */}
      <div className="preview-container mb-6">
        <ESGReportSixPagesTemplate data={reportData} />
      </div>

      {/* 按鈕控制區域 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成PDF中...
            </>
          ) : (
            '下載ESG永續報告 (PDF)'
          )}
        </Button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>錯誤: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ESGReportSixPagesGenerator; 