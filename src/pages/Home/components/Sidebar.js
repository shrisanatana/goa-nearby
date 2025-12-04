
import { state } from '../../../state/appState.js';
import aboutData from '../../../data/about.json';

export function getSidebarHTML() {
  const { config } = state;
  return `
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 opacity-0 pointer-events-none" onclick="toggleSidebar()"></div>
    <div id="sidebar" class="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col -translate-x-full">
      <div class="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0">
        <h2 class="text-lg font-bold">${config.appName}</h2>
        <p class="text-blue-100 text-xs mt-0.5">Explore Beautiful Goa</p>
      </div>
      <div id="sidebar-menu" class="flex-1 overflow-y-auto"></div>
      <div class="p-3 border-t border-gray-200 bg-gray-50 text-center flex-shrink-0">
        <p class="text-xs text-gray-500">v${aboutData.version}</p>
      </div>
    </div>
  `;
}

export function renderSidebarMenu() {
  const menu = document.getElementById('sidebar-menu');
  if (!menu) return;

  const { config } = state;
  const categories = config.categories.filter(c => c !== 'All');

  // Get category icons from config.json (fully dynamic)
  const categoryIcons = config.categoryIcons || {};
  const defaultIcon = '📍'; // Fallback icon if not found in config

  // Get static menu items from config.json (Settings, About, Privacy, etc.)
  const staticItems = config.staticMenuItems || [];

  // Map static item IDs to their onclick functions
  const staticItemActions = {
    'settings': 'showSettings()',
    'about': 'showAbout()',
    'privacy': 'showPrivacy()'
  };

  menu.innerHTML = `
    <div class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0" onclick="navigateToCategory('All')">
      <span class="text-xl">${categoryIcons['All'] || '🌟'}</span>
      <span class="text-sm font-medium">All Places</span>
    </div>
    <div class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0" onclick="window.navigateTo('/favorites'); toggleSidebar();">
      <span class="text-xl">❤️</span>
      <span class="text-sm font-medium">Favorites</span>
    </div>
    <div class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0" onclick="window.navigateTo('/packages'); toggleSidebar();">
      <span class="text-xl">📦</span>
      <span class="text-sm font-medium">Smart hourly Plan</span>
    </div>


    ${categories.map(category => `
      <div class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 hidden" onclick="navigateToCategory('${category}')">
        <span class="text-xl">${categoryIcons[category] || defaultIcon}</span>
        <span class="text-sm font-medium">${category}</span>
      </div>
    `).join('')}
    ${staticItems.length > 0 ? '<div class="h-px bg-gray-200 my-2"></div>' : ''}
    ${staticItems.map(item => `
      <div class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0" onclick="${staticItemActions[item.id] || ''}">
        <span class="text-xl">${item.icon}</span>
        <span class="text-sm font-medium text-gray-700">${item.label}</span>
      </div>
    `).join('')}
  `;
}

export function toggleSidebar() {
  state.sidebarVisible = !state.sidebarVisible;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (state.sidebarVisible) {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
  } else {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.remove('opacity-100', 'pointer-events-auto');
    overlay.classList.add('opacity-0', 'pointer-events-none');
  }
}
