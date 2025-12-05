import { state, subscribe } from '../../state/appState.js';
import { renderPlaceCard } from '../Home/components/PlaceCard.js';
import { hideMainContent } from '../../utils/dom.js';

let locationSubscription = null;

export function showFavorites() {
  hideMainContent();

  // Hide packages page if visible
  const packagesPage = document.getElementById('packages-page');
  if (packagesPage) packagesPage.classList.add('hidden');

  let favoritesPage = document.getElementById('favorites-page');
  if (!favoritesPage) {
    favoritesPage = document.createElement('div');
    favoritesPage.id = 'favorites-page';
    favoritesPage.className = 'container mx-auto px-4 py-4 pb-24';
    document.querySelector('#app').appendChild(favoritesPage);
  }

  favoritesPage.classList.remove('hidden');

  // Subscribe to location changes
  if (!locationSubscription) {
    locationSubscription = subscribe((event, data) => {
      if (event === 'locationMode' || event === 'savedLocation') {
        // Refresh favorites page when location changes
        renderFavoritesContent();
      }
    });
  }

  // Initial render
  renderFavoritesContent();
}

function renderFavoritesContent() {
  const favoritesPage = document.getElementById('favorites-page');
  if (!favoritesPage) return;

  // Filter places that are in favorites
  const favoritePlaces = state.places.filter(place => state.favorites.includes(place.id));

  const headerHTML = `
    <div class="mb-6 flex items-center gap-3">
      <button onclick="window.navigateTo('/')" class="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Go back">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </button>
      <div>
        <h2 class="text-2xl font-bold text-gray-800">My Favorites</h2>
        <p class="text-gray-600">${favoritePlaces.length} places saved</p>
      </div>
    </div>
  `;

  if (favoritePlaces.length === 0) {
    favoritesPage.innerHTML = `
      ${headerHTML}
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="bg-gray-100 p-4 rounded-full mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
        <p class="text-gray-500 max-w-xs">Start exploring and tap the heart icon to save your favorite places here.</p>
        <button onclick="window.navigateToCategory('All')" class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
          Explore Places
        </button>
      </div>
    `;
    return;
  }

  favoritesPage.innerHTML = `
    ${headerHTML}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      ${favoritePlaces.map(renderPlaceCard).join('')}
    </div>
  `;
}
