# DishaSetu — AI-Powered Smart Campus Navigation System
> **Your Campus. Your Direction. Your Way.**  
> **Presidency University, Bengaluru, Karnataka, India**

DishaSetu is a modern, unified campus navigation platform built for Presidency University Bengaluru. It empowers students, visitors, faculty, and administrative staff to easily discover and navigate the university campus—from the Main Gate to buildings, departments, facilities, parking areas, and gardens with real geographic accuracy.

---

## Highlights

- **Real Geographic Accuracy**: Built with verified GPS coordinates and ground survey data for Presidency University Bengaluru. No fictional 3D buildings or cartoon maps.
- **Unified Interactive Map**: Opens at the **Presidency University – Main Gate** by default at zoom level 18.
- **Fit Campus View**: Instantly frames all registered campus features inside the viewport without cropping.
- **Walking Avenue Corridor**: Combined pedestrian corridor with ordered right and left paved boundaries and a central landscaped tree divider.
- **Preserved Polygon Geometries**: The 19-point irregular campus garden polygon and non-self-intersecting 2-wheeler parking lot.
- **Turn-by-Turn Pedestrian Navigation**: Walking route from Main Gate to Central Fountain with estimated time (~4.5 min) and distance (345 m).
- **Responsive Dark Navy Interface**: High-contrast, accessibility-focused design system with Street Map and Satellite imagery toggles.
- **Single Central Backend**: Node.js & Express REST API with MongoDB Atlas `dishaSetu_db` support and embedded fallback resilience.
- **Cross-Platform Readiness**: React + Vite web application and Flutter Android/iOS mobile application sharing the same database and APIs.

---

## Technology Stack

- **Web Frontend**: React 18, Vite, Tailwind CSS, Leaflet.js, React-Leaflet, Lucide Icons.
- **Mobile Application**: Flutter, Dart, Geolocator, Shared API integration.
- **Backend**: Node.js, Express.js, REST API, Native Crypto JWT Auth, GeoJSON support.
- **Database**: MongoDB Atlas (`dishaSetu_db`) with Mongoose ODM.
- **Design System**: Dark Navy (`#0b132b`, `#0f172a`, `#1e293b`), Emerald Entrance, Sky Blue Walkways, Emerald Gardens, Orange Parking.

---

## Quickstart Guide

### 1. Prerequisites
- Node.js v18+ or v20+
- npm v9+

### 2. Start the Backend API
```powershell
cd server
npm start
```
The server will run on `http://localhost:5000`.  
- Health check: `http://localhost:5000/api/health`
- Campus overview: `http://localhost:5000/api/campus`
- Verified features: `http://localhost:5000/api/features`
- Campus locations: `http://localhost:5000/api/locations`
- Walking routes: `http://localhost:5000/api/routes`

### 3. Start the Web Frontend
```powershell
cd web
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```powershell
cd web
npm run build
```

---

## Seed Database
To populate MongoDB Atlas with the verified coordinates:
```powershell
cd server
npm run seed
```

---

## Verified Geographic Coordinates

| Campus Feature | Coordinates (Lat, Lng) | Status |
|---|---|---|
| **Presidency Main Gate** | `13.1717995, 77.5361915` | Verified Ground Origin |
| **Main Gate Span** | `13.171733, 77.535971` to `13.171866, 77.536412` | Verified Entrance Span |
| **Walking Avenue Start** | 3 Surveyed Reference Points | Verified |
| **Walking Avenue Corridor** | 10 Right Points + 10 Left Points | Verified Pedestrian Corridor |
| **Central Tree Divider** | `13.171202, 77.536032` to `13.169761, 77.535234` | Verified Landscaped Median |
| **Campus Central Garden** | 19 Ordered Boundary Points | Verified Polygon Geometry |
| **Two-Wheeler Parking Area** | 4 Boundary Points | Validated Non-intersecting Ring |
| **Two-Wheeler Parking Entry** | `13.171786, 77.535561` to `13.171706, 77.535518` | Verified Vehicular Span |
| **Campus Central Fountain** | `13.169277, 77.534963` | Verified Landmark |

---

## License
Presidency University Bengaluru © 2026. All rights reserved.
