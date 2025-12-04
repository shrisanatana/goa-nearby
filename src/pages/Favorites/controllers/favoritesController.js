import { state, setState } from '../../../state/appState.js';
import { showToast } from '../../../components/Toast.js';

export function isFavorite(placeId) {
    return state.favorites.includes(placeId);
}

export function toggleFavorite(placeId) {
    const index = state.favorites.indexOf(placeId);
    let newFavorites;
    let message;

    if (index === -1) {
        newFavorites = [...state.favorites, placeId];
        message = 'Added to favorites';
    } else {
        newFavorites = state.favorites.filter(id => id !== placeId);
        message = 'Removed from favorites';
    }

    // Update state
    setState('favorites', newFavorites);

    // Persist to localStorage
    localStorage.setItem('favorites', JSON.stringify(newFavorites));

    // Show feedback
    showToast(message);

    // Return true if now favorite, false otherwise
    return index === -1;
}
