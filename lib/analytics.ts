// Analytics helper functions
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (
    localStorage.getItem('cookieConsent') === 'accepted' &&
    typeof (window as any).gtag === 'function'
  ) {
    (window as any).gtag('event', eventName, eventParams);
  }
}

export function trackCalculation() {
  trackEvent('price_calculation', {
    event_category: 'calculation',
    event_label: 'manual',
  });
}

