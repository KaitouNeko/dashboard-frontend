import React, { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { create } from 'domain';
import { Switch } from '@/components/ui/switch';
import { permission } from 'process';
import { createUser, updateUser } from '@/app/api/routes/user';
import { Button } from '@/components/ui/button';

const CreateFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Password must be at least 3 characters.',
  }),
  email: z.string().email(),
  password: z.string().min(5, {
    message: 'Password must be at least 5 characters.',
  }),
  permission: z.boolean(),
});

const EditFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  permission: z.boolean(),
});

const CreateFormModal = ({ data, type, buttonLabel, handleRefetch }: any) => {
  console.log('data', data);
  const [isOpen, setIsOpen] = useState(false);
  const createUserMutation = useMutation({
    mutationFn: createUser,
  });
  const updateUserMutation = useMutation({
    mutationFn: updateUser,
  });
  const form = useForm<
    z.infer<typeof CreateFormSchema | typeof EditFormSchema>
  >({
    resolver: zodResolver(
      type === 'create' ? CreateFormSchema : EditFormSchema
    ),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      permission: true,
    },
  });
  const { reset } = form;
  const handleModalChange = () => {
    setIsOpen((prev) => !prev);
  };

  async function onSubmit(
    values: z.infer<typeof CreateFormSchema | typeof EditFormSchema>
  ) {
    try {
      console.log('values', values);
      if (type === 'create') {
        const createValues = values as z.infer<typeof CreateFormSchema>;
        const payload = {
          name: createValues.name,
          email: createValues.email,
          password: createValues.password,
          permission: createValues.permission ? 1 : 2,
        };
        const res = await createUserMutation.mutateAsync(payload);
        console.log('res', res);
        if (res?.statusCode === 201) {
          handleRefetch();
          handleModalChange();
          toast('Created successful');
        }
      }

      if (type === 'edit') {
        const editValues = values as z.infer<typeof EditFormSchema>;
        const payload = {
          id: data.id,
          name: editValues.name,
          permission: editValues.permission ? 1 : 2,
        };
        const res = await updateUserMutation.mutateAsync(payload);
        if (res?.statusCode === 201) {
          handleRefetch();
          handleModalChange();
          toast('Updated successful');
        }
      }
    } catch (error) {
      toast('Create failed');
    }
  }

  useEffect(() => {
    if (type === 'create') {
      reset({
        name: '',
        email: '',
        password: '',
        permission: true, // 或 false，根據你想要的預設值
      });
    }
    if (type === 'edit') {
      reset({
        name: data.name,
        email: data.email,
        password: '',
        permission: data.permission === 1 ? true : false, // 或 false，根據你想要的預設值
      });
    }
  }, [reset, data]);

  return (
    <Dialog open={isOpen} onOpenChange={handleModalChange}>
      <DialogTrigger>
        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3">
          {buttonLabel}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'create' ? '新增' : '編輯'}使用者</DialogTitle>
          {/* <DialogDescription> */}
          <div className="mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-[334px] space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="name">Name</Label>
                      <FormControl>
                        <Input
                          className="w-[100%]"
                          placeholder="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {type === 'create' && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email">Email</Label>
                        <FormControl>
                          <Input
                            className="w-[100%]"
                            placeholder="email"
                            {...field}
                          />
                        </FormControl>
                        {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {type === 'create' && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                        </div>
                        <FormControl>
                          <Input
                            className="w-[100%]"
                            placeholder="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="permission"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="permission">Permission</Label>
                      <FormControl>
                        <Switch
                          name="permission"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-[100%]" type="submit">
                  Submit
                </Button>
              </form>
            </Form>
          </div>
          {/* </DialogDescription> */}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFormModal;
