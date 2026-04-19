import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();

function ensureGoogleAnalytics() {
  if (!MEASUREMENT_ID) return false;

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  if (!window.__hirexoGaScriptLoaded) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.setAttribute('data-hirexo-ga', 'script');
    document.head.appendChild(script);
    window.__hirexoGaScriptLoaded = true;
  }

  if (!window.__hirexoGaConfigured) {
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
    window.__hirexoGaConfigured = true;
  }

  return true;
}

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!ensureGoogleAnalytics()) return;

    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`
    });
  }, [location.pathname, location.search]);

  return null;
}
