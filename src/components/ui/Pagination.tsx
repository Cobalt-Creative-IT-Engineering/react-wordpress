interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-2 mt-10">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className="btn-ghost px-3">
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`btn-ghost px-3 ${p === page ? "text-accent border-accent" : ""}`}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} className="btn-ghost px-3">
        →
      </button>
    </nav>
  );
}
