import { state, setState } from '../state/appState.js';
import {
    getAllLocations,
    getPopularLocations,
    getSmartSuggestions,
    searchLocations,
    getLocationsByVibe,
    getVibeEmoji,
    getTypeEmoji,
    saveLocationPreferences,
    LOCATION_MODES,
    estimateTravelCost,
    getAIContext,
    getLocationById
} from '../services/locationService.js';
import { calculateDistance } from '../utils/geolocation.js';

/**
 * Revolutionary Location Selector with AI Suggestions
 * Features: Smart suggestions, vibe filters, mini-map preview, travel estimates
 */

let selectedVibe = null;
let searchQuery = '';

export function showLocationSelector() {
    // Create popover container
    const popover = document.createElement('div');
    popover.id = 'location-selector-popover';
    popover.className = 'location-selector-popover';
    popover.innerHTML = getPopoverHTML();

    document.body.appendChild(popover);

    // Animate in
    requestAnimationFrame(() => {
        popover.classList.add('active');
    });

    // Attach listeners
    attachPopoverListeners();

    // Show initial suggestions
    renderLocationsList();
}

function getPopoverHTML() {
    return `
        <div class="popover-overlay"></div>
        <div class="popover-container">
            <!-- Search Bar -->
            <div class="popover-search">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                    type="text" 
                    id="location-search" 
                    placeholder="Where are you staying?" 
                    autocomplete="off"
                />
                <button class="search-clear hidden" id="clear-search">×</button>
            </div>
            
            <!-- Locations List -->
            <div class="locations-list" id="locations-list">
                <!-- Populated by JS -->
            </div>
        </div>
        
        <!-- Styles -->
        <style>
            .location-selector-popover {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: flex-end;
                justify-content: flex-end;
                pointer-events: none; /* Allow clicks through empty space */
            }
            
            .popover-overlay {
                position: absolute;
                inset: 0;
                background: transparent; /* No dark overlay */
                pointer-events: auto; /* Catch clicks to close */
            }
            
            .popover-container {
                position: absolute;
                bottom: 80px; /* Above the widget */
                right: 24px;
                width: 300px;
                max-height: 400px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                pointer-events: auto;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                transform-origin: bottom right;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                border: 1px solid rgba(0,0,0,0.05);
            }
            
            .location-selector-popover.active .popover-container {
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            /* Mobile Style */
            @media (max-width: 640px) {
                .popover-container {
                    bottom: 80px;
                    right: 16px;
                    left: 16px; /* Full width minus margins */
                    width: auto;
                    max-height: 50vh;
                }
            }
            
            .popover-search {
                padding: 12px;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                align-items: center;
                position: relative;
                background: white;
                z-index: 10;
            }
            
            .search-icon {
                position: absolute;
                left: 24px;
                color: #999;
                pointer-events: none;
            }
            
            #location-search {
                width: 100%;
                padding: 8px 32px 8px 36px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                font-size: 14px;
                background: #f9f9f9;
                transition: all 0.2s;
                outline: none;
            }
            
            #location-search:focus {
                background: white;
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
            }
            
            .search-clear {
                position: absolute;
                right: 24px;
                background: none;
                border: none;
                color: #999;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }

            .locations-list {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
                overscroll-behavior: contain;
            }
            
            .location-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .location-item:hover {
                background: #f5f7fa;
            }
            
            .current-location-item {
                background: #F0F9FF;
                margin-bottom: 8px;
                border: 1px dashed #BAE6FD;
            }
            
            .current-location-item:hover {
                background: #E0F2FE;
            }
            
            .location-icon {
                font-size: 18px;
                width: 32px;
                height: 32px;
                background: #fff;
                border: 1px solid #eee;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .current-location-item .location-icon {
                color: #0284C7;
                border-color: #BAE6FD;
            }
            
            .location-info {
                flex: 1;
                min-width: 0;
            }
            
            .location-name {
                font-size: 14px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 0;
            }
            
            .location-description {
                font-size: 11px;
                color: #666;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .location-meta {
                text-align: right;
                flex-shrink: 0;
            }
            
            .location-distance {
                font-size: 12px;
                font-weight: 600;
                color: #0284C7;
            }
            
            .group-title {
                font-size: 11px;
                font-weight: 600;
                color: #999;
                margin: 8px 4px 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .no-results {
                text-align: center;
                padding: 24px 0;
                color: #999;
                font-size: 13px;
            }
        </style>
    `;
}

function renderLocationsList() {
    const container = document.getElementById('locations-list');
    if (!container) return;

    let locations = [];

    if (searchQuery) {
        locations = searchLocations(searchQuery);
    } else {
        // Just show popular + all sorted by name
        locations = getPopularLocations();
        // If list is short, add more
        if (locations.length < 5) {
            const all = getAllLocations();
            locations = [...locations, ...all.filter(l => !l.popular).slice(0, 10)];
        }
    }

    if (locations.length === 0) {
        container.innerHTML = '<div class="no-results">No locations found</div>';
        return;
    }

    let html = '';

    // "Use Current Location" always first
    html += `
        <div class="location-item current-location-item" id="use-current-location">
            <div class="location-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            </div>
            <div class="location-info">
                <div class="location-name">Use Current Location</div>
                <div class="location-description">Detect GPS</div>
            </div>
        </div>
    `;

    // Locations
    html += locations.map(loc => renderLocationItem(loc)).join('');

    container.innerHTML = html;

    // Attach listeners
    const currentLocBtn = container.querySelector('#use-current-location');
    if (currentLocBtn) {
        currentLocBtn.addEventListener('click', selectCurrentLocation);
    }

    container.querySelectorAll('.location-item:not(.current-location-item)').forEach(item => {
        item.addEventListener('click', () => {
            selectLocation(item.dataset.locationId);
        });
    });
}

function renderLocationItem(location) {
    return `
        <div class="location-item" data-location-id="${location.id}">
            <div class="location-icon">${getTypeEmoji(location.type)}</div>
            <div class="location-info">
                <div class="location-name">${location.name}</div>
                <div class="location-description">${location.description}</div>
            </div>
        </div>
    `;
}

function attachPopoverListeners() {
    const searchInput = document.getElementById('location-search');
    const clearBtn = document.getElementById('clear-search');
    const overlay = document.querySelector('.popover-overlay');

    // Close on click outside
    overlay.addEventListener('click', closePopover);

    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        if (searchQuery) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
        renderLocationsList();
    });

    // Clear search
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearBtn.classList.add('hidden');
        renderLocationsList();
    });
}

function selectLocation(locationId) {
    const location = getLocationById(locationId);
    if (!location) return;

    setState('savedLocation', location);
    setState('locationMode', LOCATION_MODES.SAVED);
    saveLocationPreferences({ mode: LOCATION_MODES.SAVED, savedLocation: location });

    if (window.updatePlaces) window.updatePlaces();

    closePopover();
}

function selectCurrentLocation() {
    setState('savedLocation', null);
    setState('locationMode', LOCATION_MODES.CURRENT);
    saveLocationPreferences({ mode: LOCATION_MODES.CURRENT, savedLocation: null });

    if (window.updatePlaces) window.updatePlaces();

    closePopover();
}

function closePopover() {
    const popover = document.getElementById('location-selector-popover');
    if (popover) {
        popover.classList.remove('active');
        setTimeout(() => {
            popover.remove();
        }, 200);
    }
}

// Attach to window
window.showLocationSelector = showLocationSelector;
