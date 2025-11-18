// Main entry point for calculator page
import { initTheme, setOnThemeChange } from './theme.js';
import { initCookieConsentHandlers } from './cookies.js';
import { trackCalculation } from './analytics.js';

// Set up theme change callback for chart reloading
// This will be implemented when we refactor the chart code
setOnThemeChange(() => {
    // Reload charts when theme changes
    if (typeof loadIndicesCharts === 'function') {
        setTimeout(loadIndicesCharts, 100);
    }
});

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initCookieConsentHandlers();
    
    // Calculator-specific initialization will be added here
    // This includes form handling, chart loading, etc.
});

// Export trackCalculation for use in calculator code
window.trackCalculation = trackCalculation;

