"use client";

import { useState } from "react";
import { useCustomChat } from "@/hooks/use-custom-chat";
import { Chat } from "@/components/ui/chat";
import { cn } from "@/lib/utils";
import { transcribeAudio } from "@/lib/utils/audio";
import { TypingIndicator } from "@/components/ui/typing-indicator";
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

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    isLoading,
    setMessages,
  } = useCustomChat({
    chatMode,
    model: selectedModel,
    embeddingModel: selectedEmbeddingModel,
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

  return (
    <div className={cn("flex", "flex-col", "h-full", "w-full", className)}>
      <div className='flex justify-between mb-4'>
        <Tabs defaultValue='chat' onValueChange={handleChatModeChange}>
          <TabsList>
            <TabsTrigger value='chat'>一般聊天</TabsTrigger>
            <TabsTrigger value='rag'>文件智能查詢 (RAG)</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='flex gap-2'>
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='選擇模型' />
            </SelectTrigger>
            <SelectContent>
              {CHAT_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {chatMode === "rag" && (
            <Select
              value={selectedEmbeddingModel}
              onValueChange={handleEmbeddingModelChange}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='選擇嵌入模型' />
              </SelectTrigger>
              <SelectContent>
                {EMBEDDING_MODELS.map((model) => (
                  <SelectGroup key={model.name}>
                    <SelectLabel key={model.name}>{model.name}</SelectLabel>
                    {model.embedding.map((embedding) => (
                      <SelectItem
                        key={embedding.id}
                        value={embedding.id}
                        className='pl-4'
                      >
                        {embedding.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
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
