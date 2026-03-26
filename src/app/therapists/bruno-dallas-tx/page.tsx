import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
	getCities,
	getImportedReviews,
	getProfilePhotos,
	getPublicTherapistBySlug,
} from "@/app/_lib/directory";
import { getPublicProfileName } from "@/app/_lib/public-profile";
import {
	buildBreadcrumbJsonLd,
	buildFaqJsonLd,
	buildHealthAndBeautyBusinessJsonLd,
	buildProfilePageJsonLd,
	createPageMetadata,
} from "@/app/_lib/seo";
import { galleryLimit } from "../[slug]/_components/galleryLimit";
import { ProfileHero } from "../[slug]/_components/ProfileHero";
import { ProfileGallery } from "../[slug]/_components/ProfileGallery";
import { ProfileQuickInfo } from "../[slug]/_components/ProfileQuickInfo";
import { ProfileAvailability } from "../[slug]/_components/ProfileAvailability";
import { ProfileAbout } from "../[slug]/_components/ProfileAbout";
import { ProfileServices } from "../[slug]/_components/ProfileServices";
import { ProfilePricing } from "../[slug]/_components/ProfilePricing";
import { ProfileAddOns } from "../[slug]/_components/ProfileAddOns";
import { ProfilePromotions } from "../[slug]/_components/ProfilePromotions";
import { ProfileFaq } from "../[slug]/_components/ProfileFaq";
import { ProfileContact } from "../[slug]/_components/ProfileContact";
import { ProfileTravel } from "../[slug]/_components/ProfileTravel";
import { ProfileAreasServed } from "../[slug]/_components/ProfileAreasServed";
import { ProfileTraining } from "../[slug]/_components/ProfileTraining";
import { ProfileRelatedLocations } from "../[slug]/_components/ProfileRelatedLocations";
import { ProfileStickyFooter } from "../[slug]/_components/ProfileStickyFooter";
import { KnottyProfileTracker } from "../[slug]/_components/KnottyProfileTracker";

const BRUNO_SLUG = "bruno-dallas-tx";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
	const profile = await getPublicTherapistBySlug(BRUNO_SLUG);
	
	if (!profile) {
		return createPageMetadata({
			title: "Bruno | Verified Massage Therapist | Dallas, TX",
			description: "Bruno is a Brazilian massage therapist in Dallas, TX. Specializing in Deep Tissue, Shiatsu, and Sports Recovery. LGBT+ welcoming. View rates and book directly.",
			path: `/therapists/${BRUNO_SLUG}`,
			noIndex: false,
		});
	}

	const name = getPublicProfileName(profile);
	const city = profile.city || "Dallas";
	const neighborhood = profile.neighborhood_name || profile.primary_area;
	const topTechnique = profile.specialties?.[0] || profile.modality || "Massage";
	const yearsExp = profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
	const verified = profile.is_verified_identity || profile.is_verified_profile;
	const priceFrom = [profile.incall_price, profile.outcall_price]
		.filter((p): p is number => typeof p === "number" && p > 0)
		.sort((a, b) => a - b)[0];

	const titleParts = [
		name,
		[verified ? "Verified" : null, topTechnique, "Therapist"].filter(Boolean).join(" "),
		[neighborhood, city].filter(Boolean).join(", "),
	].filter(Boolean).join(" | ");

	const descParts = [
		`${name} is a${yearsExp ? ` ${yearsExp}+ year` : ""} professional massage therapist`,
		neighborhood ? `in ${neighborhood}, ${city}` : `in ${city}`,
		`specializing in ${topTechnique}.`,
		priceFrom ? `Sessions from $${priceFrom}.` : null,
		verified ? "Identity verified." : null,
		"View rates, availability & book directly.",
	].filter(Boolean);

	const description = profile.bio
		? profile.bio.length > 160 ? profile.bio.slice(0, 157) + "..." : profile.bio
		: descParts.join(" ");

	return createPageMetadata({
		title: titleParts,
		description,
		path: `/therapists/${BRUNO_SLUG}`,
		type: "profile",
		image: profile.avatar_url || undefined,
		keywords: [
			"Bruno massage Dallas",
			"male massage therapist Dallas",
			"gay massage Dallas TX",
			"LGBTQ massage Dallas",
			"deep tissue massage Dallas",
			profile.city,
			neighborhood,
			profile.modality,
			...(profile.specialties || []),
			"verified massage therapist",
		].filter((value): value is string => Boolean(value)),
	});
}

