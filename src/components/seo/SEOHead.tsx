import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const BASE_URL = "https://masseurmatch.com";
const SUPPORTED_LANGS = ["en", "es", "pt", "fr"];

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
 * Manages title, description, canonical, OG, Twitter, hreflang.
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
    // Title
    document.title = title;

    // Helper to set/create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Description
    setMeta("name", "description", description);

    // Keywords
    if (keywords) {
      setMeta("name", "keywords", keywords);
    } else {
      const existing = document.querySelector('meta[name="keywords"]');
      if (existing) existing.remove();
    }

    // Robots
    if (noindex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      const existing = document.querySelector('meta[name="robots"]');
      if (existing) existing.remove();
    }

    // Canonical
    const canonicalUrl = `${BASE_URL}${path}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", "MasseurMatch — Gay Massage Directory");
    setMeta("property", "og:locale", i18n.language === "pt" ? "pt_BR" : i18n.language === "es" ? "es_ES" : i18n.language === "fr" ? "fr_FR" : "en_US");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    // Hreflang tags
    // Remove old hreflang
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());

    for (const lang of SUPPORTED_LANGS) {
      const link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", lang);
      link.setAttribute("href", `${BASE_URL}${path}?lang=${lang}`);
      document.head.appendChild(link);
    }
    // x-default
    const xdef = document.createElement("link");
    xdef.setAttribute("rel", "alternate");
    xdef.setAttribute("hreflang", "x-default");
    xdef.setAttribute("href", `${BASE_URL}${path}`);
    document.head.appendChild(xdef);

    // JSON-LD
    // Remove previously injected
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
      // Cleanup dynamic hreflang and JSON-LD on unmount
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
      document.querySelectorAll('script[data-seo-head="true"]').forEach((el) => el.remove());
    };
  }, [title, description, path, ogImage, ogType, noindex, jsonLd, i18n.language]);

  return null;
};
