export const seoConfig = {
  siteName: 'MasseurMatch',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://masseurmatch.com',
  description: 'Find verified massage therapists and wellness professionals in your area. Browse profiles, read reviews, and connect with certified therapists.',
  twitterHandle: '@masseurmatch',
  fbAppId: process.env.NEXT_PUBLIC_FB_APP_ID || '',
  logoUrl: 'https://masseurmatch.com/logo.png',
  socialImage: 'https://masseurmatch.com/og-image.jpg',
};

export function generateTherapistMetadata(therapist: any) {
  return {
    title: `${therapist.display_name} - ${therapist.city_name} Massage Therapist | MasseurMatch`,
    description: `${therapist.display_name} - Verified ${therapist.modalities?.join(', ')} therapist in ${therapist.city_name}. ${therapist.rating ? `${therapist.rating.toFixed(1)}⭐` : ''} ${therapist.review_count} reviews. Book now.`,
    keywords: [
      'massage therapist',
      therapist.city_name,
      ...(therapist.modalities || []),
      'wellness',
      'spa',
      'massage',
    ].join(', '),
    openGraph: {
      title: `${therapist.display_name} - Massage Therapist in ${therapist.city_name}`,
      description: therapist.bio || seoConfig.description,
      type: 'profile',
      url: `${seoConfig.siteUrl}/therapists/${therapist.slug}`,
      images: [
        {
          url: therapist.photo_url,
          width: 800,
          height: 800,
          alt: therapist.display_name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${therapist.display_name} - Massage Therapist`,
      description: therapist.bio || seoConfig.description,
      image: therapist.photo_url,
    },
  };
}

export function generateCityMetadata(city: any) {
  return {
    title: `Massage Therapists in ${city.name}, ${city.state} | MasseurMatch`,
    description: `Find verified massage therapists and wellness professionals in ${city.name}, ${city.state}. Browse profiles, read reviews, and book today.`,
    keywords: [
      `massage therapist ${city.name}`,
      `massage ${city.state_code}`,
      `wellness ${city.name}`,
      'spa near me',
      'therapist booking',
    ].join(', '),
    canonical: `${seoConfig.siteUrl}/${city.slug}`,
  };
}

export function generateStructuredData(type: 'therapist' | 'city' | 'organization', data: any) {
  switch (type) {
    case 'therapist':
      return {
        '@context': 'https://schema.org',
        '@type': 'HealthAndBeautyBusiness',
        name: data.display_name,
        description: data.bio,
        image: data.photo_url,
        url: `${seoConfig.siteUrl}/therapists/${data.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: data.address || '',
          addressLocality: data.city_name,
          addressRegion: data.state,
          postalCode: data.zip_code || '',
          addressCountry: 'US',
        },
        aggregateRating: data.rating ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          ratingCount: data.review_count,
        } : undefined,
        priceRange: data.price_range || '',
        telephone: data.phone || '',
        email: data.contact_email || '',
        sameAs: data.website ? [data.website] : undefined,
        knowsLanguage: data.languages || ['English'],
        areaServed: {
          '@type': 'City',
          name: data.city_name,
          addressRegion: data.state,
        },
      };

    case 'city':
      return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: `Massage Therapists in ${data.name}, ${data.state}`,
        description: data.description,
        url: `${seoConfig.siteUrl}/${data.slug}`,
        areaServed: {
          '@type': 'City',
          name: data.name,
          addressRegion: data.state,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: data.latitude,
          longitude: data.longitude,
        },
      };

    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: seoConfig.siteName,
        url: seoConfig.siteUrl,
        logo: seoConfig.logoUrl,
        description: seoConfig.description,
        sameAs: [
          'https://twitter.com/masseurmatch',
          'https://facebook.com/masseurmatch',
          'https://instagram.com/masseurmatch',
        ],
        contact: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'support@masseurmatch.com',
        },
      };
  }
}

export function generateBreadcrumb(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
