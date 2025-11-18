// Google Analytics event tracking helpers

export function trackEvent(eventName, eventParams = {}) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventParams);
    }
}

export function trackCalculation(price, isAuto = false) {
    trackEvent(isAuto ? 'auto_calculation' : 'calculation', {
        'event_category': 'calculator',
        'event_label': isAuto ? 'auto_price_calculation' : 'price_calculation',
        'value': Math.round(price || 0),
        'non_interaction': isAuto
    });
}

