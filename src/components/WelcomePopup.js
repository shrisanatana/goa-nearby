import { state } from '../state/appState.js';
import { showLocationSelector } from './LocationSelector.js';
import { getPopularLocations, saveLocationPreferences, LOCATION_MODES } from '../services/locationService.js';

/**
 * Welcome Popup for users outside Goa
 * Shows on first visit when user is detected >100km from Panaji
 */

export function showWelcomePopup() {
    const popup = document.createElement('div');
    popup.id = 'welcome-popup';
    popup.className = 'welcome-popup';
    popup.innerHTML = getPopupHTML();

    document.body.appendChild(popup);

    // Animate in
    requestAnimationFrame(() => {
        popup.classList.add('active');
    });

    attachPopupListeners();
}

function getPopupHTML() {
    const popularLocations = getPopularLocations().slice(0, 6);

    return `
        <div class="popup-overlay"></div>
        <div class="popup-container">
            <!-- Animated Icon -->
            <div class="popup-icon">
                <div class="icon-circle">
                    <span class="icon-emoji">🏖️</span>
                </div>
                <div class="icon-waves">
                    <div class="wave"></div>
                    <div class="wave"></div>
                    <div class="wave"></div>
                </div>
            </div>
            
            <!-- Content -->
            <div class="popup-content">
                <h2 class="popup-title">Welcome to Goa Nearby!</h2>
                <p class="popup-message">
                    We noticed you're outside Goa. Select your staying area to discover nearby places and plan your perfect trip!
                </p>
                
                <!-- Quick Select -->
                <div class="quick-select">
                    <div class="quick-select-title">Popular Areas</div>
                    <div class="quick-select-grid">
                        ${popularLocations.map(loc => `
                            <button class="quick-location" data-location-id="${loc.id}">
                                <span class="quick-icon">${getLocationIcon(loc.type)}</span>
                                <span class="quick-name">${loc.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="popup-actions">
                    <button class="btn-browse" id="browse-all">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2 10a8 8 0 1116 0 8 8 0 01-16 0z"/>
                            <path d="M10 7a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 0110 7z"/>
                        </svg>
                        Browse All 45+ Locations
                    </button>
                    <button class="btn-current" id="use-current">
                        Use Current Location
                    </button>
                    <button class="btn-skip" id="skip-welcome">
                        I'll choose later
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Styles -->
        <style>
            .welcome-popup {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .welcome-popup.active {
                opacity: 1;
            }
            
            .popup-overlay {
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
                backdrop-filter: blur(10px);
                animation: overlayFade 0.5s;
            }
            
            @keyframes overlayFade {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .popup-container {
                position: relative;
                background: white;
                border-radius: 32px;
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
                animation: popupSlide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            @keyframes popupSlide {
                from {
                    transform: scale(0.8) translateY(40px);
                    opacity: 0;
                }
                to {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
            }
            
            .popup-icon {
                position: relative;
                padding: 48px 0 32px;
                display: flex;
                justify-content: center;
            }
            
            .icon-circle {
                position: relative;
                width: 120px;
                height: 120px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
                animation: iconFloat 3s ease-in-out infinite;
            }
            
            @keyframes iconFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .icon-emoji {
                font-size: 64px;
                line-height: 1;
            }
            
            .icon-waves {
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 200px;
                height: 40px;
            }
            
            .wave {
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 100%;
                height: 2px;
                background: linear-gradient(90deg, transparent, #667eea, transparent);
                border-radius: 50%;
                animation: wave 2s ease-in-out infinite;
            }
            
            .wave:nth-child(2) {
                animation-delay: 0.3s;
                opacity: 0.7;
            }
            
            .wave:nth-child(3) {
                animation-delay: 0.6s;
                opacity: 0.4;
            }
            
            @keyframes wave {
                0% {
                    transform: translateX(-50%) scale(0.5);
                    opacity: 0;
                }
                50% {
                    opacity: 1;
                }
                100% {
                    transform: translateX(-50%) scale(1.5);
                    opacity: 0;
                }
            }
            
            .popup-content {
                padding: 0 32px 32px;
            }
            
            .popup-title {
                font-size: 28px;
                font-weight: 800;
                color: #1a1a1a;
                text-align: center;
                margin: 0 0 16px;
            }
            
            .popup-message {
                font-size: 16px;
                color: #666;
                text-align: center;
                line-height: 1.6;
                margin: 0 0 32px;
            }
            
            .quick-select {
                margin-bottom: 24px;
            }
            
            .quick-select-title {
                font-size: 14px;
                font-weight: 700;
                color: #999;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 12px;
            }
            
            .quick-select-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }
            
            .quick-location {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 14px;
                background: #f8f9ff;
                border: 2px solid transparent;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
                font-weight: 600;
                color: #1a1a1a;
            }
            
            .quick-location:hover {
                background: white;
                border-color: #667eea;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
            }
            
            .quick-icon {
                font-size: 24px;
                line-height: 1;
            }
            
            .quick-name {
                flex: 1;
                text-align: left;
            }
            
            .popup-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .btn-browse {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .btn-browse:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }
            
            .btn-current {
                width: 100%;
                padding: 14px;
                background: white;
                color: #667eea;
                border: 2px solid #667eea;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-current:hover {
                background: #f8f9ff;
            }
            
            .btn-skip {
                width: 100%;
                padding: 12px;
                background: none;
                color: #999;
                border: none;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-skip:hover {
                color: #666;
            }
        </style>
    `;
}

function getLocationIcon(type) {
    const icons = {
        beach: '🏖️',
        city: '🏙️',
        town: '🏘️',
        village: '🏡',
        historical: '🏛️'
    };
    return icons[type] || '📍';
}

function attachPopupListeners() {
    const browseBtn = document.getElementById('browse-all');
    const currentBtn = document.getElementById('use-current');
    const skipBtn = document.getElementById('skip-welcome');
    const quickLocations = document.querySelectorAll('.quick-location');

    // Browse all locations
    browseBtn.addEventListener('click', () => {
        closeWelcomePopup();
        showLocationSelector();
    });

    // Use current location
    currentBtn.addEventListener('click', () => {
        state.locationMode = LOCATION_MODES.CURRENT;
        saveLocationPreferences({
            mode: LOCATION_MODES.CURRENT,
            hasSeenWelcome: true
        });
        closeWelcomePopup();
        if (window.updateLocationWidget) {
            window.updateLocationWidget();
        }
    });

    // Skip
    skipBtn.addEventListener('click', () => {
        saveLocationPreferences({
            hasSeenWelcome: true
        });
        closeWelcomePopup();
    });

    // Quick location selection
    quickLocations.forEach(btn => {
        btn.addEventListener('click', () => {
            const locationId = btn.dataset.locationId;
            selectQuickLocation(locationId);
        });
    });
}

function selectQuickLocation(locationId) {
    const { getLocationById } = require('../services/locationService.js');
    const location = getLocationById(locationId);

    if (!location) return;

    state.savedLocation = location;
    state.locationMode = LOCATION_MODES.SAVED;

    saveLocationPreferences({
        mode: LOCATION_MODES.SAVED,
        savedLocation: location,
        hasSeenWelcome: true
    });

    closeWelcomePopup();

    if (window.updateLocationWidget) {
        window.updateLocationWidget();
    }

    if (window.updatePlaces) {
        window.updatePlaces();
    }
}

function closeWelcomePopup() {
    const popup = document.getElementById('welcome-popup');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
}

// Attach to window
window.showWelcomePopup = showWelcomePopup;
