// Main entry point for calculator page
import { initTheme, setOnThemeChange } from './theme.js';
import { initCookieConsentHandlers } from './cookies.js';
import { trackCalculation } from './analytics.js';

// Set up theme change callback for chart reloading
setOnThemeChange(() => {
    // Reload charts when theme changes
    // Check if we're on calculator page and charts exist
    if (typeof window.createPriceChart === 'function' && window.currentChartData) {
        setTimeout(() => {
            window.createPriceChart(
                window.currentChartData.purchaseYear,
                window.currentChartData.purchaseMonth,
                window.currentChartData.originalPrice,
                window.currentChartData.apartmentSize || null,
                window.currentChartData.winner || null
            );
            
            // Recreate modal chart if it's open
            const chartModal = document.getElementById('chartModal');
            if (chartModal && chartModal.style.display === 'flex' && window.priceChartInstance) {
                if (typeof window.createModalChart === 'function') {
                    window.createModalChart();
                }
            }
        }, 100);
    }
    
    // Also check for graphs page charts
    if (typeof window.loadIndicesCharts === 'function') {
        setTimeout(window.loadIndicesCharts, 100);
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

