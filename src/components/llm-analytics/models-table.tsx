'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Brain, Lightbulb, Cpu, Coins, MessageSquare } from 'lucide-react';
import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

interface LLMModelData {
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
}

interface ModelsTableProps {
  data: {
    models: {
      [key: string]: LLMModelData;
    };
  };
}

export function ModelsTable({ data }: ModelsTableProps) {
  const models = useMemo(() => {
    return data.models || [];
  }, [data]);

  const getModelColor = (name: string) => {
    if (name.includes('gpt') || name.toLowerCase().includes('openai')) {
      return '#34d399'; // Green for OpenAI
    } else if (name.includes('gemini')) {
      return '#a78bfa'; // Purple for Gemini
    }
    return '#888888'; // Default gray
  };

  return (
    <Card className="border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-950 dark:to-gray-900/80">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">
          模型使用詳情
        </CardTitle>
        <CardDescription>各個模型的使用情況及效能分析</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[160px]">模型</TableHead>
                <TableHead className="w-[200px]">令牌用量</TableHead>
                <TableHead className="w-[150px]">費用</TableHead>
                <TableHead className="hidden sm:table-cell">API 呼叫</TableHead>
                <TableHead className="hidden md:table-cell">
                  每千令牌成本
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  平均每次請求令牌數
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(models).length > 0 ? (
                Object.entries(models).map(([modelName, data]) => {
                  const modelColor = getModelColor(modelName);

                  return (
                    <TableRow
                      key={modelName}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: modelColor }}
                          ></div>
                          <span>
                            {modelName === 'openai'
                              ? 'OpenAI'
                              : modelName === 'gemini'
                              ? 'Google Gemini'
                              : modelName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <span>{data.total_tokens.toLocaleString()}</span>
                            <span className="text-gray-500 text-xs">
                              {(
                                (data.total_tokens / data.total_tokens) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (data.total_tokens / data.total_tokens) * 100
                            }
                            className="h-2"
                            style={
                              {
                                '--progress-background': modelColor,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>${data.total_cost.toFixed(2)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {data.requests.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        $
                        {((data.total_cost / data.total_tokens) * 1000).toFixed(
                          3
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {Math.round(
                          data.total_tokens / data.requests
                        ).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-gray-500"
                  >
                    沒有可用的模型數據
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
