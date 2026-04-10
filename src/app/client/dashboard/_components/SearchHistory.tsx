export type SearchHistoryItem = {
  id: string;
  query: string;
  createdAt: string;
  filters: string[];
};

type SearchHistoryProps = {
  items: SearchHistoryItem[];
};

export function SearchHistory({ items }: SearchHistoryProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">Recent searches</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-border/80 p-3">
            <p className="font-medium">{item.query}</p>
            <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
            {item.filters.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{item.filters.join(" • ")}</p>}
          </li>
        ))}
        {!items.length && <li className="text-sm text-muted-foreground">No recent searches yet.</li>}
      </ul>
    </section>
  );
}
