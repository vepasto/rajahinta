// Theme management module
let isInitialThemeLoad = true;

// Callback for theme change (e.g., to reload charts)
let onThemeChangeCallback = null;

export function setOnThemeChange(callback) {
    onThemeChangeCallback = callback;
}

export function setTheme(theme, isUserAction = false) {
    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');
    let actualTheme = theme;
    
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.documentElement.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        if (lightIcon) lightIcon.classList.remove('active');
        if (darkIcon) darkIcon.classList.add('active');
        localStorage.setItem('theme', 'dark');
        actualTheme = 'dark';
    } else if (theme === 'light') {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        if (lightIcon) lightIcon.classList.add('active');
        if (darkIcon) darkIcon.classList.remove('active');
        localStorage.setItem('theme', 'light');
        actualTheme = 'light';
    } else {
        // Auto mode - follow system preference
        document.documentElement.classList.remove('dark-mode', 'light-mode');
        document.body.classList.remove('dark-mode', 'light-mode');
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (lightIcon) lightIcon.classList.toggle('active', !isDark);
        if (darkIcon) darkIcon.classList.toggle('active', isDark);
        localStorage.removeItem('theme');
        actualTheme = isDark ? 'dark' : 'light';
    }
    
    // Track theme usage in Google Analytics (if consent given)
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'theme_change', {
            'event_category': 'ui',
            'event_label': actualTheme,
            'value': actualTheme === 'dark' ? 1 : 0,
            'non_interaction': !isUserAction && isInitialThemeLoad
        });
    }
    
    // Mark that initial load is done
    if (isInitialThemeLoad) {
        isInitialThemeLoad = false;
    }
    
    // Call callback if set (e.g., to reload charts)
    if (onThemeChangeCallback) {
        onThemeChangeCallback();
    }
}

export function toggleTheme() {
    // Check if currently in dark mode (either manually set or from system preference)
    const isDarkNow = document.body.classList.contains('dark-mode') || 
                     (!document.body.classList.contains('light-mode') && 
                      window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Toggle between dark and light
    if (isDarkNow) {
        setTheme('light', true); // true = user action
    } else {
        setTheme('dark', true); // true = user action
    }
}

export function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(null); // Auto mode
    }
}

