// Cookie consent and Google Analytics management

const GA_ID = 'G-SBRC1GSMZS';

export function loadGoogleAnalytics() {
    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
}

export function initCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    const banner = document.getElementById('cookieConsent');

    if (!consent && banner) {
        banner.classList.add('show');
    } else if (consent === 'accepted') {
        loadGoogleAnalytics();
    }
}

export function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    const banner = document.getElementById('cookieConsent');
    if (banner) {
        banner.classList.remove('show');
    }
    loadGoogleAnalytics();
}

export function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    const banner = document.getElementById('cookieConsent');
    if (banner) {
        banner.classList.remove('show');
    }
}

export function initCookieConsentHandlers() {
    initCookieConsent();

    const acceptBtn = document.getElementById('cookieAccept');
    const declineBtn = document.getElementById('cookieDecline');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', acceptCookies);
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', declineCookies);
    }
}

