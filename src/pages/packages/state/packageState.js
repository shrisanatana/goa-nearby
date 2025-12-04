import config from '../../../data/config.json';

// Package state
export const packageState = {
    currentPackage: '4hr',
    selectedPlaces: [],
    isCalculating: false,
    excludedCategories: []
};

export const PACKAGES = {
    '4hr': { label: '4 Hr / 40 Kms', maxDist: 40, maxTime: 4 },
    '8hr': { label: '8 Hr / 80 Kms', maxDist: 80, maxTime: 8 },
    '12hr': { label: '12 Hr / 120 Kms', maxDist: 120, maxTime: 12 }
};

// Get all available categories from config
export function getAvailableCategories() {
    return config.categories.filter(c => c !== 'All');
}

// Toggle category exclusion
export function toggleCategory(category) {
    const index = packageState.excludedCategories.indexOf(category);
    if (index > -1) {
        packageState.excludedCategories.splice(index, 1);
    } else {
        packageState.excludedCategories.push(category);
    }
}

// Check if category is excluded
export function isCategoryExcluded(category) {
    return packageState.excludedCategories.includes(category);
}

// Reset state
export function resetPackageState() {
    packageState.currentPackage = '4hr';
    packageState.selectedPlaces = [];
    packageState.isCalculating = false;
    packageState.excludedCategories = [];
}
