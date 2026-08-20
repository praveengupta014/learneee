const Pagination = ({ pagination, onLoadMore, loadingMore }) => {
  if (!pagination) return null;
  const { hasMore, total } = pagination;
  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 mt-8">
      {hasMore ? (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="text-sm font-medium bg-white border border-line rounded-md px-6 py-2.5 hover:border-sage hover:text-sage transition disabled:opacity-60"
        >
          {loadingMore ? "Loading…" : "Load more courses"}
        </button>
      ) : (
        <p className="text-xs font-mono text-slate">— end of results —</p>
      )}
    </div>
  );
};

export default Pagination;
