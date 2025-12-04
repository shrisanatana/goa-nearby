
import { state } from '../../../state/appState.js';
import { getImageUrl } from '../../../services/placesService.js';
import { calculateDistance, formatDistance } from '../../../utils/geolocation.js';
import { hideMainContent, showMainContent } from '../../../utils/dom.js';
import { isFavorite } from '../../Favorites/controllers/favoritesController.js';

export function showPlaceDetail(placeId) {
  // Close search if open
  if (state.searchVisible) {
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      state.searchVisible = false;
    }
  }

  const selectedPlace = state.places.find(p => p.id === placeId);
  if (!selectedPlace) return;

  state.selectedPlace = selectedPlace;

  state.currentView = 'detail';
  // Don't hide immediately, wait for transition
  // hideMainContent(); 
  renderPlaceDetail(selectedPlace);
}

export function closePlaceDetail() {
  const detailView = document.getElementById('place-detail');

  // Cancel any pending hide timer
  if (hideContentTimer) {
    clearTimeout(hideContentTimer);
    hideContentTimer = null;
  }

  // Show main content immediately so it's visible during slide-down
  showMainContent();

  // Hide detail view
  detailView.classList.add('translate-y-full');

  // Reset state if needed
  state.selectedPlace = null;
  state.currentView = 'list';
}

let hideContentTimer = null;

