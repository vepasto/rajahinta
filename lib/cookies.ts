// Cookie consent management
export function initCookieConsent() {
  const consent = localStorage.getItem('cookieConsent');
  const banner = document.getElementById('cookieConsent');

  if (consent === 'accepted') {
    loadGoogleAnalytics();
    if (banner) banner.style.display = 'none';
  } else if (consent === 'declined') {
    if (banner) banner.style.display = 'none';
  } else {
    if (banner) banner.style.display = 'block';
  }

  const acceptBtn = document.getElementById('cookieAccept');
  const declineBtn = document.getElementById('cookieDecline');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      loadGoogleAnalytics();
      if (banner) banner.style.display = 'none';
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'declined');
      if (banner) banner.style.display = 'none';
    });
  }
}

function loadGoogleAnalytics() {
  // Check if gtag is available
  if (typeof (window as any).gtag !== 'function') {
    console.warn('Google Analytics not loaded. Make sure NEXT_PUBLIC_GA_ID is set.');
    return;
  }

  // Update consent to allow analytics
  (window as any).gtag('consent', 'update', {
    'analytics_storage': 'granted'
  });
}



