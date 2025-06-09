'use client';
import { getUsers, createUser } from '@/app/api/routes/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useQuery } from '@tanstack/react-query';
import CreateFormModal from './createFormModal';
import { useState } from 'react';

export default function DashboardPage() {
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  const [isOpen, setIsOpen] = useState(false);
  const handleRefetch = () => {
    refetch();
  };

  return (
    <div>
      <div className="py-4 px-2 text-[20px] flex justify-between items-center">
        使用者管理
        <CreateFormModal
          type="create"
          handleRefetch={handleRefetch}
          buttonLabel="新增使用者"
        />
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead className="w-[100px]">Email</TableHead>
                <TableHead className="w-[100px]">UpdatedAt</TableHead>
                <TableHead className="w-[100px]">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.result.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.updatedAt}</TableCell>
                  <TableCell>
                    <CreateFormModal
                      data={user}
                      type="edit"
                      handleRefetch={handleRefetch}
                      buttonLabel="編輯"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
