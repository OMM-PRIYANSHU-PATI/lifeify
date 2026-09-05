import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          disabled={disabled}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-all duration-150",
            "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            error ? "border-crisis focus-visible:ring-crisis/20" : "",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-xs font-medium text-crisis animate-fadeIn">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-xs font-semibold text-ink-soft mb-1.5", className)}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-crisis">*</span>}
    </label>
  );
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-all duration-150",
            "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:opacity-50 disabled:cursor-not-allowed min-h-[90px] resize-y",
            error && "border-crisis focus-visible:ring-crisis/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs font-medium text-crisis animate-fadeIn">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
