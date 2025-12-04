import config from '../data/config.json';
import { calculateDistance } from '../utils/geolocation.js';
import placesData from '../data/places.json';

export async function fetchPlaces() {
    const CACHE_KEY = 'goa-nearby-places';
    const CACHE_TIME_KEY = 'goa-nearby-places-time';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const baseUrl = import.meta.env.DEV ? '/api/places' : 'https://goataxi.ltd/goa-nearby-data/places.json';

    try {
        // Try to get cached data first
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

        // If we have cached data, use it immediately
        if (cachedData) {
            console.log('Using cached places data');
            const parsed = JSON.parse(cachedData);

            // Check if cache is still fresh (less than 5 minutes old)
            const now = Date.now();
            const isCacheFresh = cacheTime && (now - parseInt(cacheTime)) < CACHE_DURATION;

            if (!isCacheFresh) {
                // Cache is stale, fetch fresh data in background (don't await)
                console.log('Cache is stale, updating in background...');
                fetchAndCachePlaces(baseUrl, CACHE_KEY, CACHE_TIME_KEY).catch(err => {
                    console.warn('Background update failed:', err);
                });
            } else {
                console.log('Cache is fresh, skipping background update');
            }

            return parsed;
        }

        // No cache, fetch and wait
        console.log('No cache found, fetching places...');
        return await fetchAndCachePlaces(baseUrl, CACHE_KEY, CACHE_TIME_KEY);

    } catch (error) {
        console.warn('Error fetching places, using local fallback:', error);
        return placesData;
    }
}

// Helper function to fetch and cache
async function fetchAndCachePlaces(baseUrl, cacheKey, cacheTimeKey) {
    const url = `${baseUrl}?t=${Date.now()}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Failed to fetch places: ${response.status}`);

    const data = await response.json();

    // Cache the data with timestamp
    try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
        console.log('Places data cached successfully');
    } catch (e) {
        console.warn('Failed to cache places:', e);
    }

    return data;
}

/**
 * Get all places with calculated distances from user location
 * @param {Array} places - Array of places
 * @param {Object} userLocation - User's current location {latitude, longitude}
 * @returns {Array} Places sorted by distance
 */
export function getPlacesWithDistances(places, userLocation) {
    if (!places) return [];
    if (!userLocation) {
        return places.map(place => ({
            ...place,
            distance: null
        }));
    }

    const placesWithDistance = places.map(place => ({
        ...place,
        distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            place.latitude,
            place.longitude
        )
    }));

    // Sort by distance (closest first)
    return placesWithDistance.sort((a, b) => a.distance - b.distance);
}

/**
 * Filter places by category
 * @param {Array} places - Array of places
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered places
 */
export function filterByCategory(places, category) {
    if (category === 'All') {
        return places;
    }
    return places.filter(place => place.category === category);
}

/**
 * Search places by name or tags
 * @param {Array} places - Array of places
 * @param {string} query - Search query
 * @returns {Array} Matching places
 */
export function searchPlaces(places, query) {
    if (!query || query.trim() === '') {
        return places;
    }

    const lowerQuery = query.toLowerCase();
    return places.filter(place =>
        place.name.toLowerCase().includes(lowerQuery) ||
        place.description.toLowerCase().includes(lowerQuery) ||
        place.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

/**
 * Get image URL for a place
 * @param {string} imageName - Image filename
 * @returns {string} Full image path
 */
export function getImageUrl(imageName) {
    if (imageName.startsWith('http') || imageName.startsWith('//')) {
        return imageName;
    }
    return `${import.meta.env.BASE_URL}images/${imageName}`;
}

/**
 * Get app configuration
 * @returns {Object} App config
 */
export function getConfig() {
    return config;
}
