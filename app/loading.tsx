export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col items-center justify-center gap-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-200 border-t-blue-600 text-blue-600 animate-spin" />
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Loading</p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Switching pages...</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Hang tight while the new page loads.</p>
        </div>
      </div>
    </div>
  );
}
