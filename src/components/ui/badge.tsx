import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#2f81f7]/40 bg-[#2f81f7]/20 text-[#79c0ff]",
        success: "border-[#3fb950]/40 bg-[#3fb950]/20 text-[#7ee787]",
        warning: "border-[#d29922]/40 bg-[#d29922]/20 text-[#e3b341]",
        danger: "border-[#f85149]/40 bg-[#f85149]/20 text-[#ff7b72]",
        neutral: "border-[#30363d] bg-[#21262d] text-[#c9d1d9]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
