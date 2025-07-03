'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bolt, MonitorCog } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className='flex flex-col space-y-6 w-full h-[calc(100vh-48px)]'>
      <h1 className='text-3xl font-bold tracking-tight'>系統儀表板</h1>
      <p className='text-muted-foreground'>
        歡迎使用能源管理與預測系統控制面板，查看關鍵指標和功能。
      </p>

      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='mb-4'>
          <TabsTrigger value='overview'>總覽</TabsTrigger>
          <TabsTrigger value='features'>功能介紹</TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>能源管理預測系統</CardTitle>
              <CardDescription>
                專為數據中心設計的智能能源管理解決方案
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <p>
                  透過 AI
                  驅動的預測和分析，優化數據中心的能源使用並提前預測設備故障。點擊下方按鈕或左側導航欄的選項來開始使用。
                </p>
                <div className='flex flex-wrap gap-3'>
                  <Button asChild>
                    <Link href='/dashboard/energy-dashboard'>
                      <Bolt className='mr-2 h-4 w-4' />
                      能源儀表板
                    </Link>
                  </Button>
                  <Button variant='outline' asChild>
                    <Link href='/dashboard/equipment-monitoring'>
                      <MonitorCog className='mr-2 h-4 w-4' />
                      設備監控
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='features' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>能源管理與預測系統功能</CardTitle>
              <CardDescription>探索系統的主要功能與特點</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <ul className='space-y-2'>
                  <li className='flex gap-2'>
                    <Bolt className='h-5 w-5 text-blue-500 shrink-0' />
                    <div>
                      <p className='font-medium'>能源使用監控與預測</p>
                      <p className='text-sm text-muted-foreground'>
                        實時追蹤能源使用情況，透過 AI 模型預測未來 24-72
                        小時的用電趨勢，識別異常用電模式。
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-2'>
                    <MonitorCog className='h-5 w-5 text-green-500 shrink-0' />
                    <div>
                      <p className='font-medium'>設備健康監控與故障預測</p>
                      <p className='text-sm text-muted-foreground'>
                        監控
                        HVAC、電池和服務器設備的健康狀態，預測潛在故障並提供維護建議。
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

