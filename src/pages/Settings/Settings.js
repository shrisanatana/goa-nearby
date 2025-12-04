
import { state } from '../../state/appState.js';
import { renderInfoPage } from '../../components/InfoPage.js';
import { hideMainContent } from '../../utils/dom.js';
import { toggleSidebar } from '../Home/components/Sidebar.js';
import aboutData from '../../data/about.json';

export function showSettings() {
  toggleSidebar();
  state.currentView = 'settings';
  state.currentView = 'settings';
  // hideMainContent(); // Handled by InfoPage for smooth transition

  const { config, userLocation } = state;

  renderInfoPage('Settings', `
    <div class="space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Distance Update Interval</h2>
        <p class="text-gray-600 mb-2">Current: ${config.distanceUpdateInterval / 1000} seconds</p>
        <p class="text-sm text-gray-500">Distances are automatically recalculated every ${config.distanceUpdateInterval / 1000} seconds as you move.</p>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Location Services</h2>
        <p class="text-gray-600 mb-2">Status: ${userLocation ? 'Active' : 'Using default location'}</p>
        <p class="text-sm text-gray-500">Allow location access for accurate distance calculations.</p>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">App Version</h2>
        <p class="text-gray-600">${aboutData.version}</p>
      </div>
    </div>
  `);
}
