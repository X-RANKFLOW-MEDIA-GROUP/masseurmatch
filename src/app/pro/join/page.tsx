import Link from "next/link";

export default function ProJoinPage() {
	return (
		<div className="container mx-auto px-4 py-10">
			<h1 className="text-3xl font-bold mb-6">Therapist Portal</h1>
			<div className="grid md:grid-cols-3 gap-4">
				<Link href="/pro/onboard" className="rounded-lg border border-border p-5 hover:bg-accent transition-colors">
					<h2 className="font-semibold">Onboard</h2>
					<p className="text-sm text-muted-foreground mt-2">Complete your onboarding steps.</p>
				</Link>
				<Link href="/pro/dashboard" className="rounded-lg border border-border p-5 hover:bg-accent transition-colors">
					<h2 className="font-semibold">Dashboard</h2>
					<p className="text-sm text-muted-foreground mt-2">Manage your public profile and performance.</p>
				</Link>
				<Link href="/pro/billing" className="rounded-lg border border-border p-5 hover:bg-accent transition-colors">
					<h2 className="font-semibold">Billing</h2>
					<p className="text-sm text-muted-foreground mt-2">View your subscription and billing options.</p>
				</Link>
			</div>
		</div>
	);
}
