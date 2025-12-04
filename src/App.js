import { state } from './state/appState.js';
import { getHeaderHTML, updateLocationStatus } from './pages/Home/components/Header.js';
import { getSidebarHTML, renderSidebarMenu, toggleSidebar } from './pages/Home/components/Sidebar.js';
import { getSearchOverlayHTML, toggleSearch, clearSearch, handleSearch } from './pages/Home/components/SearchOverlay.js';
import { getFiltersHTML, renderFilters, selectCategory } from './pages/Home/components/CategoryFilters.js';
import { showPlaceDetail, closePlaceDetail, viewInMaps, navigateToPlace } from './pages/Home/components/PlaceDetail.js';
import { showSettings } from './pages/Settings/Settings.js';
import { showAbout } from './pages/About/About.js';
import { showPrivacy } from './pages/Privacy/Privacy.js';
import { closeInfoPage } from './components/InfoPage.js';
import { showLocationError, retryLocation, dismissLocationBanner } from './pages/Home/components/LocationBanner.js';
import { updatePlaces } from './pages/Home/controllers/placesController.js';
import { getCurrentLocation, watchLocation } from './utils/geolocation.js';
import { scheduleDistanceBatchCompute } from './utils/batch.js';
import { fetchPlaces } from './services/placesService.js';
import aboutData from './data/about.json';
import { showMainContent, hideMainContent } from './utils/dom.js';
import { showToast } from './components/Toast.js';
import { showPackages } from './pages/packages/PackagesPage.js';
import { showFavorites } from './pages/Favorites/FavoritesPage.js';
import { toggleFavorite } from './pages/Favorites/controllers/favoritesController.js';
import { onRouteChange, navigateTo } from './utils/router.js';
import { createLocationWidget } from './components/LocationWidget.js';
import { showWelcomePopup } from './components/WelcomePopup.js';
import { isOutsideGoa, loadLocationPreferences, LOCATION_MODES } from './services/locationService.js';
import { initializeLocationSwitcher } from './utils/locationInit.js';

// Attach globals
window.toggleSidebar = toggleSidebar;
window.toggleSearch = toggleSearch;
window.clearSearch = clearSearch;
window.handleSearch = handleSearch;
window.showPlaceDetail = showPlaceDetail;
window.closePlaceDetail = closePlaceDetail;
window.selectCategory = selectCategory;
window.navigateToCategory = (category) => {
  state.currentCategory = category;
  state.currentView = 'list';
  toggleSidebar();
  renderFilters();
  updatePlaces();
  showMainContent();
};
window.retryLocation = retryLocation;
window.dismissLocationBanner = dismissLocationBanner;
window.showSettings = showSettings;
window.showAbout = showAbout;
window.showPrivacy = showPrivacy;
window.closeInfoPage = closeInfoPage;
window.viewInMaps = viewInMaps;
window.navigateToPlace = navigateToPlace;
window.hideMainContent = hideMainContent;
window.showMainContent = showMainContent;
window.showMainContent = showMainContent;
window.showPackages = showPackages;
window.showFavorites = showFavorites;
window.navigateTo = navigateTo;

// Global Error Handler
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error('Global Error:', msg, error);
  return false;
};

// Global Event Delegation for Search
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'search-input') {
    window.handleSearch();
  }
});

document.addEventListener('click', (e) => {
  // Handle clear search click
  if (e.target && e.target.closest('#search-clear')) {
    window.clearSearch();
  }

  // Handle favorite button click
  const favoriteBtn = e.target.closest('[data-favorite-btn]');
  if (favoriteBtn) {
    e.stopPropagation(); // Prevent card click
    const placeId = parseInt(favoriteBtn.dataset.favoriteBtn);
    if (!isNaN(placeId)) {
      const isFav = toggleFavorite(placeId);

      // Update ALL buttons for this place ID (sync main list and detail view)
      const allButtons = document.querySelectorAll(`[data-favorite-btn="${placeId}"]`);
      allButtons.forEach(btn => {
        const heartIcon = btn.querySelector('svg');
        if (heartIcon) {
          if (isFav) {
            heartIcon.classList.remove('text-white', 'stroke-current');
            heartIcon.classList.add('text-red-500', 'fill-current');
            heartIcon.setAttribute('fill', 'currentColor');
            btn.setAttribute('aria-label', 'Remove from favorites');
          } else {
            heartIcon.classList.remove('text-red-500', 'fill-current');
            heartIcon.classList.add('text-white', 'stroke-current');
            heartIcon.setAttribute('fill', 'none');
            btn.setAttribute('aria-label', 'Add to favorites');
          }
        }

        // Also update parent card border if it's a nearby card
        const card = btn.closest('.nearby-place-card');
        if (card) {
          if (isFav) {
            card.classList.remove('border-gray-100');
            card.classList.add('border-green-500', 'border-2');
          } else {
            card.classList.remove('border-green-500', 'border-2');
            card.classList.add('border-gray-100');
          }
        }
      });

      // If we are on favorites page and removed a favorite, re-render
      if (window.location.hash === '#/favorites') {
        showFavorites();
      }
    }
    return;
  }

  // Handle place card click
  const placeCard = e.target.closest('.place-card');
  if (placeCard) {
    const placeId = parseInt(placeCard.dataset.id);
    if (!isNaN(placeId)) {
      console.log('Opening place detail for ID:', placeId);
      window.showPlaceDetail(placeId);
    } else {
      console.warn('Place card clicked but no valid ID found:', placeCard);
    }
  }
});

