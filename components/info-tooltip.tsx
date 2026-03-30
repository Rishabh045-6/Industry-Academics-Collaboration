export function InfoTooltip({ description }: { description: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        title={description}
        aria-label="More info"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        i
      </button>
      <span className="pointer-events-none absolute left-full top-1/2 z-20 hidden w-72 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700 shadow-xl group-hover:block group-focus-within:block">
        {description}
      </span>
    </span>
  );
}
