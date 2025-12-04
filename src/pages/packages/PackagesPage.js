import { state } from '../../state/appState.js';
import { packageState, PACKAGES } from './state/packageState.js';
import { generateOptimizedRoute, optimizeRoute } from './utils/routeOptimizer.js';
import { renderPackageCard } from './components/PackageCard.js';
import { renderRouteTimeline } from './components/RouteTimeline.js';
import { renderCategoryFilter } from './components/CategoryFilter.js';
import { navigateTo } from '../../utils/router.js';

export function showPackages() {
    // Show packages page
    let page = document.getElementById('packages-page');
    if (!page) {
        page = document.createElement('div');
        page.id = 'packages-page';
        page.className = 'min-h-screen bg-gray-50 pb-24';
        document.getElementById('app').appendChild(page);
    }
    page.classList.remove('hidden');

    // Hide other views
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.style.display = 'none';
    const header = document.querySelector('header');
    if (header) header.style.display = 'none';
    const detail = document.getElementById('place-detail');
    if (detail) detail.classList.add('hidden');
    const info = document.getElementById('info-page');
    if (info) info.innerHTML = '';

    // Initial Render
    if (packageState.selectedPlaces.length === 0) {
        generateRoute();
    } else {
        renderPackagesPage();
    }
}

function generateRoute() {
    packageState.isCalculating = true;
    renderPackagesPage(); // Show loading state

    // Simulate AI calculation delay
    setTimeout(() => {
        const { userLocation } = state;
        const limit = PACKAGES[packageState.currentPackage].maxDist;

        if (!userLocation || !state.places.length) {
            packageState.selectedPlaces = [];
            packageState.isCalculating = false;
            renderPackagesPage();
            return;
        }

        // Generate optimized route with category filters
        const route = generateOptimizedRoute(
            state.places,
            userLocation,
            limit,
            packageState.excludedCategories
        );

        packageState.selectedPlaces = route;
        packageState.isCalculating = false;
        renderPackagesPage();
    }, 1500);
}

function renderPackagesPage() {
    const page = document.getElementById('packages-page');
    if (!page) return;

    page.innerHTML = `
        <!-- Header -->
        <div class="bg-green-200 shadow-sm sticky top-0 z-40">
            <div class="container mx-auto px-4 py-3 flex items-center gap-3">
                <button onclick="window.closePackages()" class="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <span class="text-xl">←</span>
                </button>
                <h1 class="text-lg font-bold text-gray-800">Smart Packages</h1>
            </div>
            
            <!-- Package Selectors -->
            <div class="flex justify-around px-2 pb-3 border-b border-gray-100">
                ${Object.entries(PACKAGES).map(([key, val]) => `
                    <button onclick="window.selectPackage('${key}')" 
                        class="flex-1 mx-1 py-2 px-1 rounded-lg text-sm font-medium transition-all ${packageState.currentPackage === key
            ? 'bg-blue-600 text-white shadow-md transform scale-105'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }">
                        <div class="text-xs opacity-80">${val.maxTime} Hr</div>
                        <div>${val.maxDist} km</div>
                    </button>
                `).join('')}
            </div>
            
            <!-- Category Filter -->
            ${renderCategoryFilter()}
        </div>

        <!-- Content -->
        <div class="">
            
            ${packageState.isCalculating ? `
                <div class="flex flex-col items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p class="text-gray-500 animate-pulse">Optimizing your route...</p>
                </div>
            ` : `
                <!-- Summary Card -->
                ${renderPackageCard(packageState.selectedPlaces, state.userLocation)}

                <!-- Route Timeline -->
                ${renderRouteTimeline(packageState.selectedPlaces)}

                <!-- Actions -->
                <div class="mt-6 flex gap-2 mx-3 mb-3">
                    <button onclick="window.openAddPlaceModal()" class="flex-1 py-3 rounded-xl border-2 border-dashed border-blue-400 text-blue-600 font-medium hover:bg-blue-50 transition-colors text-sm">
                        + Add Stop
                    </button>
                    <button onclick="window.generateRoute()" class="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm">
                        ⚡ Regenerate
                    </button>
                </div>
            `}
        </div>

        <!-- Add Place Modal -->
        <div id="add-place-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
            <div class="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[80vh] flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-lg">Add a Stop</h3>
                    <button onclick="window.closeAddPlaceModal()" class="p-2 text-gray-500">✕</button>
                </div>
                <input type="text" id="package-search" placeholder="Search places..." class="w-full p-3 bg-gray-100 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-blue-500">
                <div id="package-search-results" class="overflow-y-auto flex-1 space-y-2"></div>
            </div>
        </div>
    `;

    // Attach search listener
    setTimeout(() => {
        const searchInput = document.getElementById('package-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const results = state.places.filter(p =>
                    !packageState.selectedPlaces.find(sp => sp.id === p.id) &&
                    !packageState.excludedCategories.includes(p.category) &&
                    (p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
                );

                const container = document.getElementById('package-search-results');
                container.innerHTML = results.map(p => {
                    const dist = state.userLocation ? calculateDistance(
                        state.userLocation.latitude,
                        state.userLocation.longitude,
                        p.latitude,
                        p.longitude
                    ).toFixed(1) : '?';

                    return `
                    <div onclick="window.addPackagePlace(${p.id})" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-100">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            ${p.name.charAt(0)}
                        </div>
                        <div>
                            <div class="font-medium text-sm">${p.name}</div>
                            <div class="text-xs text-gray-500">${dist} km away</div>
                        </div>
                        <div class="ml-auto text-blue-600 text-xl">+</div>
                    </div>
                    `;
                }).join('');
            });
        }
    }, 100);
}

// Global handlers
window.selectPackage = (pkg) => {
    if (packageState.currentPackage === pkg) return;
    packageState.currentPackage = pkg;
    generateRoute();
};

window.removePackagePlace = (id) => {
    packageState.selectedPlaces = packageState.selectedPlaces.filter(p => p.id !== id);
    renderPackagesPage();
};

window.openAddPlaceModal = () => {
    document.getElementById('add-place-modal').classList.remove('hidden');
    document.getElementById('package-search').focus();
};

window.closeAddPlaceModal = () => {
    document.getElementById('add-place-modal').classList.add('hidden');
};

window.addPackagePlace = (id) => {
    const place = state.places.find(p => p.id === id);
    if (place) {
        packageState.selectedPlaces.push(place);
        // Optimize the route after adding
        packageState.selectedPlaces = optimizeRoute(packageState.selectedPlaces, state.userLocation);
        window.closeAddPlaceModal();
        renderPackagesPage();
    }
};

window.closePackages = () => {
    navigateTo('/');
};

window.generateRoute = generateRoute;

// Category filter change handler
window.onCategoryFilterChange = () => {
    generateRoute();
};

// Import for search
import { calculateDistance } from '../../utils/geolocation.js';
