
import { state } from '../../../state/appState.js';
import { getCurrentLocation, watchLocation } from '../../../utils/geolocation.js';

export function showLocationError() {
    const statusEl = document.querySelector('#location-subtitle');
    if (statusEl) {
        statusEl.textContent = 'Using default location';
    }

    // Check if banner already exists
    if (document.getElementById('location-banner')) return;

    const app = document.querySelector('#app');
    const banner = document.createElement('div');
    banner.id = 'location-banner';
    banner.className = 'bg-blue-50 border-b border-blue-100 p-4 animate-fade-in';
    banner.innerHTML = `
    <div class="flex items-start gap-3 container mx-auto px-4">
      <div class="bg-blue-100 p-2 rounded-full flex-shrink-0 text-blue-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-blue-900 text-sm">Enable Location Services</h3>
        <p class="text-blue-700 text-xs mt-1">We need your location to show places nearby. Currently showing default location.</p>
        <div class="mt-3 flex gap-3">
          <button onclick="retryLocation()" class="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Enable Location
          </button>
          <button onclick="dismissLocationBanner()" class="text-blue-600 text-xs font-medium hover:text-blue-800">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  `;

    // Insert after header
    const header = document.querySelector('header');
    if (header) {
        header.parentNode.insertBefore(banner, header.nextSibling);
    }
}

export async function retryLocation() {
    const btn = document.querySelector('#location-banner button');
    if (btn) {
        btn.textContent = 'Requesting...';
        btn.disabled = true;
    }

    try {
        state.userLocation = await getCurrentLocation();

        // If successful:
        if (window.updatePlaces) window.updatePlaces();
        dismissLocationBanner();

        // Update header status
        const statusEl = document.querySelector('#location-subtitle');
        if (statusEl) {
            statusEl.textContent = 'Location active';
        }

        // Restart watchers if they were missing
        if (!state.locationWatchId) {
            state.locationWatchId = watchLocation((newLocation) => {
                state.userLocation = newLocation;
                if (window.updatePlaces) window.updatePlaces();
            });
        }
        // Note: updateInterval logic should be handled in main or controller

    } catch (error) {
        console.error('Retry failed:', error);
        if (btn) {
            // Check if it's a permission error
            const isPermissionDenied = error.code === 1; // 1 is PERMISSION_DENIED

            btn.textContent = isPermissionDenied ? 'Permission Denied' : 'Location Failed';
            btn.classList.add('bg-red-600', 'hover:bg-red-700');

            // Show help text
            const helpText = document.createElement('p');
            helpText.className = 'text-red-600 text-xs mt-2 font-medium';

            if (isPermissionDenied) {
                helpText.textContent = 'Browser blocked location. Please reset permissions in settings and reload.';
                // Add reload button
                setTimeout(() => {
                    btn.textContent = 'Reload Page';
                    btn.onclick = () => location.reload();
                    btn.classList.remove('bg-red-600', 'hover:bg-red-700');
                    btn.classList.add('bg-gray-800', 'hover:bg-gray-900');
                    btn.disabled = false;
                }, 2000);
            } else {
                helpText.textContent = 'Could not get location. Please check your GPS/Signal and try again.';
                setTimeout(() => {
                    btn.textContent = 'Enable Location';
                    btn.classList.remove('bg-red-600', 'hover:bg-red-700');
                    btn.disabled = false;
                    helpText.remove();
                }, 3000);
            }

            if (!isPermissionDenied) {
                btn.parentNode.parentNode.appendChild(helpText);
            } else {
                // For permission denied, keep the message
                const existingHelp = btn.parentNode.parentNode.querySelector('p.text-red-600');
                if (existingHelp) existingHelp.remove();
                btn.parentNode.parentNode.appendChild(helpText);
            }
        }
    }
}

export function dismissLocationBanner() {
    const banner = document.getElementById('location-banner');
    if (banner) {
        banner.remove();
    }
}
