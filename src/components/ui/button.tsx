import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-yellow-300 text-black hover:bg-yellow-200",
  secondary: "bg-white text-black hover:bg-blue-400 hover:text-black",
  black: "bg-black text-white hover:bg-blue-500 hover:text-black",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-xl border-4 border-black px-6 py-3 text-base font-black uppercase tracking-normal shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function LinkButton({ className, variant = "primary", href, ...props }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-xl border-4 border-black px-6 py-3 text-base font-black uppercase tracking-normal shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
