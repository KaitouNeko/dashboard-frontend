import { format, subMonths } from "date-fns";
import { zhTW } from 'date-fns/locale';

// ESG報告的六頁式結構數據模型
export interface ESGReportSixPages {
  // 共享資訊
  companyName: string;
  reportDate: string;
  reportPeriod: {
    from: Date;
    to: Date;
  };
  
  // 第1頁: 封面頁
  coverPage: {
    title: string;
    subtitle: string;
    imageUrl?: string;
    companyLogo?: string;
  };
  
  // 第2頁: 目錄頁
  tableOfContents: {
    sections: Array<{
      title: string;
      page: number;
    }>;
  };
  
  // 第3頁: 公司簡介頁
  companyProfile: {
    description: string;
    foundedYear: number;
    employeeCount: number;
    headquarters: string;
    industry: string;
    mission: string;
    vision: string;
    coreValues: string[];
    keyFinancials?: {
      revenue: number;
      profit: number;
      year: number;
    };
  };
  
  // 第4頁: ESG永續目標頁
  sustainabilityGoals: {
    overview: string;
    environmentalGoals: Array<{
      title: string;
      description: string;
      targetYear: number;
      currentProgress: number; // 百分比，0-100
    }>;
    socialGoals: Array<{
      title: string;
      description: string;
      targetYear: number;
      currentProgress: number; // 百分比，0-100
    }>;
    governanceGoals: Array<{
      title: string;
      description: string;
      targetYear: number;
      currentProgress: number; // 百分比，0-100
    }>;
    sdgContributions: number[]; // SDG目標編號，例如 [7, 11, 12, 13]
  };
  
  // 第5頁: 永續項目頁
  sustainabilityProjects: {
    overview: string;
    projects: Array<{
      name: string;
      category: 'environmental' | 'social' | 'governance';
      description: string;
      startDate: Date;
      status: 'planning' | 'in-progress' | 'completed';
      keyMetrics?: {
        investmentAmount: number; // 投資金額 (萬元)
        estimatedImpact: string;
      };
    }>;
  };
  
  // 第6頁: 永續項目執行結果頁
  projectResults: {
    overview: string;
    environmentalMetrics: {
      annualElectricityUsage: number;
      useOfRenewableEnergy: boolean;
      annualWaterUsage: number;
      wasteSeparationAndRecycling: boolean;
      environmentalCertifications: boolean;
    };
    socialMetrics: {
      totalNumberOfEmployees: number;
      percentageOfFemaleEmployees: number;
      employeeTrainingProvided: boolean;
      averageTrainingHoursPerEmployee: number;
      participationInCommunityActivities: boolean;
      employeeTurnoverRate: number;
    };
    governanceMetrics: {
      presenceOfCompanyRulesOrOperationsPolicy: boolean;
      responsiblePersonForFinanceOrRisk: boolean;
      regularInternalMeetingsHeld: boolean;
      salaryAndPromotionPolicyInPlace: boolean;
      transparencyInMajorCompanyPolicies: boolean;
      ESGOrSustainabilityOfficerOrDepartmentInPlace: boolean;
    };
    yearOnYearComparison: {
      categories: string[];
      previousYearData: number[];
      currentYearData: number[];
    };
    futureOutlook: string[];
  };
}

// 根據設施 ID 調整數據的函數
const adjustDataByFacilityId = (facilityId: string) => {
  // 根據不同的設施 ID 調整數據
  const facilityFactors: Record<string, { 
    energyFactor: number, 
    renewableFactor: number,
    carbonFactor: number,
    socialFactor: number,
    governanceFactor: number
  }> = {
    '1': { energyFactor: 1.0, renewableFactor: 1.0, carbonFactor: 1.0, socialFactor: 1.0, governanceFactor: 1.0 },
    '2': { energyFactor: 1.2, renewableFactor: 0.8, carbonFactor: 1.4, socialFactor: 0.9, governanceFactor: 0.95 },
    '3': { energyFactor: 0.8, renewableFactor: 1.5, carbonFactor: 0.7, socialFactor: 1.2, governanceFactor: 1.1 },
    '4': { energyFactor: 1.5, renewableFactor: 0.6, carbonFactor: 1.8, socialFactor: 0.8, governanceFactor: 0.9 },
    '5': { energyFactor: 0.6, renewableFactor: 1.8, carbonFactor: 0.5, socialFactor: 1.3, governanceFactor: 1.2 }
  };
  
  return facilityFactors[facilityId] || facilityFactors['1']; // 預設使用 ID 1 的因子
};