export async function initializeApp() {
  renderApp();

  try {
    state.allPlaces = await fetchPlaces();
    if (!Array.isArray(state.allPlaces)) {
      console.error('Fetched data is not an array, resetting to empty');
      state.allPlaces = [];
    }
  } catch (error) {
    console.error('Failed to fetch places:', error);
    state.allPlaces = [];
  }



  // Render cards immediately (fast): do not block UI waiting for geolocation.
  updatePlaces();

  const { config } = state;

  try {
    // Get user location asynchronously and then kick off distance computations
    state.userLocation = await getCurrentLocation();

    // Initialize location switcher after getting location
    initializeLocationSwitcher();

    // Once we have location, compute distances in background (debounced)
    scheduleDistanceBatchCompute(0);

    // Watch for location changes (debounced re-computation)
    state.locationWatchId = watchLocation((newLocation) => {
      state.userLocation = newLocation;
      // Do not block UI: only re-compute distances (debounced) and update counts
      scheduleDistanceBatchCompute();
      updateLocationStatus();
    });

    // Set up periodic distance updates (will refresh distances in background)
    state.updateInterval = setInterval(() => {
      if (state.userLocation) {
        scheduleDistanceBatchCompute();
      }
    }, config.distanceUpdateInterval);

  } catch (error) {
    console.error('Error getting location:', error);
    showLocationError();
    // Use default location from config and start background distance compute
    state.userLocation = config.defaultLocation;
    scheduleDistanceBatchCompute(0);
  }

  // Initialize routing
  onRouteChange((route) => {
    if (route === '/packages') {
      showPackages();
    } else if (route === '/favorites') {
      showFavorites();
    } else {
      // Show main content
      const packagesPage = document.getElementById('packages-page');
      if (packagesPage) packagesPage.classList.add('hidden');

      const favoritesPage = document.getElementById('favorites-page');
      if (favoritesPage) favoritesPage.classList.add('hidden');

      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.style.display = 'block';
      const header = document.querySelector('header');
      if (header) header.style.display = 'block';
    }
  });
}

function renderApp() {
  const app = document.querySelector('#app');
  const { config } = state;

  app.innerHTML = `
    <div class="bg-gray-50">
      ${getHeaderHTML()}
      ${getSidebarHTML()}
      ${getSearchOverlayHTML()}
      
      <!-- Main Content -->
      <main id="main-content" class="pt-2 pb-24 container mx-auto max-w-full">
        ${getFiltersHTML()}
        
        <!-- Places Grid -->
        <div class="px-2 py-4 mb-4">
          <div id="places-container"></div>
        </div>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 mt-8 sticky bottom-0 z-10">
          <div class="container mx-auto px-4 py-3">
            <div class="flex flex-col items-center justify-center gap-1">
              <p class="text-xs text-gray-600">© ${new Date().getFullYear()} ${config.appName}</p>
              <p class="text-xs text-gray-500">Version ${aboutData.version} • Made with ❤️ for Goa By Niranjan Yamgar</p>
            </div>
          </div>
        </footer>
      </main>

      <!-- Detail View Container -->
      <div id="place-detail" class="fixed inset-0 bg-white z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out translate-y-full">
        <div id="place-detail-content"></div>
      </div>

      <!-- Info Page Container -->
      <div id="info-page" class="fixed inset-0 bg-white z-40 overflow-y-auto transform transition-transform duration-300 ease-in-out translate-y-full"></div>
    </div>
  `;

  renderSidebarMenu();
  renderFilters();
}
