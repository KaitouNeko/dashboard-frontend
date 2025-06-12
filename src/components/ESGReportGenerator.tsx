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

const ESGReportGenerator: React.FC = () => {
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ [key: number]: string }>(
    {}
  );
  const [loadingAI, setLoadingAI] = useState<{ [key: number]: boolean }>({});
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

  const handleProjectChange = (index: number, field: string, value: any) => {
    const newProjects = [...formData.projects];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      projects: newProjects,
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
            annualElectricityUsage: formData.annualElectricityUsage,
            useOfRenewableEnergy: formData.useOfRenewableEnergy,
            annualWaterUsage: formData.annualWaterUsage,
            wasteSeparationAndRecycling: formData.wasteSeparationAndRecycling,
            environmentalCertifications: formData.environmentalCertifications,
          },
          socialMetrics: {
            totalNumberOfEmployees: formData.totalNumberOfEmployees,
            percentageOfFemaleEmployees: formData.percentageOfFemaleEmployees,
            employeeTrainingProvided: formData.employeeTrainingProvided,
            averageTrainingHoursPerEmployee:
              formData.averageTrainingHoursPerEmployee,
            participationInCommunityActivities:
              formData.participationInCommunityActivities,
            employeeTurnoverRate: formData.employeeTurnoverRate,
          },
          governanceMetrics: {
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

  // AI建議生成功能
  const generateAISuggestion = async (projectIndex: number) => {
    const project = formData.projects[projectIndex];
    setLoadingAI((prev) => ({ ...prev, [projectIndex]: true }));

    // 模擬AI建議生成
    setTimeout(() => {
      const suggestions: {
        [category: string]: { [projectName: string]: string };
      } = {
        environmental: {
          陽光綠能計畫:
            '本項目致力於推動再生能源發展，透過在企業設施屋頂安裝高效率太陽能發電系統，提升綠色能源使用比例。項目包含系統設計、設備採購、安裝施工及後續維護等完整服務。預期每年可產生約180萬度綠色電力，減少約900噸CO2排放，為企業達成碳中和目標奠定重要基礎。同時透過能源自主供應，降低電力成本並提升能源安全性。',
          循環經濟示範廠:
            '建立完整的循環經濟生產模式，將生產過程中產生的副產品與廢棄物重新設計為可利用資源。透過創新的資源回收技術與製程優化，實現廢棄物減量、資源再利用及價值創造的三重效益。項目涵蓋廢料分類系統、再製技術開發、品質控制機制等，目標達成95%以上的資源循環利用率，大幅降低環境負荷並創造新的營收來源。',
          數位轉型減碳計畫:
            '運用物聯網、大數據分析及人工智慧技術，建置智慧化能源管理系統，實現生產設備與能耗的即時監控與最佳化調控。透過數據驅動的能源管理，識別節能機會點並自動調整設備運行參數，有效提升能源使用效率。預期可減少15-20%的整體能耗，降低碳排放的同時提升營運效率與競爭力。',
        },
        social: {
          永續人才培育計畫:
            '建立系統性的永續發展人才培育機制，涵蓋ESG知識、永續技能及創新思維等多元面向。透過內部培訓、外部研習、實務專案及跨部門合作等方式，提升全體員工的永續意識與專業能力。計畫包含線上學習平台、專業認證課程、永續創新競賽等，預期培養100%員工具備永續基本素養，培育50位永續專業人才，為企業永續轉型提供堅實的人力資源基礎。',
          社區賦能計畫:
            '秉持企業社會責任精神，投入資源支持在地社區發展，重點關注教育提升、技能培訓及經濟賦能等面向。透過與地方政府、學校及非營利組織合作，提供數位技能課程、創業輔導、獎學金計畫等多元服務。預期每年服務3,000位社區民眾，協助提升就業技能與生活品質，創造企業與社區共榮共好的永續發展模式。',
          多元共融職場:
            '打造包容性的工作環境，消除各種形式的歧視與偏見，建立公平公正的人才發展機制。透過多元招募政策、無障礙設施建置、彈性工作安排及友善育兒措施等，支持不同背景員工發揮潛能。定期進行多元共融意識培訓，建立申訴與調解機制，營造互相尊重與支持的企業文化。目標達成管理階層性別比例平衡，身心障礙員工聘用率達法定標準以上。',
        },
        governance: {
          ESG治理制度建置:
            '建立完善的ESG治理架構，設立ESG委員會並明確其職責與運作機制。制定ESG政策與管理程序，建立風險識別、評估與管控系統，確保永續發展策略的有效執行。透過定期檢討與持續改善，強化董事會對ESG議題的監督功能，並將ESG績效納入高階主管薪酬考核，確保永續承諾的實現。',
          供應鏈永續管理:
            '建立供應商ESG評估與管理機制，要求供應商遵循環境保護、勞工權益及誠信經營等標準。透過供應商稽核、能力建設及改善輔導，提升整體供應鏈的永續表現。建置供應商永續評分系統，優先與ESG表現優良的夥伴合作，共同打造負責任的價值鏈。預期100%關鍵供應商通過ESG評估，形成永續供應鏈生態系統。',
          透明度與揭露強化:
            '建立透明、及時且完整的ESG資訊揭露機制，依循國際準則編製永續報告書並通過第三方驗證。設置利害關係人溝通平台，定期舉辦說明會與工作坊，收集各方意見並回應關切議題。透過數位化平台即時更新ESG績效資訊，提升資訊透明度與可及性，建立與投資人、客戶及社會大眾的信任關係。',
        },
      };

      // 根據項目類別和名稱生成建議
      let suggestion = '';
      if (project.category && suggestions[project.category]) {
        // 嘗試精確匹配項目名稱
        const exactMatch = suggestions[project.category][project.name];
        if (exactMatch) {
          suggestion = exactMatch;
        } else {
          // 根據關鍵字匹配
          if (
            project.name.includes('綠能') ||
            project.name.includes('太陽能') ||
            project.name.includes('再生能源')
          ) {
            suggestion = suggestions.environmental['陽光綠能計畫'];
          } else if (
            project.name.includes('循環') ||
            project.name.includes('回收') ||
            project.name.includes('廢棄物')
          ) {
            suggestion = suggestions.environmental['循環經濟示範廠'];
          } else if (
            project.name.includes('數位') ||
            project.name.includes('智慧') ||
            project.name.includes('AI') ||
            project.name.includes('減碳')
          ) {
            suggestion = suggestions.environmental['數位轉型減碳計畫'];
          } else if (
            project.name.includes('人才') ||
            project.name.includes('培訓') ||
            project.name.includes('教育')
          ) {
            suggestion = suggestions.social['永續人才培育計畫'];
          } else if (
            project.name.includes('社區') ||
            project.name.includes('公益') ||
            project.name.includes('服務')
          ) {
            suggestion = suggestions.social['社區賦能計畫'];
          } else if (
            project.name.includes('多元') ||
            project.name.includes('共融') ||
            project.name.includes('職場')
          ) {
            suggestion = suggestions.social['多元共融職場'];
          } else if (
            project.name.includes('治理') ||
            project.name.includes('委員會') ||
            project.name.includes('制度')
          ) {
            suggestion = suggestions.governance['ESG治理制度建置'];
          } else if (
            project.name.includes('供應鏈') ||
            project.name.includes('供應商')
          ) {
            suggestion = suggestions.governance['供應鏈永續管理'];
          } else if (
            project.name.includes('透明') ||
            project.name.includes('揭露') ||
            project.name.includes('報告')
          ) {
            suggestion = suggestions.governance['透明度與揭露強化'];
          } else {
            // 根據類別提供通用建議
            const categoryDefaults = {
              environmental:
                '本環境項目致力於減少環境影響，透過創新技術與管理措施，提升資源使用效率並降低碳足跡。項目包含完整的規劃、執行與監控機制，預期將為企業環境績效帶來顯著改善，並支持永續發展目標的達成。',
              social:
                '本社會責任項目關注利害關係人權益，透過系統性的方案設計與執行，促進社會共融與永續發展。項目將整合內外部資源，建立長期合作夥伴關係，創造企業與社會的共享價值。',
              governance:
                '本治理項目旨在強化企業治理效能，建立透明、負責且有效的管理機制。透過制度建置、流程優化與能力提升，確保企業營運符合法規要求與國際標準，提升企業治理水準與競爭力。',
            };
            suggestion =
              categoryDefaults[project.category] ||
              '本永續項目致力於創造環境、社會與經濟的平衡發展，透過創新的方法與技術，推動企業永續轉型並創造長期價值。';
          }
        }
      } else {
        suggestion =
          '本永續項目致力於創造環境、社會與經濟的平衡發展，透過創新的方法與技術，推動企業永續轉型並創造長期價值。';
      }

      setAiSuggestions((prev) => ({ ...prev, [projectIndex]: suggestion }));
      setLoadingAI((prev) => ({ ...prev, [projectIndex]: false }));
    }, 2000);
  };

  // 應用AI建議到項目描述
  const applyAISuggestion = (projectIndex: number) => {
    const suggestion = aiSuggestions[projectIndex];
    if (suggestion) {
      handleProjectChange(projectIndex, 'description', suggestion);
      // 清除建議以節省空間
      setAiSuggestions((prev) => {
        const newSuggestions = { ...prev };
        delete newSuggestions[projectIndex];
        return newSuggestions;
      });
    }
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

  const [content, setContent] = useState<string>(`
    公司名稱是哈哈科技股份有限公司，設施類型是綠色科技業，成立年份是2010年。
    員工人數是500人，總部位於台北市，行業是綠色科技。公司的使命是「推動綠色科技創新」，願景是「成為全球領先的綠色科技公司」，核心價值包括「創新、永續、社會責任」。
    公司年收入是380000萬，利潤是42000萬。
    環境指標方面，碳減排量是10000噸，節能量是5000兆瓦時，可再生能源使用比例是60%，廢物減少量是2000噸，節水量是3000立方米。
    社會指標方面，社區受益人數是10000人，員工志願服務時數是2000小時，多元化得分是85，培訓時數是5000小時。
    治理指標方面，透明度得分是90，倫理培訓參與率是95%，風險評估完成率是100%。`);

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

  const handleSendPrompt = async () => {
    const data = await axiosInstance.post('/chat', {
      message: '描述：' + content + '。' + solidContent,
      model: 'openai',
    });

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
          <Button onClick={handleSendPrompt}>提交</Button>
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
                <Label htmlFor="vision">願景</Label>
                <Textarea
                  id="vision"
                  value={formData.vision}
                  onChange={(e) => handleInputChange('vision', e.target.value)}
                  rows={2}
                />
              </div>

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
                  <Label htmlFor="revenue">營收 (萬元)</Label>
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
                  <Label htmlFor="profit">獲利 (萬元)</Label>
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
              <div className="flex gap-4">
                <Label htmlFor="annualElectricityUsage">是否使用再生能源</Label>
                <RadioGroup
                  name="useOfRenewableEnergy"
                  value={formData.useOfRenewableEnergy ? 'yes' : 'no'}
                  className="flex"
                  onValueChange={(value) => {
                    handleInputChange('useOfRenewableEnergy', value === 'yes');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="useOfRenewableEnergy">是</Label>
                  </div>
                  <div className="flex items-center gap-1">
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
              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="wasteSeparationAndRecycling">是</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="wasteSeparationAndRecycling">否</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="environmentalCertifications">是</Label>
                  </div>
                  <div className="flex items-center gap-1">
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
              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="employeeTrainingProvided">是</Label>
                  </div>
                  <div className="flex items-center gap-1">
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
              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="participationInCommunityActivities">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-1">
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
              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="presenceOfCompanyRulesOrOperationsPolicy">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="presenceOfCompanyRulesOrOperationsPolicy">
                      否
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="responsiblePersonForFinanceOrRisk">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="responsiblePersonForFinanceOrRisk">
                      否
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="regularInternalMeetingsHeld">是</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="regularInternalMeetingsHeld">否</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="salaryAndPromotionPolicyInPlace">是</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="salaryAndPromotionPolicyInPlace">否</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="transparencyInMajorCompanyPolicies">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="no" />
                    <Label htmlFor="transparencyInMajorCompanyPolicies">
                      否
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-4">
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
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="yes" />
                    <Label htmlFor="ESGOrSustainabilityOfficerOrDepartmentInPlace">
                      是
                    </Label>
                  </div>
                  <div className="flex items-center gap-1">
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
