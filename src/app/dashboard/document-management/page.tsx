"use client";

import DocumentManager from "@/components/document-manager";

export default function DocumentManagementPage() {
  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>數據管理</h1>
        <p className='text-muted-foreground'>數據上傳和管理</p>
      </div>

      <DocumentManager className='w-full' />
    </div>
  );
}