function renderPlaceDetail(place) {
  const detailView = document.getElementById('place-detail');
  const content = document.getElementById('place-detail-content');

  // Clear any pending hide timer
  if (hideContentTimer) {
    clearTimeout(hideContentTimer);
    hideContentTimer = null;
  }

  // Hide main content after transition (300ms)
  hideContentTimer = setTimeout(() => {
    hideMainContent();
    hideContentTimer = null;
  }, 300);

  // Calculate distance
  const distance = state.userLocation
    ? `${formatDistance(calculateDistance(state.userLocation.latitude, state.userLocation.longitude, place.latitude, place.longitude))} from you`
    : '-- km';

  // Generate stars
  const stars = '★'.repeat(Math.floor(place.rating)) + '☆'.repeat(5 - Math.floor(place.rating));

  // Generate static map URL (using OpenStreetMap static map)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${place.longitude - 0.01},${place.latitude - 0.01},${place.longitude + 0.01},${place.latitude + 0.01}&layer=mapnik&marker=${place.latitude},${place.longitude}`;

  const favorite = isFavorite(place.id);
  const heartClass = favorite ? 'text-red-500 fill-current' : 'text-white stroke-current';
  const heartFill = favorite ? 'currentColor' : 'none';

  content.innerHTML = `
    <div class="relative h-64 md:h-80">
      <img 
        src="${getImageUrl(place.image)}" 
        alt="${place.name}"
        class="w-full h-full object-cover"
        onerror="this.src='${import.meta.env.BASE_URL}default-place.png'"
      >
      <button 
        onclick="closePlaceDetail()"
        class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors z-10"
      >
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </button>
      <button 
        class="absolute top-4 right-4 bg-black/20 hover:bg-black/40 backdrop-blur-sm p-2 rounded-full transition-colors z-10"
        data-favorite-btn="${place.id}"
        aria-label="${favorite ? 'Remove from favorites' : 'Add to favorites'}"
      >
        <svg class="w-6 h-6 ${heartClass}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${heartFill}">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-md mb-2 inline-block">${place.category}</span>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-1">${place.name}</h2>
        <div class="flex items-center text-white/90 text-sm">
          <span class="text-yellow-400 mr-1">${stars}</span>
          <span class="mr-3">${place.rating}</span>
          <span>📍 ${distance}</span>
        </div>
      </div>
    </div >

    <div class="p-6 space-y-6">
          ${place.phone ? `
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <a href="tel:${place.phone}" class="text-blue-600 text-sm hover:underline">${place.phone}</a>
            </div>
          ` : ''}
          ${place.website ? `
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
              <a href="${place.website}" target="_blank" class="text-blue-600 text-sm hover:underline">Visit Website</a>
            </div>
          ` : ''}
        </div>

        <!--Image Gallery-->
    ${place.images && place.images.length > 0 ? `
          <div class="hidden">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Photos</h2>
            <div class="flex gap-3 overflow-x-auto py-2">
              ${place.images.map(img => `
                <img 
                  src="${getImageUrl(img)}" 
                  alt="${place.name}"
                  class="w-32 h-32 flex-shrink-0 rounded-lg object-cover bg-gray-200"
                  onerror="this.src='${import.meta.env.BASE_URL}default-place.png'"
                />
              `).join('')}
            </div>
          </div>
        ` : ''
    }

        <!--Description -->
        <div class="p-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-3">About</h2>
          <p class="text-gray-700 leading-relaxed">${place.fullDescription || place.description}</p>
        </div>

        <!--Map -->
    <div class="p-4">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">Location</h2>
      <div class="relative h-48 bg-gray-200 rounded-lg overflow-hidden" id="place-map-container" data-place-id="${place.id}">
        <div class="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-100">
            <span class="animate-pulse">Loading Map...</span>
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <button
          class="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
          onclick="viewInMaps(${place.latitude}, ${place.longitude}, '${place.name.replace(/'/g, "\\'")}')"
            >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
        View in Maps
      </button>
      <button
        class="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
        onclick="navigateToPlace(${place.latitude}, ${place.longitude}, '${place.name.replace(/'/g, "\\'")}')"
            >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
      </svg>
      Navigate
    </button>
          </div >
        </div >
      </div >
      
    <div class="mt-8 pt-6 border-t border-gray-100 px-4 mb-4">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Nearby in ${place.category}</h2>
      <div class="grid grid-cols-2 gap-3">
        ${state.places
      .filter(p => p.category === place.category && p.id !== place.id)
      .slice(0, 4)
      .map(p => {
        const distance = state.userLocation
          ? `${formatDistance(calculateDistance(state.userLocation.latitude, state.userLocation.longitude, p.latitude, p.longitude))} from you`
          : null;

        const isFav = isFavorite(p.id);
        const borderClass = isFav ? 'border-green-500 border-2' : 'border-gray-100';
        const heartClass = isFav ? 'text-red-500 fill-current' : 'text-white stroke-current';
        const heartFill = isFav ? 'currentColor' : 'none';

        return `
                <div class="nearby-place-card bg-white rounded-lg shadow-sm border ${borderClass} overflow-hidden relative" data-id="${p.id}">
                  <div class="h-24 bg-gray-200 relative">
                    <img 
                      src="${getImageUrl(p.image)}" 
                      alt="${p.name}"
                      class="w-full h-full object-cover cursor-pointer"
                      onclick="showPlaceDetail(${p.id})"
                      onerror="this.src='${import.meta.env.BASE_URL}default-place.png'"
                    />
                    <button 
                      class="absolute top-1 right-1 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-10"
                      data-favorite-btn="${p.id}"
                      aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                    >
                      <svg class="w-4 h-4 ${heartClass}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${heartFill}">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    ${distance ? `
                      <div class="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                        ${distance}
                      </div>
                    ` : ''}
                  </div>
                  <div class="p-2">
                    <h3 class="font-medium text-sm text-gray-800 line-clamp-1">${p.name}</h3>
                    <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">${p.description}</p>
                  </div>
                </div>
              `;
      }).join('')}
      </div>
      ${state.places.filter(p => p.category === place.category && p.id !== place.id).length === 0 ?
      '<p class="text-gray-500 text-sm italic">No other places found in this category.</p>' : ''
    }
    </div>
    
    <!-- Nearby to this place (Async) -->
    <div class="mt-4 pt-6 border-t border-gray-100 px-4 mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Nearby ${place.name}</h2>
      <div id="nearby-place-container" class="grid grid-cols-2 gap-3">
        <!-- Loading Skeletons -->
        ${Array(4).fill(0).map(() => `
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div class="h-24 bg-gray-200"></div>
            <div class="p-2 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    </div>
  `;

  // Make detail view visible
  requestAnimationFrame(() => {
    detailView.classList.remove('translate-y-full');
  });
  detailView.scrollTop = 0;

  // Load map after transition (smooth performance)
  setTimeout(() => {
    const mapContainer = document.getElementById('place-map-container');
    if (mapContainer && mapContainer.dataset.placeId === String(place.id)) {
      mapContainer.innerHTML = `
            <iframe
              src="${mapUrl}"
              class="w-full h-full object-cover"
              frameborder="0"
              scrolling="no"
              loading="lazy"
            ></iframe>
          `;
    }
  }, 400);

  // Async calculation for nearby places
  setTimeout(() => {
    const nearbyContainer = document.getElementById('nearby-place-container');
    if (!nearbyContainer) return;

    // Calculate distance from THIS place to all other places
    const nearbyPlaces = state.places
      .filter(p => p.id !== place.id)
      .map(p => {
        const dist = calculateDistance(place.latitude, place.longitude, p.latitude, p.longitude);
        return { ...p, distanceToPlace: dist };
      })
      .sort((a, b) => a.distanceToPlace - b.distanceToPlace)
      .slice(0, 4);

    if (nearbyPlaces.length === 0) {
      nearbyContainer.innerHTML = '<p class="text-gray-500 text-sm italic col-span-2">No nearby places found.</p>';
      return;
    }

    nearbyContainer.innerHTML = nearbyPlaces.map(p => {
      const distance = `${formatDistance(p.distanceToPlace)} from ${place.name}`;
      const isFav = isFavorite(p.id);
      const borderClass = isFav ? 'border-green-500 border-2' : 'border-gray-100';
      const heartClass = isFav ? 'text-red-500 fill-current' : 'text-white stroke-current';
      const heartFill = isFav ? 'currentColor' : 'none';

      return `
        <div class="nearby-place-card bg-white rounded-lg shadow-sm border ${borderClass} overflow-hidden transition-shadow relative" data-id="${p.id}">
          <div class="h-24 bg-gray-200 relative">
            <img 
              src="${getImageUrl(p.image)}" 
              alt="${p.name}"
              class="w-full h-full object-cover cursor-pointer"
              onclick="showPlaceDetail(${p.id})"
              onerror="this.src='${import.meta.env.BASE_URL}default-place.png'"
            />
            <button 
              class="absolute top-1 right-1 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-10"
              data-favorite-btn="${p.id}"
              aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
            >
              <svg class="w-4 h-4 ${heartClass}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${heartFill}">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <div class="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
              ${distance}
            </div>
          </div>
          <div class="p-2">
            <h3 class="font-medium text-sm text-gray-800 line-clamp-1">${p.name}</h3>
            <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">${p.category}</p>
          </div>
        </div>
      `;
    }).join('');
  }, 100); // Small delay to allow UI to paint loading state
}

export function viewInMaps(lat, lng, name) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  window.open(url, '_blank');
}

export function navigateToPlace(lat, lng, name) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
}
