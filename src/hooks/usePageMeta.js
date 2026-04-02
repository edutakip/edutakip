import { useEffect } from 'react';

export function usePageMeta(config) {
  useEffect(() => {
    // Page Title
    if (config.title) {
      document.title = config.title;
      updateMetaTag('og:title', config.title);
      updateMetaTag('twitter:title', config.title);
    }

    // Meta Description
    if (config.description) {
      updateMetaTag('description', config.description);
      updateMetaTag('og:description', config.description);
      updateMetaTag('twitter:description', config.description);
    }

    // Keywords
    if (config.keywords) {
      updateMetaTag('keywords', config.keywords);
    }

    // OG Image
    if (config.ogImage) {
      updateMetaTag('og:image', config.ogImage);
      updateMetaTag('twitter:image', config.ogImage);
    }

    // Canonical URL
    if (config.canonical) {
      updateCanonical(config.canonical);
    }

    // Schema.org structured data
    if (config.schema) {
      updateSchemaScript(config.schema);
    }
  }, [config]);
}

function updateMetaTag(name, content) {
  let tag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      tag.setAttribute('property', name);
    } else {
      tag.setAttribute('name', name);
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function updateCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function updateSchemaScript(schema) {
  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}