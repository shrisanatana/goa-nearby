/**
 * Validate if an image exists and can be loaded
 * @param {string} imagePath - Path to the image
 * @returns {Promise<boolean>} - True if image exists and loads successfully
 */
export function validateImage(imagePath) {
    return new Promise((resolve) => {
        if (!imagePath || imagePath.includes('placeholder')) {
            resolve(false);
            return;
        }

        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imagePath;

        // Timeout after 2 seconds
        setTimeout(() => resolve(false), 2000);
    });
}

/**
 * Check if image should be displayed (synchronous check)
 * @param {string} imagePath - Path to the image
 * @returns {boolean} - True if image path looks valid
 */
export function shouldShowImage(imagePath) {
    if (!imagePath) return false;
    if (imagePath.includes('placeholder')) return false;
    // Basic validation - has proper extension
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(imagePath);
}
