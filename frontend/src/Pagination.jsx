// Page numbers to show: the first page, the current page with the next two, and the last three.
// Anything left out between two shown pages becomes a '…' gap.
function pageItems(page, totalPages) {
  const wanted = new Set([1, page, page + 1, page + 2, totalPages - 2, totalPages - 1, totalPages]);
  const pages = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  const items = [];
  pages.forEach((n, i) => {
    if (i > 0 && n - pages[i - 1] > 1) items.push('gap');
    items.push(n);
  });
  return items;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages < 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        ‹
      </button>
      {pageItems(page, totalPages).map((item, i) => {
        if (item === 'gap') {
          return (
            <span key={`gap-${i}`} className="gap">
              …
            </span>
          );
        }
        if (item === page) {
          return (
            <span key={item} className="current" aria-current="page">
              {item}
            </span>
          );
        }
        return (
          <button type="button" key={item} onClick={() => onChange(item)}>
            {item}
          </button>
        );
      })}
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        ›
      </button>
    </nav>
  );
}
