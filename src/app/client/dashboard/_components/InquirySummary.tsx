type InquirySummaryProps = {
  totalSent: number;
  awaitingResponse: number;
  responded: number;
};

export function InquirySummary({ totalSent, awaitingResponse, responded }: InquirySummaryProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">Inquiry summary</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Sent" value={totalSent} />
        <Metric label="Awaiting response" value={awaitingResponse} />
        <Metric label="Responded" value={responded} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/80 p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
