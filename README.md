# 🌴 Goa Nearby Places

A modern, responsive web application for discovering nearby tourist places in Goa with real-time distance tracking. Built with Vite, Tailwind CSS, and vanilla JavaScript.

## ✨ Features

- 📍 **Real-time Geolocation Tracking** - Automatically detects and monitors your location
- 📏 **Accurate Distance Calculation** - Uses Haversine formula for 90%+ accuracy
- 🔄 **Auto-updating Distances** - Recalculates every 30 seconds as you move
- 🎨 **Modern UI** - Beautiful gradients, animations, and responsive design
- 🔍 **Smart Search** - Search across place names, descriptions, and tags
- 🏷️ **Category Filtering** - Filter by Beach, Historical, Nature, Religious, Shopping
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- 💾 **JSON-based Data** - Easy to edit and maintain without coding
- 🚫 **No API Costs** - All calculations done client-side

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173/`

## 📁 Project Structure

```
goa-nearby/
├── src/
│   ├── data/
│   │   ├── places.json       # Tourist places with coordinates
│   │   └── config.json       # App configuration
│   ├── utils/
│   │   └── geolocation.js    # Distance calculation & location tracking
│   ├── services/
│   │   └── placesService.js  # Data filtering & search
│   ├── main.js               # Main application logic
│   └── style.css             # Tailwind CSS styles
├── public/
│   └── images/               # Place images (replace placeholders)
└── index.html                # Main HTML file
```

## 🎯 Customization

### Adding New Places

Edit `src/data/places.json`:

```json
{
  "id": 13,
  "name": "Your Place Name",
  "category": "Beach",
  "description": "Place description",
  "latitude": 15.1234,
  "longitude": 73.5678,
  "image": "your-image.jpg",
  "rating": 4.5,
  "tags": ["tag1", "tag2"]
}
```

**Getting Coordinates:**
1. Open Google Maps
2. Right-click on the location
3. Click "What's here?"
4. Copy the latitude and longitude

### Changing Update Interval

Edit `distanceUpdateInterval` in `src/data/config.json`:

```json
{
  "distanceUpdateInterval": 60000  // 60 seconds (in milliseconds)
}
```

### Replacing Images

1. Navigate to `public/images/`
2. Replace placeholder files with actual images
3. Keep the same filenames as referenced in `places.json`

**Required Images:**
- baga-beach.jpg
- fort-aguada.jpg
- dudhsagar-falls.jpg
- bom-jesus.jpg
- anjuna-market.jpg
- calangute-beach.jpg
- chapora-fort.jpg
- palolem-beach.jpg
- spice-plantation.jpg
- saturday-market.jpg
- vagator-beach.jpg
- se-cathedral.jpg
- logo.png

### Adding Categories

1. Add to `categories` array in `src/data/config.json`
2. Update `getCategoryIcon()` in `src/main.js` to add an emoji

## 🧮 How Distance Calculation Works

The app uses the **Haversine formula** to calculate great-circle distances between two points on Earth:

```javascript
distance = 2 * R * arcsin(√(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))
```

Where:
- `R` = Earth's radius (6371 km)
- `Δlat` = difference in latitudes
- `Δlon` = difference in longitudes

This provides **90%+ accuracy** for distances up to 100km, perfect for nearby places!

## 🌐 Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Note:** Geolocation requires HTTPS in production (works on localhost for development)

## 📱 Mobile Support

The app is fully responsive and works great on:
- 📱 Smartphones (iOS & Android)
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens

## 🔒 Privacy

- Location data is **never sent to any server**
- All calculations happen **locally in your browser**
- No tracking, no analytics, no data collection
- Location permission can be denied (app will use default location)

## 🛠️ Technologies Used

- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - No framework overhead
- **Geolocation API** - Browser's built-in location service
- **JSON** - Simple data storage

## 📊 Data Format

### Place Object
```json
{
  "id": 1,
  "name": "Place Name",
  "category": "Beach|Historical|Nature|Religious|Shopping",
  "description": "Short description",
  "latitude": 15.5559,
  "longitude": 73.7516,
  "image": "image-filename.jpg",
  "rating": 4.5,
  "tags": ["tag1", "tag2", "tag3"]
}
```

### Config Object
```json
{
  "appName": "Goa Nearby",
  "logo": "logo.png",
  "defaultLocation": {
    "latitude": 15.4909,
    "longitude": 73.8278,
    "name": "Panaji, Goa"
  },
  "distanceUpdateInterval": 30000,
  "maxDistance": 100,
  "categories": ["All", "Beach", "Historical", "Nature", "Religious", "Shopping"]
}
```

## 🎨 Design Philosophy

- **Modern & Vibrant** - Eye-catching gradients and colors
- **User-Friendly** - Intuitive interface with clear visual hierarchy
- **Performance** - Optimized for fast loading and smooth interactions
- **Accessibility** - Semantic HTML and proper contrast ratios

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to:
- Add more places to the database
- Improve the UI/UX
- Add new features
- Fix bugs
- Optimize performance

## 💡 Tips

1. **Allow Location Access** - For the best experience, allow location access when prompted
2. **Keep Moving** - Distances update automatically as you move around
3. **Use Search** - Quickly find specific types of places
4. **Check Ratings** - Places are rated to help you choose
5. **Read Tags** - Tags give you quick insights about each place

## 🐛 Troubleshooting

**Location not working?**
- Check browser permissions
- Ensure you're on HTTPS (or localhost)
- Try refreshing the page

**Images not showing?**
- Replace placeholder files in `public/images/`
- Ensure filenames match those in `places.json`

**Distances seem wrong?**
- Check that coordinates in `places.json` are correct
- Ensure latitude/longitude are not swapped

---

**Built with ❤️ for exploring beautiful Goa! 🌴**
