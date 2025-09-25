"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"

const Form = FormProvider

function FormField({ ...props }: any) {
  return <Controller {...props} />
}

function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />
}

function FormLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn("text-sm font-medium leading-none", className)} {...props} />
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  return <Slot {...props} />
}

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    children ? (
      <p className={cn("text-sm text-destructive", className)} {...props}>
        {children}
      </p>
    ) : null
  )
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage }
