export function AppHeader() {
  return (
    <header className="mb-5 flex items-center justify-between gap-4">
      <h1 className="m-0 text-xl leading-tight font-semibold tracking-[-0.01em] max-[480px]:text-lg">
        Dota 2 Replay Anonymizer
      </h1>
      <a
        className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-700/80 bg-input text-muted-strong no-underline transition-colors hover:border-accent/40 hover:bg-surface hover:text-accent-strong focus-visible:outline-3 focus-visible:outline-blue-500/20 focus-visible:outline-offset-2"
        href="https://github.com/Rupas1k/dota2-replay-anonymizer"
        target="_blank"
        rel="noreferrer"
        aria-label="Open project on GitHub"
        title="GitHub"
      >
        <svg className="size-5 fill-current" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.19 1.78 1.19 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.28 5.68.42.36.79 1.07.79 2.15v3.26c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
        </svg>
      </a>
    </header>
  );
}
