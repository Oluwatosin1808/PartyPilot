import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-black uppercase", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-14 w-full rounded-xl border-4 border-black bg-white px-4 text-base font-bold outline-none transition-shadow focus:shadow-[4px_4px_0_#2563eb]",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-14 w-full rounded-xl border-4 border-black bg-white px-4 text-base font-bold outline-none transition-shadow focus:shadow-[4px_4px_0_#2563eb]",
        className,
      )}
      {...props}
    />
  );
}
