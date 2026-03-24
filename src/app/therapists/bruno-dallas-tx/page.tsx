
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

type Params = { slug: string };

export const revalidate = 60;

export async function generateStaticParams() {
	// Only Bruno's slug for this route
	return [{ slug: "bruno-dallas-tx" }];
}

export async function generateMetadata(): Promise<Metadata> {
	// Hardcode Bruno's slug for this route
	const profile = await getPublicTherapistBySlug("bruno-dallas-tx");
	if (!profile) {
		return createPageMetadata({
			title: "Bruno — Dallas Massage Therapist",
			description: "Bruno is a Brazilian massage therapist in Dallas, TX. Specializing in Deep Tissue, Shiatsu, and Sports Recovery. LGBT+ welcoming.",
			path: "/therapists/bruno-dallas-tx",
			noIndex: true,
		});
	}
	const name = getPublicProfileName(profile);
	const city = profile.city || "Dallas";
	const topTechnique = profile.specialties?.[0] || profile.modality || "Massage";
	const yearsExp = profile.years_experience ?? (profile.start_year ? new Date().getFullYear() - profile.start_year : null);
	const verified = profile.is_verified_identity || profile.is_verified_profile;
	const priceFrom = [profile.incall_price, profile.outcall_price].filter((p): p is number => typeof p === "number" && p > 0).sort((a, b) => a - b)[0];
	const titleParts = [
		name,
		[verified ? "Verified" : null, topTechnique, "Therapist"].filter(Boolean).join(" "),
		city,
	].filter(Boolean).join(" | ");
	const descParts = [
		`${name} is a${yearsExp ? ` ${yearsExp}+ year` : ""} professional massage therapist in ${city}, specializing in ${topTechnique}.`,
		priceFrom ? `Sessions from $${priceFrom}.` : null,
		verified ? "Identity verified." : null,
		"View rates, availability & contact directly.",
	].filter(Boolean);
	const description = profile.bio ? (profile.bio.length > 160 ? profile.bio.slice(0, 157) + "..." : profile.bio) : descParts.join(" ");
	return createPageMetadata({
		title: titleParts,
		description,
		path: `/therapists/${profile.slug || profile.id}`,
		type: "profile",
		image: profile.avatar_url || undefined,
		keywords: [
			profile.city,
			profile.modality,
			...(profile.specialties || []),
			"massage therapist",
			"male massage therapist",
			"verified massage therapist",
			profile.city ? `gay massage ${profile.city}` : null,
			profile.city ? `LGBTQ massage ${profile.city}` : null,
		].filter((value): value is string => Boolean(value)),
	});
}

export default async function BrunoDallasProfile() {
	const profile = await getPublicTherapistBySlug("bruno-dallas-tx");
	if (!profile) notFound();
	const photoLimit = galleryLimit(profile._tier);
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
					slug: profile.slug || profile.id,
					description:
						profile.bio ||
						`${name} is a professional massage therapist in ${profile.city || "the US"} specializing in ${profile.specialties?.[0] || profile.modality || "Massage"}.`,
					city: profile.city,
					stateCode: matchedCity?.stateCode,
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

			<div className="body">
				<KnottyProfileTracker
					therapistId={profile.id}
					city={profile.city}
					neighborhood={profile.neighborhood_name || profile.primary_area || null}
				/>

				<div className="profile-page-shell">
					<ProfileHero profile={profile} cityPath={cityPath} />

					<div className="main-content">
						<nav className="profile-panel">
							{anchorLinks.map((link) => (
								<a key={link.href} href={link.href} className="profile-toolbar-link">
									{link.label}
								</a>
							))}
						</nav>

						<div className="profile-content">
							<ProfileGallery profile={profile} photos={photos} />
							<ProfileAbout profile={profile} />
							<ProfileServices profile={profile} />
							<ProfilePricing profile={profile} />
							<ProfileAddOns profile={profile} />
							<ProfilePromotions profile={profile} />
							<ProfileFaq profile={profile} />
						</div>

						<aside className="profile-sidebar">
							<ProfileQuickInfo profile={profile} />
							<ProfileContact profile={profile} />
							<ProfileAvailability profile={profile} />
							<ProfileTravel profile={profile} />
							<ProfileAreasServed profile={profile} />
							<ProfileTraining profile={profile} />
						</aside>
					</div>

					<div className="profile-related">
						<ProfileRelatedLocations profile={profile} />

						{reviews.length > 0 ? (
							<section className="profile-panel">
								<h2 className="subtitle">Reviews</h2>
								<div className="reviews-list">
									{reviews.map((review) => (
										<article key={review.id} className="profile-panel-soft">
											<p className="review-text">{review.review_text}</p>
											<p className="review-meta">
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

				<ProfileStickyFooter profile={profile} />
			</div>
		</>
	);
}

