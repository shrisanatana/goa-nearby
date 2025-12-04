/**
 * Simple hash-based router for static hosting compatibility
 */

export function navigateTo(path) {
    window.location.hash = path;
}

export function getCurrentRoute() {
    // Get hash, remove the '#' prefix, default to '/' if empty
    const hash = window.location.hash.slice(1);
    return hash || '/';
}

export function onRouteChange(callback) {
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        callback(getCurrentRoute());
    });

    // Call immediately for initial route
    callback(getCurrentRoute());
}
