export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm">
      <strong className="block font-semibold mb-1">Erreur</strong>
      {message}
    </div>
  );
}
