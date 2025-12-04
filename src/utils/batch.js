
import { state } from '../state/appState.js';
import { calculateDistance, formatDistance } from './geolocation.js';
import { renderPlaceCard } from '../pages/Home/components/PlaceCard.js';

// --- NEW: background distance batch controller & helpers ---
export let distanceBatchController = { token: 0, running: false };
export let distanceDebounceTimer = null;

// Render batch controller (to render cards incrementally)
export let renderBatchController = { token: 0, running: false, index: 0 };

// Use config batch size if provided, fallback to 200
// We need to access config from state, but state might not be fully initialized if we destructure early.
// We'll access state.config inside functions.

// Small helper to run callbacks when browser is idle, fallback to setTimeout
export function runIdle(fn) {
    /* istanbul ignore next */
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(fn, { timeout: 200 });
    } else {
        setTimeout(fn, 0);
    }
}

import { getEffectiveLocation } from '../services/locationService.js';

// Schedule a fresh batch compute (debounced) — cancels any running batch by bumping token
export function scheduleDistanceBatchCompute(delay = 150) {
    if (distanceDebounceTimer) clearTimeout(distanceDebounceTimer);
    distanceDebounceTimer = setTimeout(() => {
        distanceBatchController.token += 1;
        const token = distanceBatchController.token;

        const effectiveLocation = getEffectiveLocation(state);
        if (!effectiveLocation) return;

        batchComputeDistances(token, effectiveLocation);
    }, delay);
}

// Batch compute distances and progressively update DOM
function batchComputeDistances(token, loc) {
    // Prevent concurrent runs for same token
    if (distanceBatchController.running && token === distanceBatchController.runningToken) return;
    distanceBatchController.running = true;
    distanceBatchController.runningToken = token;

    const { config } = state;
    const DISTANCE_BATCH_SIZE = (config && config.distanceBatchSize) ? config.distanceBatchSize : 200;

    const items = state.places; // places is the array rendered (may have distance: null)
    const total = items.length;
    let i = 0;

    const pinSvg = `<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>`;

    const processChunk = () => {
        // If token changed meanwhile, abort
        if (token !== distanceBatchController.token) {
            distanceBatchController.running = false;
            return;
        }

        const end = Math.min(i + DISTANCE_BATCH_SIZE, total);
        for (; i < end; i++) {
            const p = items[i];
            // calculateDistance imported earlier; if userLocation missing, keep null
            if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
                const d = calculateDistance(loc.latitude, loc.longitude, p.latitude, p.longitude);
                p.distance = d;
            } else {
                p.distance = null;
            }

            // Update DOM for this card if it's rendered
            const card = document.querySelector(`.place-card[data-id="${p.id}"]`);
            if (card) {
                const badge = card.querySelector('span.bg-white\\/95');
                if (badge) {
                    const distanceText = p.distance !== null ? formatDistance(p.distance) : '-- km';
                    badge.innerHTML = `${pinSvg} ${distanceText} from you`;
                }
            }
        }

        // If more to process, schedule next chunk
        if (i < total) {
            runIdle(processChunk);
        } else {
            distanceBatchController.running = false;
        }
    };

    // start processing
    runIdle(processChunk);
}

// --- NEW: incremental rendering (batch) ---
export function scheduleRenderBatches(delay = 0) {
    renderBatchController.token += 1;
    const token = renderBatchController.token;
    // start fresh render after optional delay
    setTimeout(() => {
        batchRenderPlaces(token);
    }, delay);
}

function batchRenderPlaces(token) {
    // cancel if another token started
    if (renderBatchController.running && token === renderBatchController.runningToken) return;
    renderBatchController.running = true;
    renderBatchController.runningToken = token;
    renderBatchController.index = 0;

    const container = document.querySelector('#places-container');
    if (!container) return;

    // Get or create grid
    let grid = document.getElementById('places-grid');

    // If grid doesn't exist, create it
    if (!grid) {
        container.innerHTML = `<div id="places-grid" class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 pb-20"></div>`;
        grid = document.getElementById('places-grid');
        if (!grid) { renderBatchController.running = false; return; }
    }

    // Add fade-out transition to existing cards
    const existingCards = grid.querySelectorAll('.place-card, .skeleton-card');
    if (existingCards.length > 0) {
        existingCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transition = 'opacity 150ms ease-out';
        });

        // Wait for fade out, then show skeleton and render new cards
        setTimeout(() => {
            // Show skeleton cards while loading
            const skeletonCount = Math.min(state.filteredPlaces.length, 8);
            const skeletonHTML = Array(skeletonCount).fill(0).map(() => `
                <div class="skeleton-card bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div class="h-28 bg-gray-200"></div>
                    <div class="p-3 space-y-2">
                        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            `).join('');

            grid.innerHTML = skeletonHTML;

            // Fade in skeletons
            requestAnimationFrame(() => {
                const skeletons = grid.querySelectorAll('.skeleton-card');
                skeletons.forEach(skeleton => {
                    skeleton.style.opacity = '0';
                    skeleton.style.transition = 'opacity 150ms ease-in';
                    skeleton.offsetHeight;
                    skeleton.style.opacity = '1';
                });
            });

            // Start rendering actual cards after a brief moment
            setTimeout(() => {
                grid.innerHTML = '';
                renderNewCards(token, grid);
            }, 100);
        }, 150);
    } else {
        // No existing cards, render immediately
        renderNewCards(token, grid);
    }
}

function renderNewCards(token, grid) {
    const total = state.filteredPlaces.length;
    const { config } = state;
    const RENDER_BATCH_SIZE = (config && config.renderBatchSize) ? config.renderBatchSize : 200;

    const process = () => {
        // abort if token changed
        if (token !== renderBatchController.token) {
            renderBatchController.running = false;
            return;
        }

        const start = renderBatchController.index;
        const end = Math.min(start + RENDER_BATCH_SIZE, total);
        if (start >= end) {
            renderBatchController.running = false;
            return;
        }

        // Build HTML for this chunk and append
        const html = state.filteredPlaces.slice(start, end).map(renderPlaceCard).join('');
        grid.innerHTML += html;

        // Fade in new cards
        const newCards = grid.querySelectorAll('.place-card');
        newCards.forEach((card, index) => {
            if (index >= start) {
                card.style.opacity = '0';
                card.style.transition = 'opacity 200ms ease-in';
                // Trigger reflow
                card.offsetHeight;
                card.style.opacity = '1';
            }
        });

        renderBatchController.index = end;

        // If more, schedule next chunk during idle time
        if (renderBatchController.index < total) {
            runIdle(process);
        } else {
            renderBatchController.running = false;
            // After render completes, if we already have location, kick off distance computation
            if (state.userLocation) scheduleDistanceBatchCompute(0);
        }
    };

    runIdle(process);
}


