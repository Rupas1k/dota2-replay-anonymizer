import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost";
  size?: "default" | "small";
};

const variants = {
  default:
    "border-[#2f3e4a] bg-input text-app-text hover:border-border-strong hover:bg-surface disabled:bg-input disabled:text-[#718190]",
  primary:
    "border-accent bg-accent font-bold text-[#07121b] hover:border-accent-strong hover:bg-accent-strong disabled:border-border disabled:bg-input disabled:text-[#718190]",
  ghost:
    "border-transparent bg-transparent text-muted-strong hover:border-border-strong hover:bg-surface",
} as const;

export function Button({
  className,
  size = "default",
  type = "button",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`cursor-pointer rounded-lg border px-3 transition-colors focus-visible:border-accent focus-visible:outline-3 focus-visible:outline-blue-500/20 disabled:cursor-not-allowed ${size === "small" ? "min-h-8 py-1.5" : "min-h-9 py-[7px]"} ${variants[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
