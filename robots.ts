import { appUrl } from "@/app/_lib/seo";

export default function robots() {
	return {
		rules: [
			{ userAgent: "*", allow: "/" },
			{ userAgent: "*", disallow: ["/admin", "/pro"] },
		],
		sitemap: `${appUrl}/sitemap.xml`,
	};
}
