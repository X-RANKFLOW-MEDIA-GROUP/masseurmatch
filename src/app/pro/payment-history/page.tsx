import Link from "next/link";
import { CreditCard } from "lucide-react";

export const metadata = { title: "Payment History — MasseurMatch Pro" };

export default function PaymentHistoryPage() {
  return <main className="mx-auto max-w-5xl space-y-6 p-4 pb-24 md:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Billing</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Payment History</h1><p className="mt-2 text-slate-600">Review subscription and add-on charges associated with your account.</p></div><Link href="/pro/subscription" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Manage subscription</Link></div><section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><CreditCard className="mx-auto h-8 w-8 text-slate-400" /><h2 className="mt-4 text-lg font-semibold text-slate-900">No payments to display</h2><p className="mt-2 text-sm text-slate-500">Completed charges and downloadable receipts will appear here.</p></section></main>;
}
