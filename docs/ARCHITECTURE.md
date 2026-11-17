# DISHASETU: AI-Powered Smart Campus Navigation System
## Presidency University, Bengaluru, Karnataka, India
### Architectural Blueprint & Specification

---

## 1. System Architecture

```
                                +-----------------------------+
                                |  Presidency University GIS  |
                                |  Ground Survey Coordinates  |
                                +--------------+--------------+
                                               |
                                               v
                          +---------------------------------------+
                          |   MongoDB Atlas Database              |
                          |   DB Name: dishaSetu_db               |
                          |   Collections:                        |
                          |   - campuses (Perimeter & Settings)   |
                          |   - campusfeatures (Polygons/Lines)   |
                          |   - locations (POIs & Entrances)      |
                          |   - routes (Pedestrian Graphs)        |
                          |   - buildings & floors                |
                          |   - adminusers, issuestore, alerts    |
                          +-------------------+-------------------+
                                              |
                                              v
                          +---------------------------------------+
                          |     Node.js / Express REST API        |
                          |     Port: 5000                        |
                          |     Native Crypto JWT Authentication  |
                          |     Dynamic Spatial Query Engine      |
                          +-------------------+-------------------+
                                              |
                      +-----------------------+-----------------------+
                      |                                               |
                      v                                               v
       +------------------------------+               +------------------------------+
       |   React 18 + Vite Web App    |               |    Flutter Cross-Platform    |
       |   Leaflet / React-Leaflet    |               |    Android & iOS App         |
       |   Dark Navy Design System    |               |    Shared API Service        |
       |   Main Gate Initial View     |               |    GPS Location Services     |
       |   Fit Campus & Turn-by-Turn  |               |    Offline Fallback Cache    |
       +------------------------------+               +------------------------------+
```

---

## 2. Directory Structure

```
DishaSetu/
├── web/                           # React + Vite Web Application
│   ├── src/
│   │   ├── components/            # Header, Sidebar, Navigation, Modals
│   │   ├── maps/                  # Interactive Leaflet Campus Map
│   │   ├── services/              # API Client & Embedded Fallback
│   │   └── styles/                # Dark Navy Design System & Leaflet CSS
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                        # Node.js + Express REST API Backend
│   ├── config/                    # MongoDB Atlas Connection
│   ├── controllers/               # Campus, Location, Route, Building, Admin
│   ├── data/                      # Verified Geographic Coordinates & Catalog
│   ├── models/                    # Mongoose Models with GeoJSON Indexes
│   ├── routes/                    # API Route Definitions
│   ├── scripts/                   # Database Seeder (seedDatabase.js)
│   ├── services/                  # Campus Data & Spatial Business Logic
│   ├── utils/                     # Cryptographic Auth Utilities
│   ├── .env.example
│   └── server.js
├── mobile/                        # Flutter Android & iOS Application
│   ├── lib/
│   │   ├── models/                # CampusLocation, CampusFeature
│   │   ├── screens/               # Map, Search, Navigation screens
│   │   ├── services/              # API Client (shared backend)
│   │   └── main.dart
│   └── pubspec.yaml
├── docs/                          # Project Architecture & Documentation
├── README.md                      # Master Readme & Quickstart Guide
└── .gitignore                     # Git ignore rules
```

---

## 3. Verified Geographic Coordinates

| Feature | Type | Latitude | Longitude | Description |
|---|---|---|---|---|
| **Main Gate (Center)** | Point | `13.1717995` | `77.5361915` | Default opening map focus |
| **Main Gate West Span** | Point | `13.1717330` | `77.5359710` | West entrance pillar |
| **Main Gate East Span** | Point | `13.1718660` | `77.5364120` | East entrance pillar |
| **Walking Avenue Start (West)** | Point | `13.1716783` | `77.5360379` | Paved road origin 1 |
| **Walking Avenue Start (Center)** | Point | `13.1716861` | `77.5361922` | Paved road origin 2 |
| **Walking Avenue Start (East)** | Point | `13.1717070` | `77.5363464` | Paved road origin 3 |
| **Central Tree Divider (Start)** | Point | `13.1712020` | `77.5360316` | North median tip |
| **Central Tree Divider (End)** | Point | `13.1697607` | `77.5352339` | South median tip |
| **Campus Central Garden** | Polygon | 19 ordered points | 19 ordered points | Preserved uneven geometry |
| **Two-Wheeler Parking Area** | Polygon | 4 validated points | 4 validated points | Validated NW->NE->SE->SW perimeter |
| **Two-Wheeler Parking Entry** | Span | `13.1717858` / `13.1717063` | `77.5355609` / `77.5355183` | Vehicular access span |
| **Campus Central Fountain** | Landmark | `13.1692772` | `77.5349633` | South termination landmark |

---

## 4. Hardware & University Data Dependencies

1. **Outdoor Navigation**:
   - Uses standard GPS on mobile / browser geolocation API.
   - Bounded by verified ground paths.
2. **Indoor Positioning**:
   - Requires Bluetooth Low Energy (BLE) beacons or WiFi RTT infrastructure for sub-meter room accuracy.
   - Initial phase provides manual building, floor, and room selection with floor-plan navigation.
3. **Pending University Data**:
   - Complete outer campus perimeter boundary polygon (marked as "Pending complete perimeter verification by project owner").
   - Entrance door GPS coordinates for Academic Blocks (D, E, F, H, J, K, L, N Blocks, Library, Cafeteria) to transition from catalog status to active navigation endpoints.
