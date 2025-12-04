import fs from 'fs';

const GOA_LOCATIONS_PATH = './src/data/goaLocations.json';
const NEW_COORDS_PATH = './new_locations_coords.json';

try {
    const existingData = JSON.parse(fs.readFileSync(GOA_LOCATIONS_PATH, 'utf8'));
    const newData = JSON.parse(fs.readFileSync(NEW_COORDS_PATH, 'utf8'));

    let addedCount = 0;
    let updatedCount = 0;

    newData.forEach(newLoc => {
        // Check if exists
        const existingIndex = existingData.locations.findIndex(l => l.id === newLoc.id || l.name === newLoc.name);

        if (existingIndex !== -1) {
            // Update if needed (e.g. if existing has no coords, but we found some)
            // For now, we trust existing data more unless it's missing coords
            // But actually, existing data is manually curated, so let's keep it.
            // console.log(`Skipping existing: ${newLoc.name}`);
        } else {
            // Add new
            // Assign a default type/vibe if not present
            const locationToAdd = {
                id: newLoc.id,
                name: newLoc.name,
                latitude: newLoc.latitude,
                longitude: newLoc.longitude,
                type: newLoc.type || 'town',
                vibe: newLoc.vibe || ['local'],
                description: newLoc.description || 'Location in Goa',
                popular: false,
                image: 'default-place.png' // Fallback image
            };
            existingData.locations.push(locationToAdd);
            addedCount++;
        }
    });

    // Sort alphabetically
    existingData.locations.sort((a, b) => a.name.localeCompare(b.name));

    fs.writeFileSync(GOA_LOCATIONS_PATH, JSON.stringify(existingData, null, 2));
    console.log(`Successfully merged! Added ${addedCount} locations.`);

} catch (error) {
    console.error('Error merging locations:', error);
}
