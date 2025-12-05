import { state } from '../../../state/appState.js';
import { renderPlaceCard } from './PlaceCard.js';
import { calculateDistance } from '../../../utils/geolocation.js';
import { LOCATION_MODES } from '../../../services/locationService.js';

/**
 * Render route timeline with all places
 * @param {Array} selectedPlaces - Route places
 * @param {Object} effectiveLocation - Effective location (current or saved)
 * @param {Object} appState - App state for location mode
 * @returns {string} - HTML string
 */
export function renderRouteTimeline(selectedPlaces, effectiveLocation, appState) {
    // Determine location name based on mode
    const locationName = appState.locationMode === LOCATION_MODES.CURRENT
        ? 'Your Location'
        : (appState.savedLocation?.name || 'Selected Location');

    return `
        <div class="">
            <!-- Start Point -->
            <div class="mx-2 flex items-center p-3 bg-green-50 rounded-xl border-l-4 border-green-500">
                <div class="text-2xl">📍</div>
                <div class="flex-1">
                    <h3 class="font-bold text-gray-900 text-sm">${locationName}</h3>
                    <p class="text-xs text-gray-500">Starting Point</p>
                </div>
            </div>

                              <!-- Stops -->
                     ${selectedPlaces.map((place, index) => {
        const prevLoc = index === 0 ? effectiveLocation : selectedPlaces[index - 1];
        return renderPlaceCard(place, index, prevLoc);
    }).join('')}

            <!-- Return Distance -->
            <div class="text-center py-1">
                <span class="text-xs text-gray-400">↓ ${selectedPlaces.length > 0 ? calculateDistance(selectedPlaces[selectedPlaces.length - 1].latitude, selectedPlaces[selectedPlaces.length - 1].longitude, effectiveLocation.latitude, effectiveLocation.longitude).toFixed(1) : 0} km</span>
            </div>
            
            <!-- End Point -->
            <div class="mx-2 flex items-center p-3 bg-red-50 rounded-xl border-l-4 border-red-500">
                <div class="text-2xl">🏁 </div>
                <div class="flex-1">
                    <h3 class="font-bold text-gray-900 text-sm">${locationName}</h3>
                    <p class="text-xs text-gray-500">Complete the loop</p>
                </div>
            </div>
        </div>
    `;
}
