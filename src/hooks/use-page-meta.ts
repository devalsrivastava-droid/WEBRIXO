import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  /** Route path used for canonical + og:url, e.g. "/" or "/demos/brew" */
  path?: string;
  /** Optional og:image override (defaults to /og-image.svg) */
  ogImage?: string;
}

const SITE = "https://webrixo.com";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Sets per-page <title>, meta description, canonical, and Open Graph tags.
 * Call at the top of each page component.
 */
export function usePageMeta({ title, description, path = "/", ogImage = "/og-image.svg" }: PageMeta) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", SITE + path);
    setMeta("property", "og:image", SITE + ogImage);
    setMeta("property", "og:site_name", "WEBRIXO");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", SITE + ogImage);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", SITE + path);
  }, [title, description, path, ogImage]);
}