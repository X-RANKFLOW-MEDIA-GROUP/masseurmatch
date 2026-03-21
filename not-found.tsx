import Link from "next/link";

export default function NotFoundPage() {
	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="max-w-md text-center">
				<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">404</p>
				<h1 className="text-4xl font-bold mt-2">Page not found</h1>
				<p className="text-muted-foreground mt-3">The page you requested does not exist or was moved.</p>
				<div className="mt-5">
					<Link href="/" className="underline">Return to homepage</Link>
				</div>
			</div>
		</div>
	);
}
