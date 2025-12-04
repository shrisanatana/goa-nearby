import https from 'https';
import fs from 'fs';

const locations = [
    "Agonda", "Anjuna", "Arambol", "Arpora", "Assagao", "Baga", "Benaulim", "Betim", "Cabo De Rama", "Calangute",
    "Canacona", "Candolim", "Caranzalem", "Cola Beach", "Colva", "Dabolim Airport", "Dona Paula", "Karmali Railway Station",
    "Madgaon Railway Station", "Majorda", "Mapusa", "Miramar", "Mobor", "Mopa Airport", "Morjim", "Navelim", "Nerul",
    "Old Goa", "Panaji", "Parra", "Patnem", "Pernem", "Ponda", "Porvorim", "Sinquerim", "Siolim", "Thivim Railway Station",
    "Vagator", "Varca", "Vasco Railway Station", "Chapora", "Mandrem", "Saligao", "Assanora", "Aldona", "Amona",
    "Agassaim", "Bicholim", "Britona", "Banastarim", "Bambolim", "Betul", "Bethora", "Balli", "Bhoma", "Colvale",
    "Chodan", "Chicalim", "Cortalim", "Cuncolim", "Curca", "Cavelossim", "Divar Island", "Dharbandora", "Farmagudi",
    "Fatorda", "Goa Velha", "Harvalem", "Kundaim", "Keri", "Khandepar", "Molem", "Mardol", "Netravali", "Poinguinim",
    "Querim", "Reis Magos", "Sanquelim", "Tivim", "Valpoi", "Xeldem", "Sancoale", "Savoi Verem", "Shiroda", "Sanguem",
    "Tambdi Surla", "Usgao", "Verna", "Zuari Nagar", "Aquem", "Bambolim Beach", "Batim", "Cansaulim", "Chinchinim",
    "Collem", "Davorlim", "Gudi Paroda", "Loutolim", "Macazana", "Orlim", "Paroda", "Quepem", "Raia", "Seraulim",
    "Talaulim", "Utorda", "Vaddem", "Velsao", "Aquem Alto", "Benaulim Beach", "Cortalim Junction", "Dabolim City",
    "Gogol", "Korgao", "Mallim", "Nuvem", "Odxel", "Pale", "Quitol", "Rivona", "Sao Jose de Areal", "Taleigao",
    "Uccasaim", "Vagator Beach", "Xelvona", "Zambaulim", "Amona Beach", "Betalbatim", "Colmorod", "Dudhsagar",
    "Ganjem", "Keri Beach", "Mollem", "Nanora", "Olaulim", "Pilerne", "Sancoale Beach", "Velsao Beach"
];

const results = [];
let index = 0;

function fetchCoordinates() {
    if (index >= locations.length) {
        console.log('Finished fetching coordinates.');
        fs.writeFileSync('new_locations_coords.json', JSON.stringify(results, null, 2));
        return;
    }

    const locationName = locations[index];
    const query = encodeURIComponent(`${locationName}, Goa`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const options = {
        headers: {
            'User-Agent': 'GoaNearbyApp/1.0 (admin@goanearby.com)' // Required by Nominatim
        }
    };

    console.log(`Fetching ${locationName} (${index + 1}/${locations.length})...`);

    https.get(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json && json.length > 0) {
                    results.push({
                        id: locationName.toLowerCase().replace(/\s+/g, '-'),
                        name: locationName,
                        latitude: parseFloat(json[0].lat),
                        longitude: parseFloat(json[0].lon),
                        type: 'town', // Default
                        vibe: ['local'], // Default
                        description: `Location in Goa`,
                        popular: false
                    });
                    console.log(`  Found: ${json[0].lat}, ${json[0].lon}`);
                } else {
                    console.log(`  Not found: ${locationName}`);
                    // Add with default coords (Panaji) or skip?
                    // Let's skip for now or mark as needing manual fix
                    results.push({
                        id: locationName.toLowerCase().replace(/\s+/g, '-'),
                        name: locationName,
                        latitude: 15.4909, // Panaji fallback
                        longitude: 73.8278,
                        type: 'town',
                        vibe: ['local'],
                        description: `Location in Goa (Approx)`,
                        popular: false,
                        notFound: true
                    });
                }
            } catch (e) {
                console.error(`  Error parsing JSON for ${locationName}:`, e.message);
            }

            index++;
            setTimeout(fetchCoordinates, 1200); // 1.2s delay to be polite
        });
    }).on('error', (err) => {
        console.error(`  Error fetching ${locationName}:`, err.message);
        index++;
        setTimeout(fetchCoordinates, 1200);
    });
}

fetchCoordinates();
