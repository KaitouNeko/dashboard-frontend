'use client';

import React, { useEffect, useState } from 'react';
import { generateSampleESGReportSixPagesData } from '@/lib/esg-report-data';
import ESGReportSixPagesTemplate from './reports/ESGReportSixPagesTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  IconReportAnalytics,
  IconRefresh,
  IconEdit,
  IconFileTypePdf,
  IconSparkles,
  IconCopy,
  IconDownload,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { generateReportPDF } from '@/utils/pdfUtils';
import axiosInstance from '@/app/api/axios';
import { set } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ESGFormData {
  // 公司基本資料
  companyName: string;
  facilityType: string;
  foundedYear: number;
  employeeCount: number;
  headquarters: string;
  industry: string;
  mission: string;
  vision: string;
  coreValues: string[];
  revenue: number;
  profit: number;

  // 環境指標
  annualElectricityUsage: number;
  useOfRenewableEnergy: boolean;
  annualWaterUsage: number;
  wasteSeparationAndRecycling: boolean;
  environmentalCertifications: boolean;

  // 社會指標
  totalNumberOfEmployees: number;
  percentageOfFemaleEmployees: number;
  employeeTrainingProvided: boolean;
  averageTrainingHoursPerEmployee: number;
  participationInCommunityActivities: boolean;
  employeeTurnoverRate: number;

  // 治理指標
  presenceOfCompanyRulesOrOperationsPolicy: boolean;
  responsiblePersonForFinanceOrRisk: boolean;
  regularInternalMeetingsHeld: boolean;
  salaryAndPromotionPolicyInPlace: boolean;
  transparencyInMajorCompanyPolicies: boolean;
  ESGOrSustainabilityOfficerOrDepartmentInPlace: boolean;
}

const LLM_MODELS = [
  { id: 'gemini', name: 'Google Gemini', disabled: false },
  { id: 'openai', name: 'OpenAI GPT-4', disabled: false },
  { id: 'watsonx', name: 'IBM WatsonX', disabled: false },
  // { id: 'claude', name: 'Anthropic Claude', disabled: true },
];

