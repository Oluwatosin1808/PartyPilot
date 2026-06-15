import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function BrutalCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000]", className)}
      {...props}
    />
  );
}

export function SectionShell({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("border-t-4 border-black px-5 py-16 sm:px-8 lg:px-12", className)} {...props} />;
}