// 產生示範ESG報告數據 (六頁式)
export const generateSampleESGReportSixPagesData = (
  companyName: string = "綠能科技股份有限公司",
  facilityId: string = "1"
): ESGReportSixPages => {
  const today = new Date();
  const sixMonthsAgo = subMonths(today, 6);
  const oneYearAgo = subMonths(today, 12);
  
  // 獲取設施特定的調整因子
  const { 
    energyFactor, 
    renewableFactor, 
    carbonFactor,
    socialFactor,
    governanceFactor
  } = adjustDataByFacilityId(facilityId);
  
  // 格式化日期範圍
  const formattedDateRange = `${format(oneYearAgo, 'yyyy年MM月dd日', { locale: zhTW })} - ${format(today, 'yyyy年MM月dd日', { locale: zhTW })}`;
  
  // 格式化當前日期為報告日期
  const reportDate = format(today, 'yyyy年MM月dd日', { locale: zhTW });
  
  // 計算再生能源百分比，根據設施的再生能源因子調整
  const renewablePercentage = Math.min(Math.round(30 * renewableFactor), 100);
  
  // 創建完整的六頁式報告數據
  return {
    companyName,
    reportDate,
    reportPeriod: {
      from: oneYearAgo,
      to: today
    },
    
    // 第1頁: 封面頁
    coverPage: {
      title: "ESG永續發展報告",
      subtitle: formattedDateRange,
      imageUrl: "/images/sustainability-cover.jpg", // 假設的封面圖片路徑
      companyLogo: "/images/company-logo.png", // 假設的公司logo路徑
    },
    
    // 第2頁: 目錄頁
    tableOfContents: {
      sections: [
        { title: "公司簡介", page: 3 },
        { title: "ESG永續目標", page: 4 },
        { title: "永續項目", page: 5 },
        { title: "永續項目執行結果", page: 6 }
      ]
    },
    
    // 第3頁: 公司簡介頁
    companyProfile: {
      description: `${companyName}成立於2005年，是台灣領先的永續能源解決方案提供商。我們專注於開發創新環保技術，提供企業全方位的ESG諮詢服務及綠色能源解決方案。憑藉堅實的技術基礎與專業團隊，我們協助客戶實現永續經營目標，為環境與社會創造長遠價值。`,
      foundedYear: 2005,
      employeeCount: Math.round(350 * socialFactor),
      headquarters: "台北市內湖區堤頂大道二段93號",
      industry: "永續能源與環保科技",
      mission: "透過創新科技促進永續發展，打造更美好的未來。",
      vision: "成為亞太地區最受信賴的永續解決方案領導品牌。",
      coreValues: [
        "創新卓越",
        "永續思維",
        "誠信透明",
        "社會責任",
        "跨界合作"
      ],
      keyFinancials: {
        revenue: Math.round(380000 * (energyFactor + renewableFactor) / 2), // 萬元
        profit: Math.round(42000 * (energyFactor + renewableFactor) / 2), // 萬元
        year: today.getFullYear() - 1
      }
    },
    
    // 第4頁: ESG永續目標頁
    sustainabilityGoals: {
      overview: `${companyName}訂定明確的ESG永續發展目標，以實際行動響應聯合國永續發展目標(SDGs)。我們從環境保護、社會責任與公司治理三大面向著手，設定具體可衡量的短中長期目標，並定期追蹤與揭露進度。`,
      environmentalGoals: [
        {
          title: "碳中和營運",
          description: "實現營運據點100%碳中和，減少直接與間接碳排放。",
          targetYear: today.getFullYear() + 5,
          currentProgress: Math.round(35 * carbonFactor)
        },
        {
          title: "綠電使用率提升",
          description: `逐步提高再生能源使用比例，${Math.min(Math.round(50 * renewableFactor), 100)}%以上電力來自再生能源。`,
          targetYear: today.getFullYear() + 3,
          currentProgress: renewablePercentage
        },
        {
          title: "零廢棄物目標",
          description: "廢棄物100%分類回收或再利用，實現零廢棄物排放。",
          targetYear: today.getFullYear() + 4,
          currentProgress: Math.round(60 * energyFactor)
        }
      ],
      socialGoals: [
        {
          title: "多元共融職場",
          description: "建立多元共融的工作環境，消除各種形式的歧視，提高女性主管比例。",
          targetYear: today.getFullYear() + 2,
          currentProgress: Math.round(65 * socialFactor)
        },
        {
          title: "永續供應鏈",
          description: "100%供應商符合永續採購標準，建立負責任的供應鏈。",
          targetYear: today.getFullYear() + 3,
          currentProgress: Math.round(45 * socialFactor)
        },
        {
          title: "社區賦能計畫",
          description: "每年投入營收1%於社區發展計畫，促進地方經濟與教育發展。",
          targetYear: today.getFullYear() + 2,
          currentProgress: Math.round(70 * socialFactor)
        }
      ],
      governanceGoals: [
        {
          title: "ESG績效與薪酬連結",
          description: "將高階主管薪酬與ESG績效連結，強化永續治理。",
          targetYear: today.getFullYear() + 1,
          currentProgress: Math.round(80 * governanceFactor)
        },
        {
          title: "氣候相關財務揭露",
          description: "依照TCFD建議完整揭露氣候相關風險與機會。",
          targetYear: today.getFullYear() + 2,
          currentProgress: Math.round(55 * governanceFactor)
        },
        {
          title: "道德經營承諾",
          description: "100%員工完成誠信經營與反貪腐培訓，強化企業倫理。",
          targetYear: today.getFullYear() + 1,
          currentProgress: Math.round(85 * governanceFactor)
        }
      ],
      sdgContributions: [7, 8, 9, 11, 12, 13]
    },
    
    // 第5頁: 永續項目頁
    // sustainabilityProjects: {
    //   overview: `${companyName}積極推動多項永續發展專案，涵蓋環境保護、社會參與及公司治理三大面向。這些專案由專責的ESG委員會監督，並定期評估成效，確保與公司整體永續策略一致。`,
    //   projects: [
    //     {
    //       name: "陽光綠能計畫",
    //       category: "environmental",
    //       description: "在公司總部及各廠區屋頂安裝太陽能板，提高再生能源使用比例。目前已完成總部與三座廠區的安裝，每年可產生約180萬度綠電。",
    //       startDate: subMonths(today, 18),
    //       status: "completed",
    //       keyMetrics: {
    //         investmentAmount: Math.round(1200 * renewableFactor),
    //         estimatedImpact: "每年減少約900噸碳排放"
    //       }
    //     },
    //     {
    //       name: "循環經濟示範廠",
    //       category: "environmental",
    //       description: "將生產過程中產生的廢棄物轉化為可用資源，實現資源循環利用。目前廢棄物回收率已達75%以上。",
    //       startDate: subMonths(today, 10),
    //       status: "in-progress",
    //       keyMetrics: {
    //         investmentAmount: Math.round(850 * energyFactor),
    //         estimatedImpact: "廢棄物處理成本降低35%，資源再利用率提升40%"
    //       }
    //     },
    //     {
    //       name: "數位轉型減碳計畫",
    //       category: "environmental",
    //       description: "導入智能能源管理系統，優化生產流程，減少能源消耗與碳排放。",
    //       startDate: subMonths(today, 6),
    //       status: "in-progress",
    //       keyMetrics: {
    //         investmentAmount: Math.round(750 * carbonFactor),
    //         estimatedImpact: "能源效率提升18%，減少碳排放約15%"
    //       }
    //     },
    //     {
    //       name: "永續人才培育計畫",
    //       category: "social",
    //       description: "為員工提供ESG相關培訓課程，提升永續意識與專業能力。每位員工每年至少接受16小時相關培訓。",
    //       startDate: subMonths(today, 12),
    //       status: "completed",
    //       keyMetrics: {
    //         investmentAmount: Math.round(320 * socialFactor),
    //         estimatedImpact: "員工永續知識評分提升25%，創新提案增加30%"
    //       }
    //     },
    //     {
    //       name: "綠色供應鏈管理",
    //       category: "governance",
    //       description: "要求供應商符合ESG標準，並提供輔導與資源，協助供應商提升永續表現。",
    //       startDate: subMonths(today, 15),
    //       status: "in-progress",
    //       keyMetrics: {
    //         investmentAmount: Math.round(480 * governanceFactor),
    //         estimatedImpact: "65%的供應商已達成永續採購標準"
    //       }
    //     }
    //   ]
    // },
    
    // 第6頁: 永續項目執行結果頁
    // projectResults: {
    //   overview: `過去一年，${companyName}在永續發展領域取得顯著進展。我們不僅達成多項環境目標，也在社會參與及公司治理方面有所突破。以下是我們的主要成果與績效指標。`,
    //   environmentalMetrics: {
    //     : Math.round(680 * carbonFactor), // 碳減排量 (噸)
    //     energySaved: Math.round(720000 * energyFactor), // 節約能源 (度)
    //     renewablePercentage: renewablePercentage, // 再生能源比例 (%)
    //     wasteReduction: Math.round(45 * energyFactor), // 廢棄物減少 (噸)
    //     waterSaved: Math.round(3500 * energyFactor) // 節約用水 (立方米)
    //   },
    //   socialMetrics: {
    //     communityBeneficiaries: Math.round(2800 * socialFactor), // 社區受益人數
    //     employeeVolunteerHours: Math.round(1250 * socialFactor), // 員工志工時數
    //     diversityScore: Math.round(78 * socialFactor), // 多元化評分 (0-100)
    //     trainingHours: Math.round(32 * socialFactor) // 每位員工培訓時數
    //   },
    //   governanceMetrics: {
    //     transparencyScore: Math.round(85 * governanceFactor), // 透明度評分 (0-100)
    //     ethicsTraining: Math.round(96 * governanceFactor), // 道德培訓完成率 (%)
    //     riskAssessment: Math.round(82 * governanceFactor) // 風險評估完整性 (0-100)
    //   },
    //   yearOnYearComparison: {
    //     categories: ["碳排放量", "能源使用", "廢棄物產生", "用水量", "永續投資"],
    //     previousYearData: [100, 100, 100, 100, 100], // 基準值 (去年=100%)
    //     currentYearData: [
    //       Math.round(100 - 15 * carbonFactor), // 碳排放減少
    //       Math.round(100 - 12 * energyFactor), // 能源使用減少
    //       Math.round(100 - 8 * energyFactor),  // 廢棄物減少
    //       Math.round(100 - 10 * energyFactor), // 用水減少
    //       Math.round(100 + 25 * (socialFactor + governanceFactor) / 2) // 永續投資增加
    //     ]
    //   },
    //   futureOutlook: [
    //     "加速碳中和進程，增加再生能源投資",
    //     "擴大循環經濟應用範圍，提高資源再利用率",
    //     "深化永續供應鏈管理，協助供應商提升ESG表現",
    //     "強化氣候變遷風險評估與調適能力",
    //     "推動更多元共融的工作環境與社會參與計畫"
    //   ]
    // }
  };
};

// 預設公司名稱範例
export const sampleCompanyNames = [
  "綠能科技股份有限公司",
  "台灣永續實業股份有限公司",
  "創新環保科技有限公司",
  "智慧能源系統股份有限公司",
  "永續未來科技股份有限公司"
]; 