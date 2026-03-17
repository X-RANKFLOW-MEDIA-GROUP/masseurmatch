export default function CookiePolicyPage() {
	return (
		<div className="container mx-auto px-4 py-10 max-w-3xl">
			<h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
			<p className="text-muted-foreground mb-3">We use cookies to keep your session active, improve security, and understand product usage.</p>
			<ul className="list-disc pl-5 text-muted-foreground space-y-1">
				<li>Essential cookies for authentication and security.</li>
				<li>Preference cookies for language and UI settings.</li>
				<li>Analytics cookies to improve directory performance.</li>
			</ul>
		</div>
	);
}
