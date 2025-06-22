"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  MessageSquare,
  Trash2,
  Clock,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChatSession {
  id: string;
  lastUpdated: number;
  messageCount: number;
  lastMessage: string;
}

interface ChatSessionManagerProps {
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export function ChatSessionManager({
  currentSessionId,
  onSessionSelect,
  onNewSession,
}: ChatSessionManagerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // 載入會話列表
  const loadSessions = () => {
    try {
      const sessionsKey = 'chat_sessions';
      const stored = localStorage.getItem(sessionsKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessions(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.warn('載入會話列表失敗:', error);
      setSessions([]);
    }
  };

  useEffect(() => {
    loadSessions();
    
    // 監聽 localStorage 變化
    const handleStorageChange = () => {
      loadSessions();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 定期刷新（用於監測當前頁面的變化）
    const interval = setInterval(loadSessions, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 刪除會話
  const deleteSession = (sessionId: string) => {
    try {
      // 從 localStorage 刪除會話數據
      const key = `chat_history_${sessionId}`;
      localStorage.removeItem(key);
      
      // 從會話列表中移除
      const sessionsKey = 'chat_sessions';
      const existingSessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
      const updatedSessions = existingSessions.filter((s: any) => s.id !== sessionId);
      localStorage.setItem(sessionsKey, JSON.stringify(updatedSessions));
      
      // 更新本地狀態
      setSessions(updatedSessions);
      
      // 如果刪除的是當前會話，創建新會話
      if (sessionId === currentSessionId) {
        onNewSession();
      }
    } catch (error) {
      console.warn('刪除會話失敗:', error);
    }
  };

  // 篩選會話
  const filteredSessions = sessions.filter(session => 
    session.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 格式化時間
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60 * 1000) {
      return '剛剛';
    } else if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分鐘前`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小時前`;
    } else {
      return format(timestamp, 'MM/dd HH:mm', { locale: zhTW });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 px-2">
          <MessageSquare className="h-3 w-3 mr-1" />
          會話歷史
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            聊天會話管理
          </DialogTitle>
          <DialogDescription>
            管理你的聊天會話，或創建新的對話
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 搜尋和新增按鈕 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋會話..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                onNewSession();
                setIsOpen(false);
              }}
              size="icon"
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 會話列表 */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{searchTerm ? '沒有找到匹配的會話' : '還沒有聊天會話'}</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      session.id === currentSessionId ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      onSessionSelect(session.id);
                      setIsOpen(false);
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            會話 {session.id.slice(-8)}
                            {session.id === currentSessionId && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                當前
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(session.lastUpdated)}
                            <span>•</span>
                            <span>{session.messageCount} 則訊息</span>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs line-clamp-2">
                        {session.lastMessage || '無訊息內容'}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
} 