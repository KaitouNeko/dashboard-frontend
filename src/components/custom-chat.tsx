"use client";

import { useState, useCallback } from "react";
import { useCustomChat } from "@/hooks/use-custom-chat";
import { Chat } from "@/components/ui/chat";
import { cn } from "@/lib/utils";
import { transcribeAudio } from "@/lib/utils/audio";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatSessionManager } from "@/components/chat-session-manager";

const CHAT_MODELS = [
  { id: "gemini", name: "Google Gemini" },
  { id: "openai", name: "OpenAI GPT-4" },
];

const EMBEDDING_MODELS = [
  {
    name: "OpenAI",
    embedding: [
      { id: "openai-ada-002", name: "OpenAI Ada-002 (默認)" },
      { id: "openai-3-small", name: "OpenAI Embedding-3-Small" },
      { id: "openai-3-large", name: "OpenAI Embedding-3-Large" },
    ],
  },
  {
    name: "Google",
    embedding: [{ id: "gemini-embedding", name: "Gemini Embedding-001" }],
  },
];

type CustomChatProps = {
  className?: string;
};

export function CustomChat({ className }: CustomChatProps) {
  const [chatMode, setChatMode] = useState<"chat" | "rag">("chat");
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS[0].id);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState(
    EMBEDDING_MODELS[0].embedding[0].id
  );
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    isLoading,
    setMessages,
    clearChatHistory,
    sessionId,
  } = useCustomChat({
    chatMode,
    model: selectedModel,
    embeddingModel: selectedEmbeddingModel,
    sessionId: currentSessionId,
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

  const handleEmbeddingModelChange = (value: string) => {
    setSelectedEmbeddingModel(value);
  };

  const handleChatModeChange = (value: string) => {
    setChatMode(value as "chat" | "rag");
  };

  // 清除對話並重新開始
  const handleClearChat = () => {
    clearChatHistory();
  };

  // 創建新會話
  const handleNewSession = useCallback(() => {
    setCurrentSessionId(undefined); // 讓 hook 生成新的 sessionId
    // 強制重新渲染以清空對話
    window.location.reload();
  }, []);

  // 選擇會話
  const handleSessionSelect = useCallback((selectedSessionId: string) => {
    if (selectedSessionId !== sessionId) {
      setCurrentSessionId(selectedSessionId);
      // 重新載入頁面以載入選中的會話
      window.location.reload();
    }
  }, [sessionId]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* 控制面板 */}
      <div className="mb-4 space-y-4 rounded-lg border bg-muted/50 p-4">
        {/* Session 資訊和操作 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Session ID:</span>
            <code className="rounded bg-background px-2 py-1 text-xs font-mono">
              {sessionId.slice(-8)}...
            </code>
          </div>
          <div className="flex gap-2">
            <ChatSessionManager
              currentSessionId={sessionId}
              onSessionSelect={handleSessionSelect}
              onNewSession={handleNewSession}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNewSession}
                    className="h-8 px-2"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>開始新對話</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearChat}
                    disabled={isLoading || messages.length === 0}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>清除當前對話</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* 聊天模式選擇 */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">聊天模式:</span>
          <Tabs value={chatMode} onValueChange={handleChatModeChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">一般聊天</TabsTrigger>
              <TabsTrigger value="rag">文件問答 (RAG)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 模型選擇 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">語言模型:</label>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="選擇語言模型" />
              </SelectTrigger>
              <SelectContent>
                {CHAT_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {chatMode === "rag" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">嵌入模型:</label>
              <Select
                value={selectedEmbeddingModel}
                onValueChange={handleEmbeddingModelChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇嵌入模型" />
                </SelectTrigger>
                <SelectContent>
                  {EMBEDDING_MODELS.map((provider) => (
                    <SelectGroup key={provider.name}>
                      <SelectLabel>{provider.name}</SelectLabel>
                      {provider.embedding.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* 訊息統計 */}
        {messages.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>對話輪數: {Math.ceil(messages.length / 2)}</span>
            <span>總訊息: {messages.length}</span>
            <span>模式: {chatMode === "chat" ? "一般聊天" : "RAG 問答"}</span>
            <span className="text-green-600">✓ 短記憶已啟用</span>
          </div>
        )}
      </div>

      <Chat
        className='grow'
        messages={messages as any}
        handleSubmit={handleSubmit as any}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        setMessages={setMessages}
        transcribeAudio={transcribeAudio}
        typingIndicator={isLoading ? <TypingIndicator /> : null}
        userAvatarSrc={
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAA5FBMVEX////3+Pju7++fpqhbam4kPkUUMzr09PV5hIcQMzsYNz4/U1nS1daIkpQnOT4tOTw7V19HdYJOhJNRjJzf4eJKXGFreHw3S1ExQERCbHdctcxq3/566v955/924f4+XGUnQUh98P9bvdeP7v+78v+S5v6n6/9m0e5z2fVbqsB45f/U9//h8/nr+v/Ex8gjVWLF8f+0ubtaorYAAAA7OThLSknJwsCdlZMaBgDb/v8cMzlZn7J5eHhnYF5xuc5SVlfOm4WHX04cHBydr7TKhmjJjXKTucRtiZC2qqXSu7KZz9/H1NgwLrv1AAABMElEQVR4AVTMVWLDQBADUBkbZl7HzBBmZrj/hbp20e9zRhJSGIZBGsMCYDleEBMCzyWHD1CZbC5fKIqlcqVaq9dr1Uq5JBYbzVy2BXBCu9IRyt0ekfoJSe51y0JH6ahFNLuS1mvrhmlaRKaIZVuSrjia226D9/Sq6wegwvgbAYh8qdeVq00Mho7kjpAICIl/FJElRxwD4/bEB1WYzhjZBsDMpwvTr5c4UKWqAWo2nS6NeIKbTlfrfrUEit1s+6B20+nCMJOJ6T7wtxsWQGMz8SNQ4wF6B8TfMSx/sml8Py0kjtPpDrER+feU5QBgT+fL5XwKo9AmcupJCLne7tTtQYgsp5+U/ny936+nI8f8bfrpkwAIPicthyEJAV7e3l5yuCTl1NXlsEjCwYiTNCIkCQCKFFS1ilhgAwAAAABJRU5ErkJggg=="
        }
        suggestions={[
          "你好，今天天氣如何？",
          "解釋下雲原生架構的優點",
          "數據庫優化有哪些常見方法？",
        ]}
      />
    </div>
  );
}

export default CustomChat;
