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
  // Check if GA is already loaded
  if ((window as any).gtag) {
    return;
  }

  // Add Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SBRC1GSMZS';
  document.head.appendChild(script);

  script.onload = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-SBRC1GSMZS');
  };
}



