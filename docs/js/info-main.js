// Main entry point for info page
import { initTheme } from './theme.js';
import { initCookieConsentHandlers } from './cookies.js';

// Initialize modules when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initCookieConsentHandlers();
});

