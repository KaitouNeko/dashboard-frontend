'use client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/state/authstore';
import { useMutation } from '@tanstack/react-query';

// import Logo from './icon/logo';
import { signIn } from '@/app/api/routes/user';

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5, {
    message: 'Password must be at least 5 characters.',
  }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter();
  const { setUserInfo, setToken } = useAuthStore((state) => state);

  const mutation = useMutation({
    mutationFn: signIn,
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '', // god_admin@gmail.com
      password: '', // QWE@asd123
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      const res = await mutation.mutateAsync(values);
      if (res?.statusCode === 200) {
        setToken(res.result.accessToken);
        localStorage.setItem('token', res.result.accessToken);
        setUserInfo(res.result.userInfo);
        toast('Login successful');
      }
    } catch (error) {
      toast('Login failed');
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/* <Logo /> */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          {/* <CardDescription>
            Enter your email and password below to login
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-[334px] space-y-6"
            >
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        className="w-[100%]"
                        placeholder="password"
                        {...field}
                      />
                    </FormControl>
                    {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                    <div className="mt-4 text-center text-sm">
                      Don&apos;t have an account?{' '}
                      <a href="#" className="underline underline-offset-4">
                        Sign up
                      </a>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-[100%]" type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
