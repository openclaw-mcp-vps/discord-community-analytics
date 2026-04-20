import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-slate-700 bg-slate-800 text-slate-100",
        success: "border-emerald-600/40 bg-emerald-500/15 text-emerald-300",
        warning: "border-amber-600/40 bg-amber-500/15 text-amber-300",
        danger: "border-rose-600/40 bg-rose-500/15 text-rose-300",
        info: "border-sky-600/40 bg-sky-500/15 text-sky-300"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
