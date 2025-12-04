import goaLocations from '../data/goaLocations.json';
import { calculateDistance } from '../utils/geolocation.js';

const PANAJI_COORDS = { latitude: 15.4909, longitude: 73.8278 };
const GOA_BOUNDARY_KM = 100;
const STORAGE_KEY = 'goa-nearby-location-prefs';

// Location modes
export const LOCATION_MODES = {
    CURRENT: 'current',
    SAVED: 'saved',
    CUSTOM: 'custom'
};

/**
 * Check if coordinates are outside Goa
 */
export function isOutsideGoa(latitude, longitude) {
    const distance = calculateDistance(
        latitude,
        longitude,
        PANAJI_COORDS.latitude,
        PANAJI_COORDS.longitude
    );
    return distance > GOA_BOUNDARY_KM;
}

/**
 * Get AI-powered location suggestions based on user preferences and context
 * Uses rule-based AI to simulate intelligence without external API costs
 */
export function getSmartSuggestions(userPreferences = {}) {
    const { vibe } = userPreferences;
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Context weights
    const weights = {
        vibeMatch: 50,
        timeContext: 20,
        dayContext: 30,
        popularity: 10
    };

    // Helper to check time context
    const isMorning = hour >= 5 && hour < 11;
    const isAfternoon = hour >= 11 && hour < 16;
    const isEvening = hour >= 16 && hour < 19;
    const isNight = hour >= 19 || hour < 5;

    // Helper to check day context
    const isWeekend = day === 0 || day === 6;
    const isWednesday = day === 3;
    const isSaturday = day === 6;

    // Score each location
    const scoredLocations = goaLocations.locations.map(loc => {
        let score = 0;
        let reasons = [];

        // 1. Vibe Match (Highest Priority)
        if (vibe) {
            if (loc.vibe.includes(vibe)) {
                score += weights.vibeMatch;
                reasons.push(`Matches your ${vibe} vibe`);
            } else if (goaLocations.vibeCategories[vibe] && goaLocations.vibeCategories[vibe].includes(loc.id)) {
                score += weights.vibeMatch;
                reasons.push(`Great for ${vibe}`);
            }
        }

        // 2. Time of Day Context
        if (isMorning) {
            if (loc.vibe.includes('peaceful') || loc.vibe.includes('nature') || loc.type === 'village') {
                score += weights.timeContext;
                reasons.push('Perfect for a peaceful morning');
            }
        } else if (isAfternoon) {
            if (loc.vibe.includes('shopping') || loc.vibe.includes('cultural') || loc.vibe.includes('water sports')) {
                score += weights.timeContext;
                reasons.push('Great for afternoon activities');
            }
        } else if (isEvening) {
            if (loc.vibe.includes('scenic') || loc.vibe.includes('romantic') || loc.type === 'beach') {
                score += weights.timeContext;
                reasons.push('Beautiful sunset views');
            }
        } else if (isNight) {
            if (loc.vibe.includes('party') || loc.vibe.includes('nightlife') || loc.vibe.includes('luxury')) {
                score += weights.timeContext;
                reasons.push('Alive at night');
            }
        }

        // 3. Day of Week Context (Specific Events)
        if (isWednesday && loc.id === 'anjuna') {
            score += weights.dayContext;
            reasons.push('Famous Wednesday Flea Market');
        }
        if (isSaturday && loc.id === 'arpora') {
            score += weights.dayContext;
            reasons.push('Saturday Night Market');
        }
        if (isWeekend && (loc.vibe.includes('party') || loc.popular)) {
            score += 5; // Slight boost for popular spots on weekends
        }

        // 4. Popularity (Base Score)
        if (loc.popular) {
            score += weights.popularity;
        }

        return { ...loc, score, aiReason: reasons[0] || 'Popular choice' };
    });

    // Sort by score
    scoredLocations.sort((a, b) => b.score - a.score);

    return scoredLocations.slice(0, 6);
}

/**
 * Get AI Context message explaining the current suggestions
 */
export function getAIContext() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    let timeMsg = '';
    if (hour >= 5 && hour < 11) timeMsg = "Good morning! Here are some peaceful spots to start your day.";
    else if (hour >= 11 && hour < 16) timeMsg = "It's bright outside! Check out these active spots.";
    else if (hour >= 16 && hour < 19) timeMsg = "Sunset time! These places offer great views.";
    else timeMsg = "Ready for the night? Here's where the action is.";

    if (day === 3) return "It's Wednesday - Don't miss the Anjuna Flea Market!";
    if (day === 6) return "It's Saturday - Arpora Night Market is the place to be!";

    return timeMsg;
}

/**
 * Get travel time estimate between two locations (in minutes)
 * This is a simplified calculation - in production, use Google Maps API
 */
