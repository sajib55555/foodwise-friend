
import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:brightness-105",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:brightness-105",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:brightness-95",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass text-foreground shadow-sm hover:shadow-md",
        "glass-primary": "glass bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md",
        "glass-sm": "glass text-foreground shadow-sm hover:shadow-md p-0",
        "purple": "bg-purple-600 text-white shadow-purple hover:bg-purple-700 hover:shadow-purple-lg",
        "purple-light": "bg-purple-100 text-purple-800 hover:bg-purple-200",
        "purple-outline": "border border-purple-300 text-purple-700 hover:bg-purple-50",
        "purple-ghost": "text-purple-700 hover:bg-purple-50/50",
        "purple-gradient": "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple hover:shadow-purple-lg",
        "premium": "bg-gradient-to-r from-[#9b87f5] to-[#7c3aed] text-white shadow-purple hover:shadow-purple-lg",
        "blue-gradient": "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md hover:shadow-blue-200/50",
        "green-gradient": "bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-md hover:shadow-green-200/50",
        "amber-gradient": "bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-md hover:shadow-amber-200/50",
        "pink-gradient": "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md hover:shadow-pink-200/50",
        "teal-gradient": "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md hover:shadow-teal-200/50", 
        "rainbow-gradient": "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-md hover:shadow-purple-200/50",
        "glass-blue": "glass-blue text-blue-800 dark:text-blue-200 shadow-sm hover:shadow-md",
        "glass-green": "glass-green text-green-800 dark:text-green-200 shadow-sm hover:shadow-md",
        "glass-amber": "glass-amber text-amber-800 dark:text-amber-200 shadow-sm hover:shadow-md",
        "glass-pink": "glass-pink text-pink-800 dark:text-pink-200 shadow-sm hover:shadow-md",
        icon: "rounded-full h-10 w-10 p-0 shadow-sm",
      },
      size: {
        default: "h-11 px-4 py-2",
        xs: "h-8 rounded-lg px-3 text-xs",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-12 w-12",
        pill: "h-11 px-6 rounded-full",
        "pill-sm": "h-9 px-5 rounded-full text-xs",
        "pill-lg": "h-12 px-8 rounded-full text-base",
      },
      hover: {
        none: "",
        lift: "transition-transform hover:-translate-y-1",
        scale: "transition-transform hover:scale-105",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, hover, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, hover, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
