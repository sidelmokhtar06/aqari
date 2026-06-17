// Analytics module for Vercel Web Analytics
// Tracks page views, user interactions, and custom events

export function initVercelAnalytics() {
  // Inject Vercel Web Analytics script
  if (!window.__vercelAnalyticsId) {
    const script = document.createElement('script');
    script.async = true;
    script.src = '/_vercel/insights/script.js';
    document.head.appendChild(script);
  }
}

// Track custom events
export function trackEvent(eventName, data = {}) {
  // Send to Vercel Web Analytics via navigator.sendBeacon if available
  if (typeof window !== 'undefined' && navigator && navigator.sendBeacon) {
    try {
      navigator.sendBeacon('/_vercel/insights/event', JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        ...data,
      }));
    } catch (e) {
      console.error('Analytics error:', e);
    }
  }
}

// Track listing view
export function trackListingView(listingId, title) {
  trackEvent('listing_view', {
    listing_id: listingId,
    title: title,
  });
}

// Track listing contact (WhatsApp click)
export function trackListingContact(listingId, title) {
  trackEvent('listing_contact', {
    listing_id: listingId,
    title: title,
  });
}

// Track search
export function trackSearch(query, filters = {}) {
  trackEvent('search', {
    query: query,
    ...filters,
  });
}

// Track property posting
export function trackPostListing(propertyType) {
  trackEvent('post_listing', {
    property_type: propertyType,
  });
}

// Track language toggle
export function trackLanguageToggle(language) {
  trackEvent('language_toggle', {
    language: language,
  });
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVercelAnalytics);
} else {
  initVercelAnalytics();
}