export function estimateTravelTime(fromLat, fromLng, toLat, toLng) {
    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
    // Assume average speed of 30 km/h in Goa (accounting for traffic)
    const timeInHours = distance / 30;
    return Math.round(timeInHours * 60); // Convert to minutes
}

/**
 * Get estimated travel cost (taxi fare in INR)
 */
export function estimateTravelCost(fromLat, fromLng, toLat, toLng) {
    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
    // Base fare: ₹100, ₹20 per km
    const baseFare = 100;
    const perKmRate = 20;
    return Math.round(baseFare + (distance * perKmRate));
}

/**
 * Get location by ID
 */
export function getLocationById(id) {
    return goaLocations.locations.find(loc => loc.id === id);
}

/**
 * Get all locations
 */
export function getAllLocations() {
    return goaLocations.locations;
}

/**
 * Get popular locations
 */
export function getPopularLocations() {
    return goaLocations.locations.filter(loc =>
        goaLocations.popularLocations.includes(loc.id)
    );
}

/**
 * Get locations by type
 */
export function getLocationsByType(type) {
    return goaLocations.locations.filter(loc => loc.type === type);
}

/**
 * Get locations by vibe
 */
export function getLocationsByVibe(vibe) {
    const vibeLocationIds = goaLocations.vibeCategories[vibe] || [];
    return goaLocations.locations.filter(loc =>
        vibeLocationIds.includes(loc.id)
    );
}

/**
 * Search locations by name
 */
export function searchLocations(query) {
    const lowerQuery = query.toLowerCase();
    return goaLocations.locations.filter(loc =>
        loc.name.toLowerCase().includes(lowerQuery) ||
        loc.description.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Save location preferences to localStorage
 */
export function saveLocationPreferences(preferences) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...preferences,
            lastUpdated: new Date().toISOString()
        }));
        return true;
    } catch (error) {
        console.error('Failed to save location preferences:', error);
        return false;
    }
}

/**
 * Load location preferences from localStorage
 */
export function loadLocationPreferences() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to load location preferences:', error);
        return null;
    }
}

/**
 * Get effective location for distance calculations
 */
export function getEffectiveLocation(state) {
    const { locationMode, userLocation, savedLocation } = state;

    if (locationMode === LOCATION_MODES.CURRENT && userLocation) {
        return userLocation;
    } else if (locationMode === LOCATION_MODES.SAVED && savedLocation) {
        return savedLocation;
    } else if (locationMode === LOCATION_MODES.CUSTOM && savedLocation) {
        return savedLocation;
    }

    // Fallback to Panaji
    return PANAJI_COORDS;
}

/**
 * Get smart itinerary suggestions based on stay duration
 */
export function getItinerarySuggestions(stayDays, baseLocation) {
    const suggestions = [];

    if (stayDays <= 2) {
        // Short stay - focus on nearby popular spots
        suggestions.push({
            day: 1,
            areas: ['Explore your area', 'Visit nearby beach'],
            locations: getPopularLocations().slice(0, 3)
        });
    } else if (stayDays <= 4) {
        // Medium stay - mix of beaches and culture
        suggestions.push(
            {
                day: 1,
                theme: 'Beaches',
                locations: getLocationsByType('beach').slice(0, 3)
            },
            {
                day: 2,
                theme: 'Culture & Heritage',
                locations: getLocationsByType('historical')
            }
        );
    } else {
        // Long stay - comprehensive tour
        suggestions.push(
            {
                day: 1,
                theme: 'North Goa Beaches',
                locations: getLocationsByVibe('party')
            },
            {
                day: 2,
                theme: 'South Goa Serenity',
                locations: getLocationsByVibe('peaceful')
            },
            {
                day: 3,
                theme: 'Heritage & Culture',
                locations: getLocationsByType('historical')
            }
        );
    }

    return suggestions;
}

/**
 * Get location vibe emoji
 */
export function getVibeEmoji(vibe) {
    const emojiMap = {
        party: '🎉',
        peaceful: '🌊',
        romantic: '💕',
        family: '👨‍👩‍👧‍👦',
        adventure: '🏄',
        cultural: '🏛️',
        luxury: '✨',
        bohemian: '🌺',
        hippie: '🌈',
        nightlife: '🌙',
        artistic: '🎨',
        local: '🏘️',
        nature: '🌿',
        historical: '📜',
        scenic: '📸',
        shopping: '🛍️',
        upscale: '💎',
        transit: '🚂'
    };

    return emojiMap[vibe] || '📍';
}

/**
 * Get location type emoji
 */
export function getTypeEmoji(type) {
    const emojiMap = {
        beach: '🏖️',
        city: '🏙️',
        town: '🏘️',
        village: '🏡',
        historical: '🏛️',
        airport: '✈️',
        railway_station: '🚂'
    };

    return emojiMap[type] || '📍';
}