export default async function BrunoDallasProfile() {
	const profile = await getPublicTherapistBySlug(BRUNO_SLUG);
	
	if (!profile) {
		notFound();
	}

	const photoLimit = galleryLimit(profile._tier);
	const [reviews, photos] = await Promise.all([
		getImportedReviews(profile.id, 5),
		getProfilePhotos(profile.id, photoLimit),
	]);

	const name = getPublicProfileName(profile);
	const profilePath = `/therapists/${BRUNO_SLUG}`;
	const matchedCity = getCities().find((city) => city.name.toLowerCase() === (profile.city || "").toLowerCase());
	const cityPath = matchedCity
		? `/${matchedCity.slug}`
		: profile.city
			? `/search?city=${encodeURIComponent(profile.city)}`
			: "/search";

	const faqItems =
		Array.isArray(profile.custom_faq) && profile.custom_faq.length > 0
			? (profile.custom_faq as { question: string; answer: string }[])
			: [];

	const anchorLinks = [
		{ href: "#gallery", label: "Gallery" },
		{ href: "#about", label: "About" },
		{ href: "#services", label: "Services" },
		{ href: "#pricing", label: "Rates" },
		{ href: "#faq", label: "FAQ" },
		{ href: "#contact", label: "Contact" },
	];

	return (
		<>
			<JsonLd
				data={buildBreadcrumbJsonLd([
					{ name: "Home", path: "/" },
					{ name: "Therapists", path: "/therapists" },
					...(matchedCity ? [{ name: matchedCity.name, path: `/${matchedCity.slug}` }] : []),
					{ name, path: profilePath },
				])}
			/>
			<JsonLd
				data={buildProfilePageJsonLd({
					name,
					path: profilePath,
					description:
						profile.bio ||
						`${name} is listed on MasseurMatch with city context, specialties, and direct contact information.`,
					city: profile.city,
					specialties: profile.specialties,
					image: profile.avatar_url,
					tier: profile._tier,
					incallPrice: profile.incall_price,
					outcallPrice: profile.outcall_price,
					reviews: reviews.map((review) => ({
						rating: review.rating,
						reviewText: review.review_text,
						reviewerName: review.reviewer_name,
					})),
				})}
			/>
			<JsonLd
				data={buildHealthAndBeautyBusinessJsonLd({
					name,
					slug: BRUNO_SLUG,
					description:
						profile.bio ||
						`${name} is a professional massage therapist in ${profile.city || "Dallas, TX"} specializing in ${profile.specialties?.[0] || profile.modality || "Massage"}.`,
					city: profile.city,
					stateCode: matchedCity?.stateCode || "TX",
					specialty: profile.specialties?.[0] || profile.modality || "Massage",
					image: profile.avatar_url,
					phone: profile.phone,
					incallPrice: profile.incall_price,
					outcallPrice: profile.outcall_price,
					reviews: reviews.map((review) => ({
						rating: review.rating,
						reviewText: review.review_text,
						reviewerName: review.reviewer_name,
					})),
				})}
			/>
			{faqItems.length > 0 ? <JsonLd data={buildFaqJsonLd(faqItems)} /> : null}

			<div className="profile-page-shell page-shell py-10 pb-28 md:pb-14">
				<KnottyProfileTracker
					therapistId={profile.id}
					city={profile.city}
					neighborhood={profile.neighborhood_name || profile.primary_area || null}
				/>

				<div className="space-y-10">
					<ProfileHero profile={profile} cityPath={cityPath} />

					<div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_22rem] xl:items-start">
						<div className="space-y-8">
							<nav className="profile-panel sticky top-4 z-20 flex flex-wrap gap-2 px-3 py-3">
								{anchorLinks.map((link) => (
									<a key={link.href} href={link.href} className="profile-toolbar-link">
										{link.label}
									</a>
								))}
							</nav>

							<ProfileGallery profile={profile} photos={photos} />
							<ProfileAbout profile={profile} />
							<ProfileServices profile={profile} />
							<ProfilePricing profile={profile} />
							<ProfileAddOns profile={profile} />
							<ProfilePromotions profile={profile} />
							<ProfileFaq profile={profile} />
						</div>

						<aside className="space-y-8 xl:sticky xl:top-24">
							<ProfileQuickInfo profile={profile} />
							<ProfileContact profile={profile} />
							<ProfileAvailability profile={profile} />
							<ProfileTravel profile={profile} />
							<ProfileAreasServed profile={profile} />
							<ProfileTraining profile={profile} />
						</aside>
					</div>

					<div className="space-y-10">
						<ProfileRelatedLocations profile={profile} />

						{reviews.length > 0 ? (
							<section className="profile-panel p-6 md:p-7">
								<h2 className="text-2xl font-semibold text-foreground">Reviews</h2>
								<div className="mt-4 space-y-3">
									{reviews.map((review) => (
										<article key={review.id} className="profile-panel-soft rounded-[1.5rem] p-4">
											<p className="text-sm leading-6 text-muted-foreground">{review.review_text}</p>
											<p className="mt-2 text-xs text-muted-foreground">
												Rating: {review.rating ?? "N/A"}
												{review.reviewer_name ? ` · ${review.reviewer_name}` : ""}
											</p>
										</article>
									))}
								</div>
							</section>
						) : null}
					</div>
				</div>
			</div>

			<ProfileStickyFooter profile={profile} />
		</>
	);
}
