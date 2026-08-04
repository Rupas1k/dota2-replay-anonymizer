type InfoTooltipProps = {
  text: string;
};

export function InfoTooltip({ text }: InfoTooltipProps) {
  const tooltipId = useId();

  return (
    <span
      className="group relative inline-grid size-[17px] place-items-center rounded-full border border-slate-600/70 text-xs leading-none font-bold text-muted align-middle hover:border-accent/60 hover:text-accent-strong focus-within:border-accent/60 focus-within:text-accent-strong"
      aria-describedby={tooltipId}
      tabIndex={0}
    >
      ?
      <span
        id={tooltipId}
        className="invisible pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 w-max max-w-60 -translate-x-1/2 translate-y-1 rounded-lg border border-slate-600/90 bg-input px-[9px] py-[7px] text-left text-xs leading-snug font-medium whitespace-normal text-muted-strong opacity-0 shadow-xl transition-[opacity,transform] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
        role="tooltip"
      >
        {text}
      </span>
    </span>
  );
}
import { useId } from "react";
