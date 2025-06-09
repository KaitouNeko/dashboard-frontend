"use client";

import { IconMessageChatbot } from "@tabler/icons-react";
import CustomChat from "@/components/custom-chat";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WorkspaceChatPage() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 flex-row'>
          <IconMessageChatbot />
          Chatbot
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-grow overflow-hidden'>
        <CustomChat />
      </CardContent>
      <CardFooter className='text-sm text-muted-foreground'>
        <p>支持一般聊天和RAG文件查詢功能</p>
      </CardFooter>
    </Card>
  );
}
