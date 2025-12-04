
import { state } from '../../../state/appState.js';

export function getFiltersHTML() {
  return `
    <div class="sticky top-16 z-30 bg-white">
      <div class="container mx-auto -px-4 pt-2">
        <div id="filters" class="flex gap-2 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"></div>
      </div>
    </div>
  `;
}

export function renderFilters() {
  const filtersContainer = document.querySelector('#filters');
  if (!filtersContainer) return;

  const { config, currentCategory } = state;
  const categories = config.categories;

  filtersContainer.innerHTML = categories.map(category => `
    <button
      class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${category === currentCategory ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'}"
      onclick="selectCategory('${category}')"
    >
      ${category}
    </button>
  `).join('');
}

export function selectCategory(category) {
  state.currentCategory = category;
  renderFilters();
  // We need to trigger updatePlaces and updateLocationTitle.
  // Since we are decoupling, we can dispatch an event or call a global function.
  // For now, let's assume window.updatePlaces and window.updateLocationTitle exist,
  // or we can import them if we restructure properly.
  // Ideally, we should use the event system in appState.

  if (window.updatePlaces) window.updatePlaces();
  if (window.updateLocationTitle) window.updateLocationTitle();
}
