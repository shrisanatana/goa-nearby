import { state } from '../state/appState.js';
import { showLocationSelector } from './LocationSelector.js';
import { getEffectiveLocation, LOCATION_MODES } from '../services/locationService.js';

export function createLocationWidget() {
    const widget = document.createElement('div');
    widget.id = 'location-widget';
    widget.className = 'location-widget';
    widget.innerHTML = getWidgetHTML();

    document.body.appendChild(widget);

    // Attach listener
    widget.addEventListener('click', () => {
        showLocationSelector();
    });

    // Expose update function
    window.updateLocationWidget = () => {
        const widget = document.getElementById('location-widget');
        if (widget) {
            widget.innerHTML = getWidgetHTML();
        }
    };
}

function getWidgetHTML() {
    const { locationMode, savedLocation } = state;
    let locationName = 'Current Location';
    let isCustom = false;

    if (locationMode === LOCATION_MODES.SAVED && savedLocation) {
        locationName = savedLocation.name;
        isCustom = true;
    }

    // Truncate if too long
    if (locationName.length > 15) {
        locationName = locationName.substring(0, 12) + '...';
    }

    return `
        <div class="widget-container">
            <div class="location-label">
                <span class="label-text">${locationName}</span>
            </div>
            <button class="widget-fab ${isCustom ? 'custom-active' : ''}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fab-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            </button>
        </div>
        
        <style>
            .location-widget {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9990;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                pointer-events: none;
            }

            .widget-container {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                pointer-events: auto;
                cursor: pointer;
                gap: 8px;
            }

            .location-label {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(8px);
                padding: 4px 10px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border: 1px solid rgba(0,0,0,0.05);
                transform: translateY(0);
                transition: all 0.3s ease;
            }

            .label-text {
                color: #333;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                letter-spacing: 0.3px;
            }

            .widget-fab {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: white;
                border: 1px solid rgba(0,0,0,0.05);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                color: #667eea;
            }

            .widget-fab:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                color: #5a67d8;
            }

            .widget-fab:active {
                transform: scale(0.95);
            }

            .widget-fab.custom-active {
                background: #667eea;
                color: white;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .widget-fab.custom-active:hover {
                background: #5a67d8;
            }

            .fab-icon {
                width: 22px;
                height: 22px;
            }
        </style>
    `;
}
