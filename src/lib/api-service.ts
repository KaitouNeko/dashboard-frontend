import { Files } from "@/types/api";
import { Message } from "@/components/ui/chat-message";
import axiosInstance from "@/app/api/axios";

// API 基礎 URL
// const API_BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || "https://www.pathofcommunity.com";
const API_BASE_URL = "https://www.pathofcommunity.com";

/**
 * 用於與後端API通信的服務
 */
export class ApiService {
  /**
   * 常規聊天API
   */
  static async chat(
    message: string,
    model: string = "gemini"
  ): Promise<string> {
    try {
      const response = await axiosInstance.post("/chat", {
        message,
        model,
      });

      return response.data.response;
    } catch (error: any) {
      console.error("聊天API錯誤:", error);
      throw new Error(error.response?.data?.error || "聊天請求失敗");
    }
  }

  /**
   * RAG (檢索增強生成) API
   */
  static async rag(
    message: string,
    model: string = "gemini",
    embeddingModel: string = "openai"
  ): Promise<string> {
    try {
      const response = await axiosInstance.post("/rag", {
        message,
        model,
        embedding_model: embeddingModel,
      });

      return response.data.response;
    } catch (error: any) {
      console.error("RAG API錯誤:", error);
      throw new Error(error.response?.data?.error || "RAG請求失敗");
    }
  }

  /**
   * Get vector file list
   */
  static async getDocuments(): Promise<any[]> {
    try {
      const response = await axiosInstance.get("/documents");
      return response.data;
    } catch (error: any) {
      console.error("獲取文檔API錯誤:", error);
      throw new Error(error.response?.data?.error || "獲取文檔失敗");
    }
  }

  /**
   * Del vector file
   */
  static async deleteDocument(id: string): Promise<void> {
    try {
      await axiosInstance.post("/documents/delete", { id });
    } catch (error: any) {
      console.error("刪除文檔API錯誤:", error);
      throw new Error(error.response?.data?.error || "刪除文檔失敗");
    }
  }

  /**
   * Create vector file
   */
  static async inertDocument(vectorText: string): Promise<void> {
    try {
      await axiosInstance.post("/documents/insert", {
        text: vectorText,
      });
    } catch (error: any) {
      console.error("新增文檔API錯誤:", error);
      throw new Error(error.response?.data?.error || "新增文檔失敗");
    }
  }

  /**
   * Process file to generate vectors
   */
  static async processFile(filename: string, model: string = "text-embedding-3-small"): Promise<any> {
    try {
      const response = await axiosInstance.post(`/process/${filename}?model=${model}`);
      return response.data;
    } catch (error: any) {
      console.error("處理文件API錯誤:", error);
      throw new Error(error.response?.data?.error || "處理文件失敗");
    }
  }

  /**
   * Insert processed document to Milvus
   */
  static async insertProcessedDocument(processResult?: any): Promise<void> {
    try {
      // 從處理結果中提取文本內容
      let textContent = '';
      
      if (processResult?.result?.content) {
        textContent = processResult.result.content;
      } else if (processResult?.result) {
        // 如果result是字符串類型
        textContent = typeof processResult.result === 'string' ? processResult.result : JSON.stringify(processResult.result);
      } else {
        // 備用：使用檔案名稱作為文本內容
        textContent = processResult?.fileName || '處理後的文檔內容';
      }

      console.log('要插入的文本內容:', textContent);

      await axiosInstance.post("/documents/insert", {
        text: textContent,
      });
    } catch (error: any) {
      console.error("插入向量資料庫API錯誤:", error);
      throw new Error(error.response?.data?.error || "插入向量資料庫失敗");
    }
  }

