
import { state } from '../../../state/appState.js';
import { searchPlaces, getImageUrl } from '../../../services/placesService.js';
import { calculateDistance, formatDistance } from '../../../utils/geolocation.js';

export function getSearchOverlayHTML() {
  return `
    <div id="search-overlay" class="fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-out translate-y-full">
      <div class="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
        <button onclick="toggleSearch()" class="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            id="search-input"
            placeholder="Search places, categories..." 
            class="w-full bg-gray-100 text-gray-800 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-base"
            autocomplete="off"
          />
          <button id="search-clear" onclick="clearSearch()" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors hidden">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div id="search-results" class="overflow-y-auto h-full pb-20 bg-white">
        <!-- Initial State -->
        <div id="search-initial" class="p-8 text-center text-gray-500">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <p class="text-sm">Type to search for places nearby</p>
        </div>
      </div>
    </div>
  `;
}

export function toggleSearch() {
  const overlay = document.getElementById('search-overlay');
  const input = document.getElementById('search-input');

  if (!overlay.classList.contains('translate-y-full')) {
    overlay.classList.add('translate-y-full');
    state.searchVisible = false;
  } else {
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay.classList.remove('translate-y-full');
      input.focus();
    });
    state.searchVisible = true;
  }
}

export function clearSearch() {
  const input = document.getElementById('search-input');
  input.value = '';
  input.focus();
  handleSearch();
}

export function handleSearch() {
  const query = document.getElementById('search-input').value;
  const resultsContainer = document.getElementById('search-results');
  const clearBtn = document.getElementById('search-clear');
  const initialView = document.getElementById('search-initial');

  if (query.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
    resultsContainer.innerHTML = '';
    resultsContainer.innerHTML = `
        <div id="search-initial" class="p-8 text-center text-gray-500">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <p class="text-sm">Type to search for places nearby</p>
        </div>
     `;
    return;
  }

  const results = searchPlaces(state.places, query);

  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="p-8 text-center text-gray-500">
        <div class="text-4xl mb-3">🤔</div>
        <p>No places found matching "${query}"</p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = results.map(place => {
    const distance = state.userLocation
      ? formatDistance(calculateDistance(state.userLocation.latitude, state.userLocation.longitude, place.latitude, place.longitude))
      : null;

    return `
      <div class="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onclick="showPlaceDetail(${place.id}); toggleSearch()">
        <img 
          src="${getImageUrl(place.image)}" 
          alt="${place.name}"
          class="w-16 h-16 rounded-lg object-cover bg-gray-200 flex-shrink-0"
          onerror="this.src='${import.meta.env.BASE_URL}default-place.png'"
        />
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <h3 class="font-medium text-gray-900">${place.name}</h3>
            ${distance ? `<span class="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">${distance}</span>` : ''}
          </div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">${place.category}</span>
            <div class="flex items-center">
              <span class="text-yellow-400 text-xs">★</span>
              <span class="text-xs text-gray-600 ml-0.5">${place.rating}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
