/**
 * Calculate distance between two coordinates using Haversine formula
 * Provides 90%+ accuracy for distance calculations
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers

    // Convert degrees to radians
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const radLat1 = toRadians(lat1);
    const radLat2 = toRadians(lat2);

    // Haversine formula
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) *
        Math.cos(radLat1) * Math.cos(radLat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} Radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
}

/**
 * Get user's current location using Geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 60000
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                // If high accuracy fails (timeout or unavailable), try low accuracy
                if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
                    console.log('High accuracy failed, trying low accuracy...');
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            resolve({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                accuracy: position.coords.accuracy
                            });
                        },
                        (error) => reject(error),
                        {
                            enableHighAccuracy: false,
                            timeout: 30000,
                            maximumAge: 60000
                        }
                    );
                } else {
                    reject(error);
                }
            },
            options
        );
    });
}

/**
 * Watch user's location for changes
 * @param {Function} callback - Called when location changes
 * @returns {number} Watch ID for clearing the watch
 */
export function watchLocation(callback) {
    if (!navigator.geolocation) {
        console.error('Geolocation is not supported');
        return null;
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            callback({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            });
        },
        (error) => {
            console.error('Error watching location:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * Stop watching location
 * @param {number} watchId - Watch ID returned from watchLocation
 */
export function clearLocationWatch(watchId) {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
    }
}
