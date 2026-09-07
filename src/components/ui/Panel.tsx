import type { HTMLAttributes } from "react";

export function Panel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-sm border border-border bg-surface ${className ?? ""}`}
      {...props}
    />
  );
}

export function PanelSection({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <Panel className={`grid gap-3 p-4 max-[720px]:p-3.5 ${className ?? ""}`} {...props} />;
}

type SectionHeadingProps = {
  title: string;
};

export function SectionHeading({ title }: SectionHeadingProps) {
  return <h2 className="m-0 text-base font-medium text-app-text">{title}</h2>;
}
