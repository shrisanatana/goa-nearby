import { calculateDistance } from '../../../utils/geolocation.js';

/**
 * Optimize route using nearest-neighbor algorithm
 * @param {Array} places - Array of places to visit
 * @param {Object} userLocation - Starting location {latitude, longitude}
 * @returns {Array} - Optimized array of places
 */
export function optimizeRoute(places, userLocation) {
    if (!places || places.length <= 1 || !userLocation) return places;

    const optimized = [];
    let currentLoc = userLocation;
    let remaining = [...places];

    while (remaining.length > 0) {
        // Find nearest place from current location
        let nearestIndex = 0;
        let minDist = calculateDistance(
            currentLoc.latitude,
            currentLoc.longitude,
            remaining[0].latitude,
            remaining[0].longitude
        );

        for (let i = 1; i < remaining.length; i++) {
            const dist = calculateDistance(
                currentLoc.latitude,
                currentLoc.longitude,
                remaining[i].latitude,
                remaining[i].longitude
            );

            if (dist < minDist) {
                minDist = dist;
                nearestIndex = i;
            }
        }

        // Add nearest place to optimized route
        const nearestPlace = remaining.splice(nearestIndex, 1)[0];
        optimized.push(nearestPlace);
        currentLoc = nearestPlace;
    }

    return optimized;
}

/**
 * Generate optimized route within distance limit
 * @param {Array} allPlaces - All available places
 * @param {Object} userLocation - Starting location
 * @param {number} maxDistance - Maximum distance limit in km
 * @param {Array} excludedCategories - Categories to exclude
 * @returns {Array} - Optimized route within limit
 */
export function generateOptimizedRoute(allPlaces, userLocation, maxDistance, excludedCategories = []) {
    if (!userLocation || !allPlaces.length) return [];

    // Filter by excluded categories
    let available = allPlaces.filter(p => !excludedCategories.includes(p.category));

    // Filter places within reasonable range
    available = available.filter(p => {
        const dist = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            p.latitude,
            p.longitude
        );
        return dist < maxDistance;
    });

    if (available.length === 0) return [];

    // Use nearest-neighbor algorithm to build route
    const route = [];
    let currentLoc = userLocation;
    let remainingPlaces = [...available];

    while (remainingPlaces.length > 0) {
        // Find nearest unvisited place
        let nearestPlace = null;
        let minDistance = Infinity;
        let nearestIndex = -1;

        remainingPlaces.forEach((place, index) => {
            const dist = calculateDistance(
                currentLoc.latitude,
                currentLoc.longitude,
                place.latitude,
                place.longitude
            );

            if (dist < minDistance) {
                minDistance = dist;
                nearestPlace = place;
                nearestIndex = index;
            }
        });

        if (!nearestPlace) break;

        // Calculate total distance if we add this place
        const distToPlace = minDistance;
        const distBackToStart = calculateDistance(
            nearestPlace.latitude,
            nearestPlace.longitude,
            userLocation.latitude,
            userLocation.longitude
        );

        // Calculate current total
        let currentTotal = 0;
        let tempLoc = userLocation;
        route.forEach(p => {
            currentTotal += calculateDistance(tempLoc.latitude, tempLoc.longitude, p.latitude, p.longitude);
            tempLoc = p;
        });

        // Check if adding this place keeps us within limit
        if (currentTotal + distToPlace + distBackToStart <= maxDistance) {
            route.push(nearestPlace);
            currentLoc = nearestPlace;
            remainingPlaces.splice(nearestIndex, 1);
        } else {
            // Can't add more places without exceeding limit
            break;
        }
    }

    return route;
}

/**
 * Calculate total distance for a route
 * @param {Array} places - Route places
 * @param {Object} userLocation - Starting location
 * @returns {number} - Total distance in km
 */
export function calculateTotalDistance(places, userLocation) {
    if (!userLocation || !places || places.length === 0) return 0;

    let total = 0;
    let lastLoc = userLocation;

    places.forEach(place => {
        total += calculateDistance(lastLoc.latitude, lastLoc.longitude, place.latitude, place.longitude);
        lastLoc = place;
    });

    // Add return trip
    total += calculateDistance(lastLoc.latitude, lastLoc.longitude, userLocation.latitude, userLocation.longitude);

    return total;
}
