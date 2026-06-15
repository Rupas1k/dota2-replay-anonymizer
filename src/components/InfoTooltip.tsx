type InfoTooltipProps = {
  text: string;
};

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <span className="info-tooltip" aria-label={text}>
      ?
      <span role="tooltip">{text}</span>
    </span>
  );
}
