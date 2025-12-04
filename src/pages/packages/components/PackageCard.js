import { packageState, PACKAGES } from '../state/packageState.js';
import { calculateTotalDistance } from '../utils/routeOptimizer.js';

/**
 * Render package summary card
 * @param {Array} selectedPlaces - Current route places
 * @param {Object} userLocation - User's location
 * @returns {string} - HTML string
 */
export function renderPackageCard(selectedPlaces, userLocation) {
    const totalDist = calculateTotalDistance(selectedPlaces, userLocation);
    const pkg = PACKAGES[packageState.currentPackage];
    const isOverLimit = totalDist > pkg.maxDist;

    return `
        <div class="mx-2 mt-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-xl mb-6">
            <div class="flex justify-between items-center mb-3">
                <div>
                    <p class="text-blue-100 text-xs mb-1">Est. Total Distance</p>
                    <h2 class="text-2xl font-bold ${isOverLimit ? 'text-red-300' : ''}">${totalDist.toFixed(1)} <span class="text-sm">km</span></h2>
                </div>
                <div class="text-right">
                    <p class="text-blue-100 text-xs mb-1">Est. Travel Time</p>
                    <h2 class="text-2xl font-bold">${Math.ceil(totalDist / 20)} <span class="text-sm">hrs</span></h2>
                </div>
            </div>
            <div class="w-full bg-white/20 rounded-full h-2">
                <div class="${isOverLimit ? 'bg-red-600' : 'bg-white'} h-2 rounded-full transition-all" style="width: ${Math.min((totalDist / pkg.maxDist) * 100, 100)}%"></div>
            </div>
            <div class="flex justify-between items-center mt-2 text-xs text-blue-100">
                <span>${selectedPlaces.length} stops • Optimized</span>
                <span>Max: ${pkg.maxDist} km</span>
            </div>
        </div>
    `;
}