  /**
   * Upload file
   */
  static async uploadFile(files: File | FileList | File[]): Promise<any> {
    try {
      const formData = new FormData();

      if (files instanceof File) {
        // Single file upload
        formData.append("file", files);
      } else {
        // Multiple files upload
        const fileArray = files instanceof FileList ? Array.from(files) : files;
        fileArray.forEach((file) => {
          formData.append("file", file);
        });
      }

      const response = await axiosInstance.post("/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("上傳文檔API錯誤:", error);
      throw new Error(error.response?.data?.error || "上傳文檔失敗");
    }
  }

  /**
   * Get file list
   */
  static async getFileList(): Promise<Files> {
    try {
      const response = await axiosInstance.get("/list");
      return response.data;
    } catch (error: any) {
      console.error("獲取文檔API錯誤:", error);
      throw new Error(error.response?.data?.error || "獲取文檔失敗");
    }
  }

  /**
   * Del file
   */
  static async deleteFile(fileName: string): Promise<void> {
    try {
      await axiosInstance.delete(`/${fileName}`);
    } catch (error: any) {
      console.error("刪除文檔API錯誤:", error);
      throw new Error(error.response?.data?.error || "刪除文檔失敗");
    }
  }

  /**
   * view file
   */
  static async viewFile(fileName: string): Promise<void> {
    const url = `${axiosInstance.defaults.baseURL}/view/${fileName}`;
    window.open(url, "_blank");
  }

  /**
   * download file
   */
  static async downloadFile(fileName: string): Promise<void> {
    window.location.href = `${axiosInstance.defaults.baseURL}/download/${fileName}`;
  }

  /**
   * Get energy usage
   */
  static async getEnergyUsage(facility_id: string, min_temp: number, max_temp: number): Promise<{data: {
    id: string,
    facility_id: string,
    timestamp: string,
    energy_kwh: number,
    humidity_percent: number,
    temperature_celsius: number
  }[]}> {
    try {
      const response = await axiosInstance.get("/energy", {
        params: {
          facility_id,
          min_temp,
          max_temp,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("獲取能源使用情況API錯誤:", error);
      throw new Error(error.response?.data?.error || "獲取能源使用情況失敗");
    }
  }

  /**
   * Create energy usage
   */
  static async createEnergyUsage(facility_id: string, timestamp: string, energy_kwh: number, humidity_percent: number, temperature_celsius: number): Promise<any[]> {
    try {
      const response = await axiosInstance.post("/energy", {
        facility_id,
        timestamp,
        energy_kwh,
        humidity_percent,
        temperature_celsius,
      });
      return response.data;
    } catch (error: any) {
      console.error("新增能源使用情況API錯誤:", error);
      throw new Error(error.response?.data?.error || "新增能源使用情況失敗");
    }
  }

  /**
   * 使用LLM預測能源使用
   */
  static async predictEnergyUsageLLM(historicalData: any[], forecastHours: number, model: string = "gemini"): Promise<any[]> {
    try {
      // 準備LLM提示詞
      const prompt = `
根據以下數據中心的能源使用歷史數據，預測未來${forecastHours}小時的能源使用情況。

歷史數據如下 (按時間順序排列，最近的數據在最後):
${JSON.stringify(historicalData.slice(-48), null, 2)}

請分析這些數據，考慮時間模式、溫度影響及其他相關因素，並預測未來${forecastHours}小時的能源使用。
對於每個預測的時間點，請提供以下資訊:
1. timestamp (ISO格式日期時間，從最後一個歷史數據點往後每小時一筆)
2. energy_kwh (預測的能源使用量，單位為kWh)
3. temperature_celsius (預測的溫度，考慮到時間及歷史溫度變化趨勢)
4. humidity_percent (預測的濕度)
5. confidence_level (預測的置信度，0-1之間的數值)
6. is_prediction (設為true)
7. llm (是用哪一家LLM模型預測出來的結果，設為: "${model}")

請直接返回JSON格式的數組，不要有任何解釋或其他文字。格式如下:
[
  {
    "timestamp": "ISO日期時間",
    "energy_kwh": 數值,
    "temperature_celsius": 數值,
    "humidity_percent": 數值,
    "confidence_level": 數值,
    "is_prediction": true,
    "llm": "${model}"
  },
  ...
]
      `;
      
      // 調用RAG API
      const response = await this.chat(prompt, model);
      
      // 從回應中提取JSON陣列
      let jsonStr = response;
      // 尋找JSON陣列的開始和結束
      const startIndex = jsonStr.indexOf('[');
      const endIndex = jsonStr.lastIndexOf(']') + 1;
      
      if (startIndex >= 0 && endIndex > startIndex) {
        jsonStr = jsonStr.substring(startIndex, endIndex);
        
        try {
          // 解析JSON
          const predictions = JSON.parse(jsonStr);
          
          // 確保預測資料格式正確
          return predictions.map((item: any, index: number) => ({
            id: `llm-pred-${index}`,
            facility_id: historicalData.length > 0 ? historicalData[0].facility_id : "Building-A",
            timestamp: item.timestamp,
            energy_kwh: parseFloat(item.energy_kwh) || 0,
            temperature_celsius: parseFloat(item.temperature_celsius) || 0,
            humidity_percent: parseFloat(item.humidity_percent) || 0,
            is_prediction: true,
            confidence_level: parseFloat(item.confidence_level) || (0.95 - (index / forecastHours) * 0.2),
            llm: item.llm || model
          }));
        } catch (error) {
          console.error("解析LLM預測結果失敗:", error);
          throw new Error("LLM返回的結果無法解析為JSON");
        }
      } else {
        throw new Error("LLM返回的結果不包含有效的JSON陣列");
      }
    } catch (error) {
      console.error("LLM預測能源使用失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取LLM使用統計數據
   * 包括不同模型的令牌使用量、費用等統計信息
   */
  static async getLLMStats(
    startDate?: string,
    endDate?: string,
    models?: string[],
    useMock: boolean = false
  ): Promise<{
    models: {
      [key: string]: {
        total_tokens: number;
        prompt_tokens: number;
        completion_tokens: number;
        total_cost: number;
        requests: number;
        avg_tokens_per_request: number;
        usage_by_day: {
          date: string;
          total_tokens: number;
          cost: number;
        }[];
      };
    };
    total: {
      total_tokens: number;
      total_cost: number;
      total_requests: number;
    };
  }> {
    try {
      // 如果使用模擬數據，直接返回
      if (useMock) {
        return {
          models: {
            "openai": {
              total_tokens: 285621,
              prompt_tokens: 192487,
              completion_tokens: 93134,
              total_cost: 5.72,
              requests: 342,
              avg_tokens_per_request: 835,
              usage_by_day: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                total_tokens: 5000 + Math.floor(Math.random() * 5000),
                cost: 0.1 + Math.random() * 0.3
              }))
            },
            "gemini": {
              total_tokens: 412853,
              prompt_tokens: 278941,
              completion_tokens: 133912,
              total_cost: 2.06,
              requests: 487,
              avg_tokens_per_request: 847,
              usage_by_day: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                total_tokens: 6000 + Math.floor(Math.random() * 6000),
                cost: 0.05 + Math.random() * 0.1
              }))
            }
          },
          total: {
            total_tokens: 698474,
            total_cost: 7.78,
            total_requests: 829
          }
        };
      }
      
      // 準備查詢參數
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (models && models.length > 0) {
        params.model = models;
      }
      
      const response = await axiosInstance.get("/llm-stats", { params });
      return response.data;
    } catch (error: any) {
      console.error("獲取LLM統計數據API錯誤:", error);
      // 返回空數據結構
      return {
        models: {},
        total: {
          total_tokens: 0,
          total_cost: 0,
          total_requests: 0
        }
      };
    }
  }
}

// 轉換輸入訊息為API格式的方法
export function convertMessagesToApiFormat(messages: Message[]): string {
  // 只取最後一條用戶訊息
  const lastUserMessage = [...messages]
    .reverse()
    .find((msg) => msg.role === "user");
  return lastUserMessage?.content || "";
}

// 用於AI SDK的聊天API適配器
export const aiApiAdapter = {
  async generateText({
    model,
    messages,
  }: {
    model: string;
    messages: Message[];
  }): Promise<string> {
    const message = convertMessagesToApiFormat(messages);
    return ApiService.chat(message, model);
  },

  async generateRagText({
    model,
    messages,
    embeddingModel,
  }: {
    model: string;
    messages: Message[];
    embeddingModel: string;
  }): Promise<string> {
    const message = convertMessagesToApiFormat(messages);
    return ApiService.rag(message, model, embeddingModel);
  },
};
