import { getConfig } from '../services/placesService.js';

// App state
export const state = {
  userLocation: null,
  locationWatchId: null,
  places: [],
  allPlaces: [],
  filteredPlaces: [],
  currentCategory: 'All',
  updateInterval: null,
  searchVisible: false,
  sidebarVisible: false,
  currentView: 'list', // list, detail, settings, about, privacy
  selectedPlace: null,
  config: getConfig(),
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),

  // Location Switcher State
  locationMode: 'current', // 'current', 'saved', 'custom'
  savedLocation: null, // { id, name, latitude, longitude, ... }
  isOutsideGoa: false,
  hasSeenWelcome: false
};

// Simple event system
const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

export function notify(event, data) {
  listeners.forEach(listener => listener(event, data));
}

export function setState(key, value) {
  state[key] = value;
  notify(key, value);
}