const ESGReportGenerator: React.FC = () => {
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAI, setSuggestLoadingAI] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // 設施類型選項
  const facilityTypes = [
    { id: '1', name: '傳統製造業', description: '標準能源消耗，平衡的ESG表現' },
    {
      id: '2',
      name: '重工業',
      description: '高能耗，較高碳排放，需加強環境管理',
    },
    {
      id: '3',
      name: '綠色科技業',
      description: '高再生能源使用，優秀的環境表現',
    },
    { id: '4', name: '能源密集產業', description: '極高能耗，積極轉型中' },
    { id: '5', name: '永續示範企業', description: '業界領先的永續實踐' },
  ];

  // 初始化表單數據 - 使用mock data作為預填充值
  // const getInitialFormData = (): ESGFormData => {
  //   const mockData = generateSampleESGReportSixPagesData(
  //     '綠能科技股份有限公司',
  //     '1'
  //   );

  //   return {
  //     // 公司基本資料
  //     companyName: mockData.companyName,
  //     facilityType: '1',
  //     foundedYear: mockData.companyProfile.foundedYear,
  //     employeeCount: mockData.companyProfile.employeeCount,
  //     headquarters: mockData.companyProfile.headquarters,
  //     industry: mockData.companyProfile.industry,
  //     mission: mockData.companyProfile.mission,
  //     vision: mockData.companyProfile.vision,
  //     coreValues: mockData.companyProfile.coreValues,
  //     revenue: mockData.companyProfile.keyFinancials?.revenue || 380000,
  //     profit: mockData.companyProfile.keyFinancials?.profit || 42000,

  //     // 環境指標
  //     carbonReduction:
  //       mockData.projectResults.environmentalMetrics.carbonReduction,
  //     energySaved: mockData.projectResults.environmentalMetrics.energySaved,
  //     renewablePercentage:
  //       mockData.projectResults.environmentalMetrics.renewablePercentage,
  //     wasteReduction:
  //       mockData.projectResults.environmentalMetrics.wasteReduction,
  //     waterSaved: mockData.projectResults.environmentalMetrics.waterSaved,

  //     // 社會指標
  //     communityBeneficiaries:
  //       mockData.projectResults.socialMetrics.communityBeneficiaries,
  //     employeeVolunteerHours:
  //       mockData.projectResults.socialMetrics.employeeVolunteerHours,
  //     diversityScore: mockData.projectResults.socialMetrics.diversityScore,
  //     trainingHours: mockData.projectResults.socialMetrics.trainingHours,

  //     // 治理指標
  //     transparencyScore:
  //       mockData.projectResults.governanceMetrics.transparencyScore,
  //     ethicsTraining: mockData.projectResults.governanceMetrics.ethicsTraining,
  //     riskAssessment: mockData.projectResults.governanceMetrics.riskAssessment,

  //     // 永續項目
  //     // projects: mockData.sustainabilityProjects.projects.map((project) => ({
  //     //   name: project.name,
  //     //   category: project.category,
  //     //   description: project.description,
  //     //   startDate: project.startDate.toISOString().split('T')[0],
  //     //   status: project.status,
  //     //   investmentAmount: project.keyMetrics?.investmentAmount || 1000,
  //     //   estimatedImpact: project.keyMetrics?.estimatedImpact || '正面影響',
  //     // })),
  //   };
  // };

  // const [formData, setFormData] = useState<ESGFormData>(getInitialFormData());
  const [formData, setFormData] = useState<ESGFormData>({
    companyName: '',
    facilityType: '',
    foundedYear: 0,
    employeeCount: 0,
    headquarters: '',
    industry: '',
    mission: '',
    vision: '',
    coreValues: [],
    revenue: 0,
    profit: 0,

    // 環境指標
    annualElectricityUsage: 0,
    useOfRenewableEnergy: false,
    annualWaterUsage: 0,
    wasteSeparationAndRecycling: false,
    environmentalCertifications: false,

    // 社會指標
    totalNumberOfEmployees: 0,
    percentageOfFemaleEmployees: 0,
    employeeTrainingProvided: false,
    averageTrainingHoursPerEmployee: 0,
    participationInCommunityActivities: false,
    employeeTurnoverRate: 0,

    // 治理指標
    presenceOfCompanyRulesOrOperationsPolicy: false,
    responsiblePersonForFinanceOrRisk: false,
    regularInternalMeetingsHeld: false,
    salaryAndPromotionPolicyInPlace: false,
    transparencyInMajorCompanyPolicies: false,
    ESGOrSustainabilityOfficerOrDepartmentInPlace: false,
  });

  console.log('formData', formData);

  const handleInputChange = (field: keyof ESGFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCoreValuesChange = (index: number, value: string) => {
    const newCoreValues = [...formData.coreValues];
    newCoreValues[index] = value;
    setFormData((prev) => ({
      ...prev,
      coreValues: newCoreValues,
    }));
  };

  const generateReport = async () => {
    setIsGenerating(true);

    // 模擬生成過程
    setTimeout(() => {
      // 基於表單數據生成報告
      const baseData = generateSampleESGReportSixPagesData(
        formData.companyName,
        formData.facilityType
      );

      // 使用表單數據覆蓋mock數據
      const reportData = {
        ...baseData,
        companyName: formData.companyName,
        companyProfile: {
          ...baseData.companyProfile,
          foundedYear: formData.foundedYear,
          employeeCount: formData.employeeCount,
          femaleEmployeePercentage: formData.percentageOfFemaleEmployees,
          employeeTurnoverRate: formData.employeeTurnoverRate,
          headquarters: formData.headquarters,
          industry: formData.industry,
          mission: formData.mission,
          vision: formData.vision,
          coreValues: formData.coreValues,
          keyFinancials: {
            revenue: formData.revenue,
            profit: formData.profit,
            year: new Date().getFullYear() - 1,
          },
        },
        projectResults: {
          ...baseData.projectResults,
          environmentalMetrics: {
            ...baseData.projectResults.environmentalMetrics,
            // 根據表單數據調整環境指標
            carbonReduction:
              formData.annualElectricityUsage > 0
                ? Math.round(formData.annualElectricityUsage * 0.3)
                : baseData.projectResults.environmentalMetrics.carbonReduction,
            energySaved:
              formData.annualElectricityUsage > 0
                ? Math.round(formData.annualElectricityUsage * 0.15)
                : baseData.projectResults.environmentalMetrics.energySaved,
            renewablePercentage: formData.useOfRenewableEnergy
              ? Math.min(
                  85,
                  baseData.projectResults.environmentalMetrics
                    .renewablePercentage + 20
                )
              : baseData.projectResults.environmentalMetrics
                  .renewablePercentage,
            wasteReduction: formData.wasteSeparationAndRecycling
              ? Math.round(
                  baseData.projectResults.environmentalMetrics.wasteReduction *
                    1.2
                )
              : baseData.projectResults.environmentalMetrics.wasteReduction,
            waterSaved:
              formData.annualWaterUsage > 0
                ? Math.round(formData.annualWaterUsage * 0.25)
                : baseData.projectResults.environmentalMetrics.waterSaved,
            // 新增的環境指標
            annualElectricityUsage: formData.annualElectricityUsage,
            useOfRenewableEnergy: formData.useOfRenewableEnergy,
            annualWaterUsage: formData.annualWaterUsage,
            wasteSeparationAndRecycling: formData.wasteSeparationAndRecycling,
            environmentalCertifications: formData.environmentalCertifications,
          },
          socialMetrics: {
            ...baseData.projectResults.socialMetrics,
            // 根據表單數據調整社會指標
            communityBeneficiaries: formData.participationInCommunityActivities
              ? Math.round(
                  baseData.projectResults.socialMetrics.communityBeneficiaries *
                    1.3
                )
              : baseData.projectResults.socialMetrics.communityBeneficiaries,
            employeeVolunteerHours: formData.participationInCommunityActivities
              ? Math.round(
                  baseData.projectResults.socialMetrics.employeeVolunteerHours *
                    1.4
                )
              : baseData.projectResults.socialMetrics.employeeVolunteerHours,
            diversityScore:
              formData.percentageOfFemaleEmployees > 0
                ? Math.min(
                    100,
                    Math.round(60 + formData.percentageOfFemaleEmployees * 0.8)
                  )
                : baseData.projectResults.socialMetrics.diversityScore,
            trainingHours: formData.employeeTrainingProvided
              ? formData.averageTrainingHoursPerEmployee
              : baseData.projectResults.socialMetrics.trainingHours,
            // 新增的社會指標
            femaleEmployeePercentage: formData.percentageOfFemaleEmployees,
            employeeTurnoverRate: formData.employeeTurnoverRate,
            totalEmployees: formData.totalNumberOfEmployees,
            averageTrainingHoursPerEmployee:
              formData.averageTrainingHoursPerEmployee,
            participationInCommunityActivities:
              formData.participationInCommunityActivities,
          },
          governanceMetrics: {
            ...baseData.projectResults.governanceMetrics,
            // 根據表單數據調整治理指標
            transparencyScore: formData.transparencyInMajorCompanyPolicies
              ? Math.min(
                  100,
                  baseData.projectResults.governanceMetrics.transparencyScore +
                    15
                )
              : baseData.projectResults.governanceMetrics.transparencyScore,
            ethicsTraining:
              formData.ESGOrSustainabilityOfficerOrDepartmentInPlace
                ? Math.min(
                    100,
                    baseData.projectResults.governanceMetrics.ethicsTraining +
                      10
                  )
                : baseData.projectResults.governanceMetrics.ethicsTraining,
            riskAssessment: formData.responsiblePersonForFinanceOrRisk
              ? Math.min(
                  100,
                  baseData.projectResults.governanceMetrics.riskAssessment + 12
                )
              : baseData.projectResults.governanceMetrics.riskAssessment,
            // 新增的治理指標
            presenceOfCompanyRulesOrOperationsPolicy:
              formData.presenceOfCompanyRulesOrOperationsPolicy,
            responsiblePersonForFinanceOrRisk:
              formData.responsiblePersonForFinanceOrRisk,
            regularInternalMeetingsHeld: formData.regularInternalMeetingsHeld,
            salaryAndPromotionPolicyInPlace:
              formData.salaryAndPromotionPolicyInPlace,
            transparencyInMajorCompanyPolicies:
              formData.transparencyInMajorCompanyPolicies,
            ESGOrSustainabilityOfficerOrDepartmentInPlace:
              formData.ESGOrSustainabilityOfficerOrDepartmentInPlace,
          },
        },
      };

      setGeneratedData(reportData);
      setIsGenerated(true);
      setIsGenerating(false);
    }, 2000);
  };

  const handleReset = () => {
    // setFormData(getInitialFormData());
    setIsGenerated(false);
    setGeneratedData(null);
  };

  // PDF下載功能
  const downloadPDF = async () => {
    setIsDownloadingPDF(true);
    setPdfError(null);

    try {
      // 使用優化的PDF生成工具
      await generateReportPDF('esg-report', {
        filename: `${formData.companyName}_ESG報告_${
          new Date().toISOString().split('T')[0]
        }.pdf`,
        margin: [10, 10, 10, 10], // 上、右、下、左邊距
        pageSize: 'a4',
        orientation: 'portrait',
        scale: 2, // 提高解析度
      });

      console.log('PDF生成成功');
    } catch (err) {
      console.error('PDF生成錯誤:', err);
      setPdfError(err instanceof Error ? err.message : '未知錯誤');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const [selectedLLM, setSelectedLLM] = useState('gemini');

  const [content, setContent] = useState<string>(`
    這是一間名為 GreenFuture Tech Inc. 的企業，成立於 2010 年，總部位於美國加州聖荷西，屬於潔淨能源技術產業，主要從事綠能解決方案的開發與應用。公司目前擁有約 850 名員工，設施類型為企業總部。

    他們的使命是推動全球邁向更永續的能源未來，願景是成為全球創新綠色科技的領導者。企業核心價值包含創新、誠信、永續性、多元化與客戶導向。

    在財務表現方面，公司年營收達 1.2 億美元，年獲利約為 1,500 萬美元，顯示其經營穩定且具備良好的獲利能力。

    在環境管理方面，該公司每年電力使用量約為 300 萬度（kWh），但他們全面使用再生能源，如太陽能與風能，並取得了環境相關的認證，例如 ISO 14001。年用水量約為 10 萬立方公尺，公司也積極進行廢棄物分類與回收。

    在人力資源與社會責任層面，公司員工總數為 850 人，女性員工比例約為 42.5%。公司提供員工完整的教育訓練計畫，每位員工平均每年接受約 35 小時的培訓，並定期舉辦社區參與活動。此外，他們的員工流動率約為 8.7%，顯示員工穩定性良好。

    在公司治理方面，該企業具備完整的公司規章與營運政策，並設有專責的財務與風險管理人員，定期召開內部會議以強化決策透明與溝通效率。他們也建立了完善的薪資與升遷制度，且對外公開公司重大政策，展現高度透明度。同時，公司內部設有 ESG 或永續發展部門，專責推動企業社會責任與永續議題。`);

  const solidContent = `
  請將上述描述內容符合的值填入以下對應欄位，並格式化為JSON對象，不要有其他文字，如果找不到適合填入的欄位，字串類型就帶入空字串，數字類型就帶入0，格式為：
  {
    "companyName": string,
    "facilityType": string,
    "foundedYear": number,
    "employeeCount": number,
    "headquarters": string,
    "industry": string,
    "mission": string,
    "vision": string,
    "coreValues": string[],
    "revenue": number,
    "profit": number,

    "annualElectricityUsage": number,
    "useOfRenewableEnergy": boolean,
    "annualWaterUsage": number,
    "wasteSeparationAndRecycling": boolean,
    "environmentalCertifications": boolean,

    "totalNumberOfEmployees": number,
    "percentageOfFemaleEmployees": number,
    "employeeTrainingProvided": boolean,
    "averageTrainingHoursPerEmployee": number,
    "participationInCommunityActivities": boolean,
    "employeeTurnoverRate": number,

    "presenceOfCompanyRulesOrOperationsPolicy": false,
    "responsiblePersonForFinanceOrRisk": false,
    "regularInternalMeetingsHeld": false,
    "salaryAndPromotionPolicyInPlace": false,
    "transparencyInMajorCompanyPolicies": false,
    "ESGOrSustainabilityOfficerOrDepartmentInPlace": false,
  }
  公司章程對應為presenceOfCompanyRulesOrOperationsPolicy
  永續單位對應為ESGOrSustainabilityOfficerOrDepartmentInPlace
  `;

  const handleSendESGPrompt = async () => {
    const data = await axiosInstance.post('esg/chat', {
      message: '描述：' + content + '。' + solidContent,
      model: selectedLLM,
      // model: 'wastonx',
      // model: 'gemini',
    });

    console.log('data', data);

    if (data?.data) {
      const formatData = `${data.data.response
        .replace(/```json/g, '')
        .replace(/```/g, '')}`;
      console.log('formatData', JSON.parse(formatData));
      const transData = JSON.parse(formatData);
      setFormData((prev) => ({
        ...prev,
        companyName: transData.companyName,
        facilityType: transData.facilityType && '1',
        foundedYear: transData.foundedYear,
        employeeCount: transData.employeeCount,
        headquarters: transData.headquarters,
        industry: transData.industry,
        mission: transData.mission,
        vision: transData.vision,
        coreValues: transData.coreValues,
        revenue: transData.revenue,
        profit: transData.profit,

        // 環境指標
        annualElectricityUsage: transData.annualElectricityUsage,
        useOfRenewableEnergy: transData.useOfRenewableEnergy,
        annualWaterUsage: transData.annualWaterUsage,
        wasteSeparationAndRecycling: transData.wasteSeparationAndRecycling,
        environmentalCertifications: transData.environmentalCertifications,

        // 社會指標
        totalNumberOfEmployees: transData.totalNumberOfEmployees,
        percentageOfFemaleEmployees: transData.percentageOfFemaleEmployees,
        employeeTrainingProvided: transData.employeeTrainingProvided,
        averageTrainingHoursPerEmployee:
          transData.averageTrainingHoursPerEmployee,
        participationInCommunityActivities:
          transData.participationInCommunityActivities,
        employeeTurnoverRate: transData.employeeTurnoverRate,

        // 治理指標
        presenceOfCompanyRulesOrOperationsPolicy:
          transData.presenceOfCompanyRulesOrOperationsPolicy,
        responsiblePersonForFinanceOrRisk:
          transData.responsiblePersonForFinanceOrRisk,
        regularInternalMeetingsHeld: transData.regularInternalMeetingsHeld,
        salaryAndPromotionPolicyInPlace:
          transData.salaryAndPromotionPolicyInPlace,
        transparencyInMajorCompanyPolicies:
          transData.transparencyInMajorCompanyPolicies,
        ESGOrSustainabilityOfficerOrDepartmentInPlace:
          transData.ESGOrSustainabilityOfficerOrDepartmentInPlace,
      }));
    }
  };

  // AI建議生成功能
  const generateAISuggestion = async () => {
    setSuggestLoadingAI(true);
    const data = await axiosInstance.post('/chat', {
      message: '提供一個公司願景的建議，直接說願景不要說其他的',
      model: 'openai',
      // model: 'wastonx',
      // model: 'gemini',
    });

    console.log('generateAISuggestion data', data);

    if (data?.data?.response) {
      setAiSuggestion(data.data.response);
    }
    setSuggestLoadingAI(false);
  };

  // 應用AI建議到項目描述
  const applyAISuggestion = () => {
    if (aiSuggestion) {
      // 清除建議以節省空間
      setAiSuggestion('');
      setFormData((prev) => ({
        ...prev,
        vision: aiSuggestion,
      }));
    }
  };

  if (isGenerated && generatedData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <IconFileTypePdf className="h-8 w-8 text-green-600" />
              ESG報告生成結果
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={downloadPDF}
                disabled={isDownloadingPDF}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                {isDownloadingPDF ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    生成PDF中...
                  </>
                ) : (
                  <>
                    <IconDownload className="h-4 w-4" />
                    下載PDF報告
                  </>
                )}
              </Button>
              <Button
                onClick={() => setIsGenerated(false)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <IconEdit className="h-4 w-4" />
                繼續編輯
              </Button>
            </div>
          </div>

          {/* PDF錯誤提示 */}
          {pdfError && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>
                <strong>PDF生成錯誤:</strong> {pdfError}
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg">
            <ESGReportSixPagesTemplate data={generatedData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IconReportAnalytics className="h-8 w-8" />
            ESG報告自動生成器
          </h1>
          <p className="text-muted-foreground mt-2">
            編輯下方表單中的資料，系統將自動生成專業的六頁式ESG永續發展報告
          </p>
        </div>

        <div className="mb-[20px]">
          <Textarea
            name=""
            id=""
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-[100%] mb-[10px] text-white"
          />
          <div className="flex gap-2">
            <Select
              value={selectedLLM}
              onValueChange={(value) => {
                setSelectedLLM(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="選擇LLM模型" />
              </SelectTrigger>
              <SelectContent>
                {LLM_MODELS.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    disabled={model.disabled}
                  >
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSendESGPrompt}>提交</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 公司基本資料 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏢 公司基本資料</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">公司名稱</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange('companyName', e.target.value)
                  }
                  placeholder="請輸入公司名稱"
                />
              </div>

              <div>
                <Label htmlFor="facilityType">設施類型</Label>
                <Select
                  value={formData.facilityType}
                  onValueChange={(value) =>
                    handleInputChange('facilityType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {facilityTypes.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="foundedYear">成立年份</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) =>
                      handleInputChange('foundedYear', parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="employeeCount">員工人數</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    value={formData.employeeCount}
                    onChange={(e) =>
                      handleInputChange(
                        'employeeCount',
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="headquarters">總部地址</Label>
                <Input
                  id="headquarters"
                  value={formData.headquarters}
                  onChange={(e) =>
                    handleInputChange('headquarters', e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="industry">產業類別</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) =>
                    handleInputChange('industry', e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="mission">使命</Label>
                <Textarea
                  id="mission"
                  value={formData.mission}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <div>
                  <Label htmlFor="vision">願景</Label>

                  <div className="flex gap-2">
                    <Textarea
                      id="vision"
                      value={formData.vision}
                      onChange={(e) =>
                        handleInputChange('vision', e.target.value)
                      }
                      rows={2}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateAISuggestion()}
                      disabled={loadingAI}
                      className="flex items-center gap-2 px-3 py-2 h-auto whitespace-nowrap"
                      title="AI智能建議項目描述"
                    >
                      {loadingAI ? (
                        <>
                          <div className="animate-spin h-3 w-3 border border-gray-300 border-t-blue-600 rounded-full"></div>
                          <span className="text-xs">生成中</span>
                        </>
                      ) : (
                        <>
                          <IconSparkles className="h-3 w-3 text-blue-600" />
                          <span className="text-xs">AI建議</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {/* AI建議顯示區域 */}
              {aiSuggestion && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconSparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        AI 智能建議
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applyAISuggestion()}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-xs px-2 py-1 h-auto"
                        title="使用此建議"
                      >
                        <IconCopy className="h-3 w-3 mr-1" />
                        使用建議
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAiSuggestion('')}
                        className="text-gray-500 hover:text-gray-600 hover:bg-gray-100 text-xs px-2 py-1 h-auto"
                        title="關閉建議"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {aiSuggestion}
                  </p>
                </div>
              )}

              <div>
                <Label>核心價值觀</Label>
                {formData.coreValues.map((value, index) => (
                  <Input
                    key={index}
                    value={value}
                    onChange={(e) =>
                      handleCoreValuesChange(index, e.target.value)
                    }
                    className="mt-2"
                    placeholder={`核心價值 ${index + 1}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="revenue">營收</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={formData.revenue}
                    onChange={(e) =>
                      handleInputChange('revenue', parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="profit">獲利</Label>
                  <Input
                    id="profit"
                    type="number"
                    value={formData.profit}
                    onChange={(e) =>
                      handleInputChange('profit', parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 環境指標 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🌱 環境指標</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="annualElectricityUsage">年度用電量 (度)</Label>
                <Input
                  id="annualElectricityUsage"
                  type="number"
                  value={formData.annualElectricityUsage}
                  onChange={(e) =>
                    handleInputChange(
                      'annualElectricityUsage',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="annualElectricityUsage">是否使用再生能源</Label>
                <RadioGroup
                  name="useOfRenewableEnergy"
                  value={formData.useOfRenewableEnergy ? 'yes' : 'no'}
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange('useOfRenewableEnergy', value === 'yes');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="useOfRenewableEnergy">是</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="useOfRenewableEnergy">否</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="annualWaterUsage">年用水量（公噸）</Label>
                <Input
                  id="annualWaterUsage"
                  type="number"
                  value={formData.annualWaterUsage}
                  onChange={(e) =>
                    handleInputChange(
                      'annualWaterUsage',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="annualElectricityUsage">
                  是否進行垃圾分類與回收
                </Label>
                <RadioGroup
                  name="wasteSeparationAndRecycling"
                  value={formData.wasteSeparationAndRecycling ? 'yes' : 'no'}
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'wasteSeparationAndRecycling',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="wasteSeparationAndRecycling">是</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="wasteSeparationAndRecycling">否</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="annualElectricityUsage">
                  是否取得環保相關證書（如 ISO 14001）
                </Label>
                <RadioGroup
                  name="environmentalCertifications"
                  value={formData.environmentalCertifications ? 'yes' : 'no'}
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'environmentalCertifications',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="environmentalCertifications">是</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="environmentalCertifications">否</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* 社會指標 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👥 社會指標</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="totalNumberOfEmployees">員工總人數</Label>
                <Input
                  id="totalNumberOfEmployees"
                  type="number"
                  value={formData.totalNumberOfEmployees}
                  onChange={(e) =>
                    handleInputChange(
                      'totalNumberOfEmployees',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="percentageOfFemaleEmployees">
                  女性員工比例
                </Label>
                <Input
                  id="percentageOfFemaleEmployees"
                  type="number"
                  value={formData.percentageOfFemaleEmployees}
                  onChange={(e) =>
                    handleInputChange(
                      'percentageOfFemaleEmployees',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="employeeTrainingProvided">
                  是否提供員工訓練
                </Label>
                <RadioGroup
                  name="employeeTrainingProvided"
                  value={formData.employeeTrainingProvided ? 'yes' : 'no'}
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'employeeTrainingProvided',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="employeeTrainingProvided">是</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="employeeTrainingProvided">否</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="averageTrainingHoursPerEmployee">
                  平均每人訓練時數
                </Label>
                <Input
                  id="averageTrainingHoursPerEmployee"
                  type="number"
                  value={formData.averageTrainingHoursPerEmployee}
                  onChange={(e) =>
                    handleInputChange(
                      'averageTrainingHoursPerEmployee',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="participationInCommunityActivities">
                  是否參與公益活動（如捐贈/志工）
                </Label>
                <RadioGroup
                  name="participationInCommunityActivities"
                  value={
                    formData.participationInCommunityActivities ? 'yes' : 'no'
                  }
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'participationInCommunityActivities',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="participationInCommunityActivities">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="participationInCommunityActivities">
                      否
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="employeeTurnoverRate">最近一年離職率</Label>
                <Input
                  id="employeeTurnoverRate"
                  type="number"
                  value={formData.employeeTurnoverRate}
                  onChange={(e) =>
                    handleInputChange(
                      'employeeTurnoverRate',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* 治理指標 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏛️ 治理指標</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="presenceOfCompanyRulesOrOperationsPolicy">
                  是否有公司章程或營運制度
                </Label>
                <RadioGroup
                  name="presenceOfCompanyRulesOrOperationsPolicy"
                  value={
                    formData.presenceOfCompanyRulesOrOperationsPolicy
                      ? 'yes'
                      : 'no'
                  }
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'presenceOfCompanyRulesOrOperationsPolicy',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="presenceOfCompanyRulesOrOperationsPolicy">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="presenceOfCompanyRulesOrOperationsPolicy">
                      否
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="responsiblePersonForFinanceOrRisk">
                  是否有負責帳務或風險的專責人員
                </Label>
                <RadioGroup
                  name="responsiblePersonForFinanceOrRisk"
                  value={
                    formData.responsiblePersonForFinanceOrRisk ? 'yes' : 'no'
                  }
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'responsiblePersonForFinanceOrRisk',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="responsiblePersonForFinanceOrRisk">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="responsiblePersonForFinanceOrRisk">
                      否
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="regularInternalMeetingsHeld">
                  是否有固定內部會議（老闆與團隊）
                </Label>
                <RadioGroup
                  name="regularInternalMeetingsHeld"
                  value={formData.regularInternalMeetingsHeld ? 'yes' : 'no'}
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'regularInternalMeetingsHeld',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="regularInternalMeetingsHeld">是</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="regularInternalMeetingsHeld">否</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="salaryAndPromotionPolicyInPlace">
                  是否有薪資與升遷制度
                </Label>
                <RadioGroup
                  name="salaryAndPromotionPolicyInPlace"
                  value={
                    formData.salaryAndPromotionPolicyInPlace ? 'yes' : 'no'
                  }
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'salaryAndPromotionPolicyInPlace',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="salaryAndPromotionPolicyInPlace">是</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="salaryAndPromotionPolicyInPlace">否</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="transparencyInMajorCompanyPolicies">
                  是否有公開重大政策（如薪資結構）
                </Label>
                <RadioGroup
                  name="transparencyInMajorCompanyPolicies"
                  value={
                    formData.transparencyInMajorCompanyPolicies ? 'yes' : 'no'
                  }
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'transparencyInMajorCompanyPolicies',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="transparencyInMajorCompanyPolicies">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="transparencyInMajorCompanyPolicies">
                      否
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4 items-center py-1">
                <Label htmlFor="ESGOrSustainabilityOfficerOrDepartmentInPlace">
                  是否設立 ESG 或永續負責單位
                </Label>
                <RadioGroup
                  name="ESGOrSustainabilityOfficerOrDepartmentInPlace"
                  value={
                    formData.ESGOrSustainabilityOfficerOrDepartmentInPlace
                      ? 'yes'
                      : 'no'
                  }
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange(
                      'ESGOrSustainabilityOfficerOrDepartmentInPlace',
                      value === 'yes'
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="ESGOrSustainabilityOfficerOrDepartmentInPlace">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="ESGOrSustainabilityOfficerOrDepartmentInPlace">
                      否
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <IconRefresh className="h-4 w-4" />
            重置表單
          </Button>

          <Button
            onClick={generateReport}
            disabled={isGenerating || !formData.companyName}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-8"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                生成中...
              </>
            ) : (
              <>
                <IconFileTypePdf className="h-4 w-4" />
                生成 ESG 報告
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ESGReportGenerator;
