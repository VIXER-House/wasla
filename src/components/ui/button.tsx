import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  dark: "bg-ink-900 text-white hover:bg-ink-800 shadow-sm",
  outline: "border border-ink-200 bg-white text-ink-900 hover:bg-ink-50",
  ghost: "text-ink-700 hover:bg-ink-100",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
} as const;
const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" } as const;

type Common = { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string };

export function buttonClass({ variant = "primary", size = "md", className }: Common = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({ variant, size, className, ...props }: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}

export function LinkButton({ variant, size, className, href, ...props }: Common & React.ComponentProps<typeof Link>) {
  return <Link href={href} className={buttonClass({ variant, size, className })} {...props} />;
}
