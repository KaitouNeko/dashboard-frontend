import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ui/chat-message';

export type ChatMode = "chat" | "rag" | "esg";

interface UseCustomChatProps {
  initialMessages?: Message[];
  chatMode?: ChatMode;
  onError?: (error: Error) => void;
  model?: string;
  embeddingModel?: string;
  sessionId?: string;
}

// 短記憶管理工具函數
const ChatMemoryUtils = {
  // 生成新的 session ID
  generateSessionId: (): string => {
    return `chat_${Date.now()}_${uuidv4().slice(0, 8)}`;
  },

  // 從 localStorage 獲取對話歷史
  loadChatHistory: (sessionId: string): Message[] => {
    try {
      const key = `chat_history_${sessionId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 驗證數據格式
        if (Array.isArray(parsed) && parsed.every(msg => 
          msg.id && msg.role && msg.content !== undefined
        )) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('載入聊天歷史失敗:', error);
    }
    return [];
  },

  // 儲存對話歷史到 localStorage
  saveChatHistory: (sessionId: string, messages: Message[]): void => {
    try {
      const key = `chat_history_${sessionId}`;
      // 只儲存最近50條訊息，避免 localStorage 過載
      const messagesToSave = messages.slice(-50);
      localStorage.setItem(key, JSON.stringify(messagesToSave));
      
      // 更新 session 列表
      const sessionsKey = 'chat_sessions';
      const existingSessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
      const sessionInfo = {
        id: sessionId,
        lastUpdated: Date.now(),
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]?.content.slice(0, 50) || ''
      };
      
      const updatedSessions = existingSessions.filter((s: any) => s.id !== sessionId);
      updatedSessions.unshift(sessionInfo);
      
      // 只保留最近 20 個 session
      localStorage.setItem(sessionsKey, JSON.stringify(updatedSessions.slice(0, 20)));
    } catch (error) {
      console.warn('儲存聊天歷史失敗:', error);
    }
  },

  // 清除指定 session 的歷史
  clearChatHistory: (sessionId: string): void => {
    try {
      const key = `chat_history_${sessionId}`;
      localStorage.removeItem(key);
      
      // 從 session 列表中移除
      const sessionsKey = 'chat_sessions';
      const existingSessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
      const updatedSessions = existingSessions.filter((s: any) => s.id !== sessionId);
      localStorage.setItem(sessionsKey, JSON.stringify(updatedSessions));
    } catch (error) {
      console.warn('清除聊天歷史失敗:', error);
    }
  },

  // 獲取所有 session 列表
  getAllSessions: () => {
    try {
      const sessionsKey = 'chat_sessions';
      return JSON.parse(localStorage.getItem(sessionsKey) || '[]');
    } catch (error) {
      console.warn('獲取 session 列表失敗:', error);
      return [];
    }
  }
};

export function useCustomChat({
  initialMessages = [],
  chatMode = 'chat',
  onError,
  model = 'gemini',
  embeddingModel = 'openai',
  sessionId: providedSessionId
}: UseCustomChatProps = {}) {
  // 初始化 sessionId
  const [sessionId] = useState<string>(() => {
    return providedSessionId || ChatMemoryUtils.generateSessionId();
  });

  // 初始化 messages，優先使用 localStorage 中的歷史
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialMessages.length > 0) {
      return initialMessages;
    }
    
    // 從 localStorage 載入對話歷史
    const savedMessages = ChatMemoryUtils.loadChatHistory(sessionId);
    return savedMessages.length > 0 ? savedMessages : [];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // 當 messages 變更時自動儲存到 localStorage
  useEffect(() => {
    if (messages.length > 0) {
      ChatMemoryUtils.saveChatHistory(sessionId, messages);
    }
  }, [messages, sessionId]);

  // 處理用戶輸入變更
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  // 停止生成
  const stop = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  }, [abortController]);

  // 添加新消息到聊天記錄
  const appendMessage = useCallback((role: 'user' | 'assistant' | 'system', content: string) => {
    const id = uuidv4();
    const message: Message = { id, role, content, createdAt: new Date() };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  // 清除當前 session 的對話歷史
  const clearChatHistory = useCallback(() => {
    setMessages([]);
    ChatMemoryUtils.clearChatHistory(sessionId);
  }, [sessionId]);

  // 獲取API端點
  const getApiEndpoint = useCallback(() => {
    if (chatMode === 'rag') return '/api/rag';
    if (chatMode === 'esg') return '/api/chat'; // ESG模式也使用一般聊天API
    return '/api/chat';
  }, [chatMode]);

  // 模擬ESG報告生成功能
  const generateESGReportSample = useCallback((messages: Message[], prompt: string): string => {
    // 從聊天上下文中提取公司名稱，如果沒有則使用默認值
    let companyName = "綠能科技股份有限公司";
    
    // 尋找內容中包含公司名稱的信息
    for (const message of messages) {
      if (message.role === 'user') {
        const content = message.content;
        const companyMatch = content.match(/公司名稱[是為：:為]\s*「?([^」\n]+)」?/);
        if (companyMatch) {
          companyName = companyMatch[1].trim();
          break;
        }
      }
    }
    
    // 生成ESG報告樣本
    return `# ${companyName} ESG永續發展報告

## 執行摘要

${companyName}致力於實現永續發展，並將環境、社會和治理(ESG)原則融入公司營運的各個方面。本報告詳細說明了我們的ESG策略、措施和表現，展示我們對創造長期價值和正面影響的承諾。

### 主要成就

- 完成ESG風險評估和管理框架升級
- 將再生能源使用比例提高至38%，較去年增加8個百分點
- 全公司範圍內實施零廢棄物計劃，減少60%廢棄物送往掩埋場
- 員工培訓時數增加32%，提升職場多元化和包容性
- 獲得多項永續發展認證和獎項

## 環境績效

### 能源使用與碳排放

我們持續改善能源效率，增加再生能源使用以減少碳足跡。通過一系列節能措施和可再生能源轉型，2023年碳排放較去年減少15.3%。

#### 能源使用數據
- 總能源消耗：1,250,000 kWh
- 再生能源佔比：38%
- 年度節能率：12.5%

### 水資源管理

實施全面的水資源管理計劃，包括雨水收集系統、廢水回收利用和提高用水效率的措施。

- 總用水量：38,500 立方米（較去年減少8.2%）
- 水資源回收率：45%

### 廢棄物管理

通過優化生產流程、資源回收和廢棄物轉化計劃，大幅減少廢棄物產生。

- 總廢棄物：560 噸
- 廢棄物回收率：72%
- 掩埋廢棄物減少：60%

## 社會責任

### 員工福祉

重視員工發展、多元化與包容性，提供安全、公平和充滿活力的工作環境。

- 員工平均培訓時數：32小時/年
- 職業安全事故：較去年減少40%
- 員工滿意度：88%

### 社區參與

積極支持當地社區發展，鼓勵員工參與志願服務，建立長期合作夥伴關係。

- 志願服務總時數：2,500小時
- 捐款金額：3,800,000元
- 支持社區項目：12個

## 公司治理

### ESG治理

我們設立了專門的**永續發展委員會**，由CEO擔任主席，直接向董事會報告。委員會負責監督ESG策略的制定和實施，確保將永續發展融入業務決策。

- 董事會多元化：72分（行業平均：65分）
- 道德培訓完成率：98%
- 資訊透明度評分：88分

### 風險管理

建立全面的風險評估和管理系統，特別關注氣候變化和ESG相關風險的識別與應對。

## 聯合國永續發展目標(SDGs)貢獻

我們的業務和永續發展行動與以下SDGs密切相關：

- SDG 7（可負擔潔淨能源）：增加再生能源使用，提高能源效率
- SDG 8（體面工作和經濟增長）：提供公平就業機會和促進本地經濟
- SDG 9（工業創新與基礎設施）：投資綠色技術研發
- SDG 12（負責任消費和生產）：優化資源使用，減少廢棄物
- SDG 13（氣候行動）：減少溫室氣體排放，適應氣候變化

## 未來目標與承諾

我們設定了以下2025年永續發展目標：

- 實現碳排放較2020年基準減少25%
- 將再生能源使用率提高至50%
- 實現零廢棄物送往掩埋場
- 建立更全面的供應商ESG評估體系
- 擴大社區參與計畫，關注弱勢群體教育與就業機會
- 加強ESG風險管理，將氣候風險完全整合到企業風險管理框架
- 提高ESG資訊揭露透明度，符合ISSB準則
- 深化董事會對ESG議題的參與

我們將繼續透過創新、合作和決心，為建設更永續的未來做出貢獻。`;
  }, []);

  // 提交聊天
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // 不處理空輸入
    if (!input.trim()) return;
    
    // 添加用戶訊息
    appendMessage('user', input);
    setInput('');
    setIsLoading(true);
    
    // ESG報告生成模式的特殊處理
    if (chatMode === 'esg') {
      // ESG報告生成模式的特殊處理
      if (input.includes('生成完整的ESG報告')) {
        try {
          const sampleReport = generateESGReportSample(messages, input);
          setTimeout(() => {
            appendMessage('assistant', sampleReport);
            setIsLoading(false);
          }, 2000); // 模擬生成時間
          return;
        } catch (error) {
          console.error('生成ESG報告錯誤:', error);
          if (onError) onError(error as Error);
        }
      } else if (input.includes('上傳文件') || input.includes('檔案')) {
        // 模擬文件上傳響應
        setTimeout(() => {
          const response = `非常感謝您上傳文件！我將根據這些文件內容為您提供更準確的ESG報告建議。

讓我們繼續討論貴公司的ESG實踐。您能分享一些關於公司環境政策或社會責任措施的資訊嗎？例如：
- 公司在減少碳排放方面有哪些具體措施?
- 員工多元化和包容性的現狀如何?
- 公司治理結構中是否有ESG相關委員會或職位?`;
          appendMessage('assistant', response);
          setIsLoading(false);
        }, 1000);
        return;
      }
    }
    
    // 創建一個新的 AbortController 實例
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const endpoint = getApiEndpoint();
      
      // 準備請求體 - 新增 sessionId
      const requestBody = {
        messages: [...messages, { role: 'user', content: input }],
        model,
        sessionId, // 傳送 sessionId 給後端
        ...(chatMode === 'rag' && { embedding_model: embeddingModel }),
      };
      
      // 發送請求
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `請求失敗 (${response.status})`);
      }
      
      const data = await response.json();
      
      // 添加助手響應
      appendMessage('assistant', data.response);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('請求已取消');
        return;
      }
      
      console.error('聊天錯誤:', err);
      const errorMessage = (err as Error).message || '發生未知錯誤';
      appendMessage('assistant', `抱歉，發生了錯誤：${errorMessage}`);
      
      if (onError) {
        onError(err as Error);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [input, messages, chatMode, model, embeddingModel, sessionId, appendMessage, getApiEndpoint, generateESGReportSample, onError]);

  // 直接添加一條消息並獲得回應 (用於提示建議)
  const append = useCallback(async (userMessage: { role: 'user' | 'system' | 'assistant'; content: string }) => {
    if (isLoading && userMessage.role === 'user') return;
    
    // 添加用戶訊息
    const newMessage = appendMessage(userMessage.role, userMessage.content);
    
    // 如果不是用戶訊息，則不需要獲取回應
    if (userMessage.role !== 'user') return;
    
    setIsLoading(true);
    
    // ESG報告生成模式的特殊處理
    if (chatMode === 'esg') {
      // ESG報告生成模式的特殊處理
      if (userMessage.content.includes('生成完整的ESG報告')) {
        try {
          const sampleReport = generateESGReportSample(messages, userMessage.content);
          setTimeout(() => {
            const assistantMessage = appendMessage('assistant', sampleReport);
            setIsLoading(false);
            // 觸發報告內容更新
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('esg-report-generated', {
                detail: { content: sampleReport }
              }));
            }
          }, 2000); // 模擬生成時間
          return;
        } catch (error) {
          console.error('生成ESG報告錯誤:', error);
          if (onError) onError(error as Error);
        }
      }
    }
    
    // 創建一個新的 AbortController 實例
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const endpoint = getApiEndpoint();
      
      // 準備請求體 - 新增 sessionId
      const requestBody = {
        messages: [...messages, userMessage],
        model,
        sessionId, // 傳送 sessionId 給後端
        ...(chatMode === 'rag' && { embedding_model: embeddingModel }),
      };
      
      // 發送請求
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `請求失敗 (${response.status})`);
      }
      
      const data = await response.json();
      
      // 添加助手響應
      const assistantMessage = appendMessage('assistant', data.response);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('請求已取消');
        return;
      }
      
      console.error('追加消息錯誤:', err);
      const errorMessage = (err as Error).message || '發生未知錯誤';
      appendMessage('assistant', `抱歉，發生了錯誤：${errorMessage}`);
      
      if (onError) {
        onError(err as Error);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [isLoading, appendMessage, chatMode, generateESGReportSample, messages, onError, getApiEndpoint, model, sessionId, embeddingModel]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    append,
    setMessages,
    clearChatHistory,
    sessionId
  };
} 