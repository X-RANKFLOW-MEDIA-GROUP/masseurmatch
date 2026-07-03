export function ServiceTags({ title, values }: { title?: string; values: string[] }) {
  if (!values.length) return null;
  return (
    <div>
      {title && <h3 className="mb-4 font-display text-[22px] font-semibold text-[#F8FAFC]">{title}</h3>}
      <div className="flex flex-wrap gap-3">
        {values.map((value) => (
          <span key={value} className="rounded-full border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-4.5 py-2.5 font-sans text-sm text-[#F8FAFC] shadow-[0_0_28px_rgba(59,130,246,0.08)]">{value}</span>
        ))}
      </div>
    </div>
  );
}
