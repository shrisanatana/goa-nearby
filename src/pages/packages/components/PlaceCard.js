import { shouldShowImage } from '../utils/imageValidator.js';
import { getImageUrl } from '../../../services/placesService.js';
import { calculateDistance } from '../../../utils/geolocation.js';

/**
 * Render individual place card
 * @param {Object} place - Place object
 * @param {number} index - Index in route
 * @param {Object} prevLoc - Previous location
 * @param {Function} onRemove - Remove callback
 * @returns {string} - HTML string
 */
export function renderPlaceCard(place, index, prevLoc, onRemove) {
    const dist = calculateDistance(prevLoc.latitude, prevLoc.longitude, place.latitude, place.longitude);
    const hasImage = shouldShowImage(place.image);

    return `
        <!-- Distance Badge -->
        <div class="text-center py-1">
            <span class="text-xs text-gray-400">↓ ${dist.toFixed(1)} km</span>
        </div>
        
        <!-- Place Card -->
        <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-200 mx-3">
            <div class="flex items-start gap-3">
                ${hasImage ? `
                <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src="${getImageUrl(place.image)}" class="w-full h-full object-cover" onerror="this.src='${import.meta.env.BASE_URL}default-place.png'" />
                </div>
                ` : `
                <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-white text-lg font-bold">${place.name.charAt(0)}</span>
                </div>
                `}
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-1">
                        <h3 class="font-bold text-gray-900 text-sm">${place.name}</h3>
                        <button onclick="window.removePackagePlace(${place.id})" class="flex-shrink-0 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-sm transition-colors" title="Remove">
                            ×
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 line-clamp-2 mb-2">${place.description}</p>
                    <span class="inline-block text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">${place.category}</span>
                </div>
            </div>
        </div>
    `;
}
