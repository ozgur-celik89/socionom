import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

function pageHref(basePath: string, params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  if (page <= 1) next.delete("sida");
  else next.set("sida", String(page));
  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  basePath,
  currentPage,
  totalPages,
  params = new URLSearchParams(),
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  params?: URLSearchParams;
}) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, Math.max(currentPage + 2, 5));
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav aria-label="Sidnavigering" className="pagination">
      {currentPage > 1 ? (
        <Link className="pagination-direction" href={pageHref(basePath, params, currentPage - 1)} rel="prev">
          <ArrowLeftIcon /> Föregående
        </Link>
      ) : <span />}

      <div className="pagination-pages">
        {start > 1 && <span aria-hidden="true">…</span>}
        {pages.map((page) => (
          page === currentPage ? (
            <span aria-current="page" className="pagination-current" key={page}>{page}</span>
          ) : (
            <Link href={pageHref(basePath, params, page)} key={page}>{page}</Link>
          )
        ))}
        {end < totalPages && <span aria-hidden="true">…</span>}
      </div>

      {currentPage < totalPages ? (
        <Link className="pagination-direction" href={pageHref(basePath, params, currentPage + 1)} rel="next">
          Nästa <ArrowRightIcon />
        </Link>
      ) : <span />}
    </nav>
  );
}
