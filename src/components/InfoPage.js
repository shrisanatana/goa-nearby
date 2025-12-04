
import { state } from '../state/appState.js';
import { showMainContent } from '../utils/dom.js';

export function renderInfoPage(title, content) {
  const container = document.getElementById('info-page');
  container.innerHTML = `
      <div class="bg-blue-600 text-white px-4 py-4 sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <button onclick="closeInfoPage()" class="hover:bg-blue-700 p-2 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-lg font-semibold">${title}</h1>
        </div>
      </div>
      <div class="max-w-2xl mx-auto px-6 py-8">
        ${content}
      </div>
  `;

  // Trigger slide-up
  requestAnimationFrame(() => {
    container.classList.remove('translate-y-full');
  });
  container.scrollTop = 0;
}

export function closeInfoPage() {
  state.currentView = 'list';
  const container = document.getElementById('info-page');

  // Show main content behind the sliding page
  showMainContent();

  // Trigger slide-down
  container.classList.add('translate-y-full');

  // Cleanup after transition
  setTimeout(() => {
    container.innerHTML = '';
  }, 300);
}
