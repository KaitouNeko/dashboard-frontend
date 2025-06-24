'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api-service';
import { cn } from '@/lib/utils';
import { Upload, File, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconRefresh } from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

type Document = {
  id: string;
  text: string;
  metadata?: Record<string, any>;
};

type EmbeddingDocumentManagementProps = {
  className: string;
};

export default function EmbeddingDocumentManagement({ className }: any) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isInsertSheetOpen, setIsInsertSheetOpen] = useState(false);
  const [vectorId, setVectorId] = useState('');
  const [vectorText, setVectorText] = useState('');

  // load vector list
  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await ApiService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('加載文檔錯誤:', error);
      
      // 檢查是否是集合不存在的錯誤
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      if (errorMessage.includes('collection') || 
          errorMessage.includes('集合') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('不存在')) {
        toast.error('向量資料庫集合不存在', {
          description: '請聯繫管理員初始化向量資料庫，或者嘗試插入第一筆資料來自動創建集合',
          duration: 5000,
        });
        // 設置空文檔列表
        setDocuments([]);
      } else {
        toast.error('無法加載文檔', {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加載
  useEffect(() => {
    loadDocuments();
  }, []);

  // 處理文件選擇
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 處理文檔刪除
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await ApiService.deleteDocument(id);
      toast.success('文檔刪除成功');
      // 更新本地文檔列表
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error('刪除文檔錯誤:', error);
      toast.error('刪除文檔失敗', {
        description: error instanceof Error ? error.message : '未知錯誤',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 處理文件上傳和向量化
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('請先選擇文件');
      return;
    }

    try {
      setIsLoading(true);
      
      // 步驟 1: 上傳文件
      toast.info('正在上傳文件...');
      const uploadResult = await ApiService.uploadFile(selectedFile);
      console.log('上傳結果:', uploadResult);
      
      // 從上傳結果中獲取實際的檔案名稱
      let actualFileName = selectedFile.name;
      if (uploadResult && uploadResult.file && uploadResult.file.fileName) {
        actualFileName = uploadResult.file.fileName;
      } else if (uploadResult && uploadResult.fileName) {
        actualFileName = uploadResult.fileName;
      } else if (uploadResult && uploadResult.filename) {
        actualFileName = uploadResult.filename;
      } else if (uploadResult && uploadResult.file) {
        actualFileName = uploadResult.file;
      } else if (uploadResult && uploadResult.name) {
        actualFileName = uploadResult.name;
      }
      
      console.log('原始檔案名稱:', selectedFile.name);
      console.log('實際檔案名稱:', actualFileName);
      console.log('上傳結果完整內容:', JSON.stringify(uploadResult, null, 2));
      
      // 步驟 2: 處理文件生成向量
      toast.info(`正在處理文件 "${actualFileName}" 並生成向量...`);
      const processResult = await ApiService.processFile(actualFileName, 'text-embedding-3-small');
      console.log('處理結果:', processResult);
      
      // 步驟 3: 將處理結果插入 Milvus（可能會自動創建集合）
      toast.info('正在插入向量資料庫...');
      await ApiService.insertProcessedDocument(processResult);
      
      toast.success('文件上傳並向量化完成！集合已自動初始化');
      
      // 重新載入文檔列表
      await loadDocuments();
      
      // 重置文件選擇
      setSelectedFile(null);
      // 重置 input 元素
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      console.error('文件上傳處理錯誤:', error);
      
      // 更詳細的錯誤信息
      let errorMessage = '未知錯誤';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error('文件處理失敗', {
        description: `錯誤詳情: ${errorMessage}`,
        duration: 8000, // 延長顯示時間以便查看錯誤
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = async () => {
    if (!vectorText.trim()) {
      toast.error('請填寫向量文本');
      return;
    }

    try {
      setIsLoading(true);
      
      await ApiService.inertDocument(vectorText);
      toast.success('文檔插入成功！如果是第一次插入，集合已自動初始化');
      
      // 更新本地文檔列表
      await loadDocuments();
      // 重置表單並關閉 Sheet
      setVectorId('');
      setVectorText('');
      setIsInsertSheetOpen(false);
    } catch (error) {
      console.error('插入文檔錯誤:', error);
      toast.error('插入文檔失敗', {
        description: error instanceof Error ? error.message : '未知錯誤',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>RAG Vector DB</CardTitle>
        <CardDescription>RAG向量資料管理</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              onChange={handleFileChange}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile || isLoading}
              className="flex gap-2 items-center"
            >
              <Upload className="h-4 w-4" />
              上傳
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">向量文檔列表</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInsertSheetOpen(true)}
              className="flex gap-1 items-center"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              新增向量文本
            </Button>
          </div>

          {isLoading ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              加載中...
            </div>
          ) : documents.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="text-sm text-muted-foreground">
                暫無文檔資料
              </div>
              <div className="text-xs text-muted-foreground max-w-md mx-auto">
                如果這是首次使用，向量資料庫集合可能尚未初始化。
                <br />
                請嘗試上傳檔案或新增向量文本來自動創建集合。
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInsertSheetOpen(true)}
                  className="flex gap-1 items-center"
                >
                  <Plus className="h-4 w-4" />
                  新增第一筆向量文本
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        ID: {doc.id}
                      </span>
                      <span className="text-sm truncate max-w-[300px]">
                        {doc.text.substring(0, 50)}
                        {doc.text.length > 50 ? '...' : ''}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 新增向量文本的 Sheet */}
        <Sheet open={isInsertSheetOpen} onOpenChange={setIsInsertSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>新增向量文本</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4 px-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">向量文本</h4>
                <Textarea
                  id="vectorText"
                  placeholder="請輸入向量文本內容"
                  value={vectorText}
                  onChange={(e) => setVectorText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" disabled={isLoading}>
                  取消
                </Button>
              </SheetClose>
              <Button onClick={handleInsert} disabled={isLoading}>
                {isLoading ? '處理中...' : '確認新增'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={loadDocuments} disabled={isLoading}>
          <IconRefresh />
        </Button>
      </CardFooter>
    </Card>
  );
}
