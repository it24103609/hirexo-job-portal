import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { siteContent } from '../../data/siteContent';

function toTitleCase(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getBaseUrl() {
  return import.meta.env.VITE_SITE_URL || window.location.origin;
}

function setTag(tagName, key, attributes) {
  const selector = `${tagName}[data-seo-key="${key}"]`;
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement(tagName);
    element.setAttribute('data-seo-key', key);
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([attribute, value]) => {
    if (value === undefined || value === null || value === '') {
      element.removeAttribute(attribute);
    } else {
      element.setAttribute(attribute, String(value));
    }
  });

  return element;
}

function buildBreadcrumbSchema(pathname, baseUrl) {
  const segments = pathname.split('/').filter(Boolean);

  if (!segments.length) {
    return null;
  }

  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl
    }
  ];

  segments.forEach((segment, index) => {
    const itemPath = `/${segments.slice(0, index + 1).join('/')}`;
    itemListElement.push({
      '@type': 'ListItem',
      position: index + 2,
      name: toTitleCase(segment),
      item: new URL(itemPath, baseUrl).toString()
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  };
}

function normalizeStructuredData(structuredData) {
  if (!structuredData) {
    return [];
  }

  return Array.isArray(structuredData) ? structuredData : [structuredData];
}

export default function Seo({
  title,
  description,
  image,
  type = 'website',
  noIndex = false,
  structuredData
}) {
  const location = useLocation();

  useEffect(() => {
    const baseUrl = getBaseUrl();
    const canonicalUrl = new URL(location.pathname, baseUrl).toString();
    const pageTitle = title || siteContent.brandName;
    const pageDescription = description || siteContent.aboutIntro;
    const pageImage = image || `${baseUrl}/favicon.svg`;
    const robots = noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
    const schemaItems = [];

    document.title = pageTitle;

    setTag('meta', 'description', { name: 'description', content: pageDescription });
    setTag('meta', 'robots', { name: 'robots', content: robots });
    setTag('link', 'canonical', { rel: 'canonical', href: canonicalUrl });
    setTag('meta', 'og:type', { property: 'og:type', content: type });
    setTag('meta', 'og:site_name', { property: 'og:site_name', content: siteContent.brandName });
    setTag('meta', 'og:title', { property: 'og:title', content: pageTitle });
    setTag('meta', 'og:description', { property: 'og:description', content: pageDescription });
    setTag('meta', 'og:url', { property: 'og:url', content: canonicalUrl });
    setTag('meta', 'og:image', { property: 'og:image', content: pageImage });
    setTag('meta', 'twitter:card', { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
    setTag('meta', 'twitter:title', { name: 'twitter:title', content: pageTitle });
    setTag('meta', 'twitter:description', { name: 'twitter:description', content: pageDescription });
    setTag('meta', 'twitter:image', { name: 'twitter:image', content: pageImage });

    schemaItems.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      inLanguage: 'en'
    });

    const breadcrumbSchema = buildBreadcrumbSchema(location.pathname, baseUrl);
    if (breadcrumbSchema) {
      schemaItems.push(breadcrumbSchema);
    }

    if (location.pathname === '/') {
      schemaItems.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteContent.brandName,
        url: baseUrl,
        logo: `${baseUrl}/favicon.svg`
      });

      schemaItems.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteContent.brandName,
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/jobs?keyword={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      });
    }

    normalizeStructuredData(structuredData).forEach((item) => schemaItems.push(item));

    let schemaScript = document.head.querySelector('script[data-seo-key="structured-data"]');
    if (!schemaItems.length) {
      if (schemaScript) schemaScript.remove();
      return;
    }

    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.setAttribute('data-seo-key', 'structured-data');
      document.head.appendChild(schemaScript);
    }

    schemaScript.textContent = JSON.stringify(schemaItems.length === 1 ? schemaItems[0] : schemaItems);
  }, [description, image, location.pathname, noIndex, structuredData, title, type]);

  return null;
}
