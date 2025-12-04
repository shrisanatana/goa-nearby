
import { state } from '../../state/appState.js';
import { renderInfoPage } from '../../components/InfoPage.js';
import { hideMainContent } from '../../utils/dom.js';
import { toggleSidebar } from '../Home/components/Sidebar.js';
import privacyData from '../../data/privacy.json';

export function showPrivacy() {
  toggleSidebar();
  state.currentView = 'privacy';
  state.currentView = 'privacy';
  // hideMainContent(); // Handled by InfoPage
  renderInfoPage('Privacy Policy', `
    <div class="space-y-6">
      <p class="text-sm text-gray-500">Last Updated: ${privacyData.lastUpdated}</p>
      ${privacyData.sections.map(section => `
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">${section.heading}</h3>
          <p class="text-gray-700 leading-relaxed">${section.content}</p>
        </div>
      `).join('')}
    </div>
  `);
}
