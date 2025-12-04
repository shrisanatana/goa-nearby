
import { state } from '../../state/appState.js';
import { renderInfoPage } from '../../components/InfoPage.js';
import { hideMainContent } from '../../utils/dom.js';
import { toggleSidebar } from '../Home/components/Sidebar.js';
import aboutData from '../../data/about.json';

export function showAbout() {
  toggleSidebar();
  state.currentView = 'about';
  state.currentView = 'about';
  // hideMainContent(); // Handled by InfoPage
  renderInfoPage('About App', `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">${aboutData.appName}</h2>
        <p class="text-gray-600">Version ${aboutData.version}</p>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Description</h3>
        <p class="text-gray-700 leading-relaxed">${aboutData.description}</p>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Features</h3>
        <ul class="space-y-2">
          ${aboutData.features.map(feature => `
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-700">${feature}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Contact</h3>
        <p class="text-gray-700">${aboutData.contact}</p>
      </div>
    </div>
  `);
}
