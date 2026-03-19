import { appUrl } from "@/app/_lib/seo";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { BLOG_POSTS } from "@/app/blog/posts";

type SitemapEntry = {
	url: string;
	lastModified: string;
	changeFrequency: "daily" | "weekly" | "monthly";
	priority: number;
};

export default async function sitemap(): Promise<SitemapEntry[]> {
	const now = new Date().toISOString();

	const staticRoutes: SitemapEntry[] = [
		{ url: `${appUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
		{ url: `${appUrl}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
		{ url: `${appUrl}/therapists`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
		{ url: `${appUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
		{ url: `${appUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
	];

	const cityRoutes: SitemapEntry[] = getCities().map((city) => ({
		url: `${appUrl}/${city.slug}`,
		lastModified: now,
		changeFrequency: "weekly",
		priority: 0.8,
	}));

	const identitySegments = ["lgbtq-friendly", "male-therapists", "sports-recovery"];
	const identityRoutes: SitemapEntry[] = identitySegments.map((segment) => ({
		url: `${appUrl}/search?segment=${segment}`,
		lastModified: now,
		changeFrequency: "weekly",
		priority: 0.6,
	}));

	const keywordRoutes = ["deep-tissue", "swedish", "thai", "outcall", "incall"].map((keyword) => ({
		url: `${appUrl}/search?keyword=${keyword}`,
		lastModified: now,
		changeFrequency: "weekly" as const,
		priority: 0.6,
	}));

	const blogRoutes: SitemapEntry[] = BLOG_POSTS.map((post) => ({
		url: `${appUrl}/blog/${post.slug}`,
		lastModified: post.publishedAt,
		changeFrequency: "monthly",
		priority: 0.6,
	}));

	const therapistData = await getPublicTherapists({ page: 1, pageSize: 500 });
	const therapistRoutes: SitemapEntry[] = therapistData.items.map((therapist) => ({
		url: `${appUrl}/therapists/${therapist.slug || therapist.id}`,
		lastModified: now,
		changeFrequency: "weekly",
		priority: 0.7,
	}));

	return [...staticRoutes, ...cityRoutes, ...identityRoutes, ...keywordRoutes, ...blogRoutes, ...therapistRoutes];
}
