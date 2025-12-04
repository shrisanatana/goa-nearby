
import { formatDistance } from '../../../utils/geolocation.js';
import { getImageUrl } from '../../../services/placesService.js';
import { isFavorite } from '../../Favorites/controllers/favoritesController.js';

export function renderPlaceCard(place) {
  const distanceText = place.distance !== null ? `${formatDistance(place.distance)} from you` : '-- km';
  const imageUrl = getImageUrl(place.image);
  const favorite = isFavorite(place.id);
  const heartClass = favorite ? 'text-red-500 fill-current' : 'text-white stroke-current';
  const heartFill = favorite ? 'currentColor' : 'none';

  return `
    <div class="place-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer" data-id="${place.id}">
      <div class="relative">
        <img 
          src="${imageUrl}" 
          alt="${place.name}"
          class="place-card-image w-full h-28 object-cover bg-gray-200"
          onerror="this.src='${import.meta.env.BASE_URL}default-place.png'"
        />
        <div class="absolute top-2 left-2">
          <span class="bg-white/95 backdrop-blur-sm text-gray-700 px-3 py-1 rounded text-xs font-medium shadow-sm flex items-center gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>
            ${distanceText}
          </span>
        </div>
        <button 
          class="absolute top-2 right-2 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-10"
          data-favorite-btn="${place.id}"
          aria-label="${favorite ? 'Remove from favorites' : 'Add to favorites'}"
        >
          <svg class="w-5 h-5 ${heartClass}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${heartFill}">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <div class="p-3">
        <h3 class="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
          ${place.name}
        </h3>
        
        <p class="text-gray-600 text-xs mb-2 line-clamp-2">
          ${place.description}
        </p>
        
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-1 text-yellow-500">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <span class="font-medium text-gray-700">${place.rating}</span>
          </div>
          
          <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
            ${place.category}
          </span>
        </div>
      </div>
    </div >
  `;
}
