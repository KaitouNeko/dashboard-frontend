'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'border-2 border-input text-primary bg-background transition-all duration-200 ease-in-out',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
        'aria-checked:border-primary aria-checked:shadow-[0_0_0_4px_var(--tw-shadow-color)] aria-checked:shadow-primary/10',
        'hover:border-primary/70 hover:shadow-xs',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'dark:bg-input/30 aspect-square size-5 shrink-0 rounded-full shadow-xs outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      style={{
        borderColor: 'oklch(54.6% .245 262.881)',
      }}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center animate-fade-in"
      >
        <CircleIcon
          className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
          style={{ fill: 'oklch(54.6% .245 262.881)' }}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
