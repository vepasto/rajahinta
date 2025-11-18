// Main entry point for graphs page
import { initTheme, setOnThemeChange } from './theme.js';
import { initCookieConsentHandlers } from './cookies.js';

// Set up theme change callback for chart reloading
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
    
    // Graphs-specific initialization will be added here
    // This includes chart loading, etc.
});

