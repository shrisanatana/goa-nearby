
import { state } from '../../../state/appState.js';
import { filterByCategory } from '../../../services/placesService.js';
import { scheduleRenderBatches, scheduleDistanceBatchCompute } from '../../../utils/batch.js';
import { updateLocationStatus, updateLocationTitle } from '../components/Header.js';
import { renderFilters } from '../components/CategoryFilters.js';

export function updatePlaces() {
    // Avoid heavy synchronous distance calculations here.
    // Render items immediately with distance=null so UI is responsive,
    // then compute distances in background batches.
    state.places = state.allPlaces.map(p => {
        // Preserve any existing computed distance if present and location hasn't changed
        // We don't have easy access to the "previous" state here unless we store it.
        // But state.places IS the previous state if we update it in place or reference it.
        // However, we are re-mapping placesData.
        // We can check if state.places has this item and if it has a distance.
        const existing = state.places.find(ep => ep.id === p.id);
        return { ...p, distance: (existing && existing.distance !== undefined ? existing.distance : null) };
    });

    state.filteredPlaces = filterByCategory(state.places, state.currentCategory);

    // Render quickly in incremental batches (cards will show placeholder for distance)
    scheduleRenderBatches(0);

    // Start background batch distance computation only if we have a location
    if (state.userLocation) {
        scheduleDistanceBatchCompute(0);
    }

    updateLocationStatus();
    updateLocationTitle();
}

// Attach to window for legacy onclick handlers if needed
window.updatePlaces = updatePlaces;
window.updateLocationTitle = updateLocationTitle;
