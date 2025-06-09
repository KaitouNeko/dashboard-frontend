"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api-service";
import { cn } from "@/lib/utils";
import {
  Upload,
  File,
  Trash2,
  SquareChartGantt,
  CloudDownload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Files } from "@/types/api";

type DocumentManagerProps = {
  className?: string;
};

export function DocumentManager({ className }: DocumentManagerProps) {
  const [list, setList] = useState<Files>({
    files: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 加載文檔列表
  const loadList = async () => {
    try {
      setIsLoading(true);
      const docs = await ApiService.getFileList();
      setList(docs);
    } catch (error) {
      console.error("加載文檔錯誤:", error);
      toast.error("無法加載文檔", {
        description: error instanceof Error ? error.message : "未知錯誤",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加載
  useEffect(() => {
    loadList();
  }, []);

  // 處理文件選擇
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 處理文件上傳
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning("請先選擇要上傳的文件");
      return;
    }

    try {
      setIsLoading(true);
      await ApiService.uploadFile(selectedFile);
      toast.success("文件上傳成功");
      setSelectedFile(null);
      // 重新加載文檔列表
      await loadList();
    } catch (error) {
      console.error("上傳文件錯誤:", error);
      toast.error("上傳文件失敗", {
        description: error instanceof Error ? error.message : "未知錯誤",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 處理文檔刪除
  const handleDelete = async (fileName: string) => {
    try {
      setIsLoading(true);
      await ApiService.deleteFile(fileName);
      toast.success("文檔刪除成功");
      // 更新本地文檔列表
      setList((prevDocs) => ({
        files: prevDocs.files.filter((doc) => doc.fileName !== fileName),
      }));
    } catch (error) {
      console.error("刪除文檔錯誤:", error);
      toast.error("刪除文檔失敗", {
        description: error instanceof Error ? error.message : "未知錯誤",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (fileName: string) => {
    await ApiService.viewFile(fileName);
  };

  const handleDownload = async (fileName: string) => {
    await ApiService.downloadFile(fileName);
  };

  console.log("list", list);
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>文檔管理</CardTitle>
        <CardDescription>上傳和管理檔案</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Input
              type='file'
              onChange={handleFileChange}
              disabled={isLoading}
              className='flex-1'
              multiple
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className='flex gap-2 items-center'
            >
              <Upload className='h-4 w-4' />
              上傳
            </Button>
          </div>

          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>已上傳文檔</h3>
            {isLoading ? (
              <div className='py-4 text-center text-sm text-muted-foreground'>
                加載中...
              </div>
            ) : list.files.length === 0 ? (
              <div className='py-4 text-center text-sm text-muted-foreground'>
                暫無文檔，請上傳
              </div>
            ) : (
              <div className='space-y-2'>
                {list.files.map((doc) => (
                  <div
                    key={doc.uploadTime}
                    className='flex justify-between items-center p-2 border rounded'
                  >
                    <div className='flex items-center gap-2'>
                      <File className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm truncate max-w-[300px]'>
                        {doc.fileName.substring(0, 50)}
                        {doc.fileName.length > 50 ? "..." : ""}
                      </span>
                    </div>
                    <div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDownload(doc.fileName)}
                        disabled={isLoading}
                      >
                        <CloudDownload className='h-4 w-4 text-muted-foreground' />
                      </Button>

                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleView(doc.fileName)}
                        disabled={isLoading}
                      >
                        <SquareChartGantt className='h-4 w-4 text-muted-foreground' />
                      </Button>

                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDelete(doc.fileName)}
                        disabled={isLoading}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex justify-end'>
        <Button variant='outline' onClick={loadList} disabled={isLoading}>
          <IconRefresh />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default DocumentManager;
