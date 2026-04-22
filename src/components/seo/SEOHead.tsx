"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const BASE_URL = "https://masseurmatch.com";
const OG_SITE_NAME = "MasseurMatch — Gay Massage Directory";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  keywords?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Sets document <head> meta tags for SEO.
 * Manages title, description, canonical, OG, Twitter, and JSON-LD.
 */
export const SEOHead = ({
  title,
  description,
  path,
  ogImage = `${BASE_URL}/og-default.png`,
  ogType = "website",
  noindex = false,
  keywords,
  jsonLd,
}: SEOHeadProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);

    if (keywords) {
      setMeta("name", "keywords", keywords);
    } else {
      const existing = document.querySelector('meta[name="keywords"]');
      if (existing) existing.remove();
    }

    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    const canonicalUrl = `${BASE_URL}${path}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", OG_SITE_NAME);
    setMeta(
      "property",
      "og:locale",
      i18n.language === "pt"
        ? "pt_BR"
        : i18n.language === "es"
          ? "es_ES"
          : i18n.language === "fr"
            ? "fr_FR"
            : "en_US",
    );

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    document.querySelectorAll('script[data-seo-head="true"]').forEach((el) => el.remove());

    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const item of items) {
        const script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        script.setAttribute("data-seo-head", "true");
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
      }
    }

    return () => {
      document.querySelectorAll('script[data-seo-head="true"]').forEach((el) => el.remove());
    };
  }, [title, description, path, ogImage, ogType, noindex, keywords, jsonLd, i18n.language]);

  return null;
};
