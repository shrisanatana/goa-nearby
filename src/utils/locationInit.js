// Location Switcher Initialization
import { state, setState } from '../state/appState.js';
import { createLocationWidget } from '../components/LocationWidget.js';
import { isOutsideGoa, loadLocationPreferences, LOCATION_MODES } from '../services/locationService.js';

export function initializeLocationSwitcher() {
    // Load saved preferences
    const prefs = loadLocationPreferences();

    if (prefs) {
        if (prefs.savedLocation) {
            setState('savedLocation', prefs.savedLocation);
        }
        setState('locationMode', prefs.mode || LOCATION_MODES.CURRENT);
        state.hasSeenWelcome = prefs.hasSeenWelcome || false;
    }

    // Check if user is outside Goa
    if (state.userLocation) {
        state.isOutsideGoa = isOutsideGoa(
            state.userLocation.latitude,
            state.userLocation.longitude
        );
    }

    // Create floating widget
    createLocationWidget();
}
