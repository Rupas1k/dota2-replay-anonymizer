import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary";
  size?: "default" | "small";
};

const variants = {
  default:
    "border-border bg-control text-app-text hover:border-border-strong hover:bg-control-hover disabled:bg-input disabled:text-muted",
  primary:
    "border-success bg-success font-medium text-white hover:border-success-hover hover:bg-success-hover disabled:border-border disabled:bg-input disabled:text-muted",
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
      className={`cursor-pointer rounded-sm border px-3 text-sm transition-colors focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-accent/70 disabled:cursor-not-allowed ${size === "small" ? "min-h-8 py-1.5" : "min-h-9 py-[7px]"} ${variants[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
