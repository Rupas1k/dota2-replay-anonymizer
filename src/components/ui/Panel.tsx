import type { HTMLAttributes } from "react";

export function Panel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-lg border border-slate-700/80 bg-surface shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${className ?? ""}`}
      {...props}
    />
  );
}

export function PanelSection({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <Panel className={`grid gap-3.5 p-4 max-[720px]:p-3.5 ${className ?? ""}`} {...props} />;
}

type SectionHeadingProps = {
  description: string;
  step: number;
  title: string;
  inverted?: boolean;
};

export function SectionHeading({ description, inverted, step, title }: SectionHeadingProps) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-full text-[0.82rem] font-bold ${inverted ? "bg-white/12 text-[#d0d8df]" : "bg-[#14202b] text-accent-strong"}`}
      >
        {step}
      </span>
      <div className={inverted ? "grid gap-0.5" : undefined}>
        <h2 className={`m-0 text-base leading-tight ${inverted ? "text-[#f4f8fb]" : ""}`}>
          {title}
        </h2>
        <p className={`m-0 text-sm text-muted ${inverted ? "leading-tight text-[#9dadb9]" : ""}`}>
          {description}
        </p>
      </div>
    </div>
  );
}
