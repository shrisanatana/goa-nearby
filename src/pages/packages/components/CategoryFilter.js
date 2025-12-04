import { packageState, getAvailableCategories, toggleCategory, isCategoryExcluded } from '../state/packageState.js';

/**
 * Render category filter chips
 * @param {Function} onChange - Callback when category selection changes
 * @returns {string} - HTML string
 */
export function renderCategoryFilter(onChange) {
    const categories = getAvailableCategories();

    return `
        <div class="px-4 py-3 bg-white border-b border-gray-100">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-medium text-gray-600">Filter Categories:</span>
                <span class="text-xs text-gray-400">(tap to exclude)</span>
            </div>
            <div class="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                ${categories.map(category => {
        const isExcluded = isCategoryExcluded(category);
        return `
                        <button 
                            onclick="window.togglePackageCategory('${category}')"
                            class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isExcluded
                ? 'bg-gray-200 text-gray-400 line-through'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }">
                            ${category}
                        </button>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

// Global handler
window.togglePackageCategory = (category) => {
    toggleCategory(category);
    // Trigger onChange callback
    if (window.onCategoryFilterChange) {
        window.onCategoryFilterChange();
    }
};
