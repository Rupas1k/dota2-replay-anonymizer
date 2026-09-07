export function GithubLink() {
  return (
    <a
      className="group fixed right-4 bottom-4 z-20 grid size-8 place-items-center rounded-sm border border-border bg-surface text-muted no-underline shadow-lg transition-colors hover:border-border-strong hover:bg-control hover:text-app-text focus-visible:outline-2 focus-visible:outline-accent/70 focus-visible:outline-offset-2"
      href="https://github.com/Rupas1k/dota2-replay-anonymizer"
      target="_blank"
      rel="noreferrer"
      aria-label="View source code on GitHub"
    >
      <svg className="size-4 fill-current" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.19 1.78 1.19 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.28 5.68.42.36.79 1.07.79 2.15v3.26c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
      </svg>
      <span
        className="invisible pointer-events-none absolute right-[calc(100%+8px)] rounded-sm border border-border bg-control px-2 py-1 text-xs whitespace-nowrap text-app-text opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100"
        role="tooltip"
      >
        Source code
      </span>
    </a>
  );
}
