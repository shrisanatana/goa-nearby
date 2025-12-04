
import { state } from '../../../state/appState.js';

export function getHeaderHTML() {
  const { config } = state;
  return `
    <header class="bg-blue-600 text-white shadow-md sticky top-0 z-40">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button class="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors" onclick="toggleSidebar()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-base font-bold">${config.appName}</h1>
                <span class="text-blue-200 text-xs hidden">•</span>
                <span class="text-sm font-medium min-w-[100px] inline-block hidden" id="location-title">All Places</span>
              </div>
              <p class="text-blue-100 text-xs" id="location-subtitle">Loading...</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors" onclick="window.navigateTo('/favorites')" aria-label="Favorites">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
            <button class="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors" onclick="toggleSearch()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
            <button class="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors" onclick="location.reload()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function updateLocationTitle() {
  const titleEl = document.getElementById('location-title');
  if (titleEl) {
    titleEl.textContent = state.currentCategory === 'All' ? 'All Places' : state.currentCategory;
  }
}

export function updateLocationStatus() {
  const statusEl = document.querySelector('#location-subtitle');
  if (statusEl && state.userLocation) {
    statusEl.textContent = `${state.filteredPlaces.length} places nearby`;
  }
}
