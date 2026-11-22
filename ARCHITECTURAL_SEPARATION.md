# DishaSetu — System Architecture & Web/Mobile Separation Report

> **Prepared for**: Academic Review & Faculty Assessment  
> **Institution**: Presidency University, Bengaluru  
> **Project**: DishaSetu — AI-Powered Smart Campus Navigation & Geospatial Hierarchy System  

---

## 1. Executive Summary & Objective

In compliance with faculty instructions, the **DishaSetu** platform is architecturally structured into two independent client applications backed by a single unified backend engine:

1. **Web Application (`web/`)**: React.js client optimized for desktop displays, administrative oversight, and broad browser accessibility.
2. **Mobile Application (`mobile/`)**: Native Flutter (Dart) client optimized for smartphones with touch-first interactions, bottom sheets, real-time compass gestures, and offline fallback resiliency.
3. **Shared Backend (`server/`)**: Centralized Node.js + Express REST API backed by MongoDB Atlas as the single source of truth for both Web and Mobile clients.

```
                    ┌─────────────────────────────────────────┐
                    │          MongoDB Atlas Cluster          │
                    │   (Buildings, Floors, Rooms, GeoJSON)   │
                    └────────────────────▲────────────────────┘
                                         │
                                         │ Mongoose ODM
                                         │
                    ┌────────────────────┴────────────────────┐
                    │    Node.js + Express REST API Engine    │
                    │         Port: 5000  (server/)           │
                    └───────────▲─────────────────▲───────────┘
                                │                 │
               HTTP / REST API  │                 │ HTTP / REST API
          (http://localhost:5000)                 │ (http://10.0.2.2:5000/api or LAN IP)
                                │                 │
       ┌────────────────────────┴──────┐   ┌──────┴─────────────────────────┐
       │   Web Client Application      │   │   Mobile Client Application    │
       │   React 18 + Vite             │   │   Native Flutter + Dart        │
       │   Directory: web/             │   │   Directory: mobile/           │
       │   • Desktop GIS Interface     │   │   • Material 3 Mobile UX       │
       │   • Admin Management Panel    │   │   • Interactive Gesture Map    │
       │   • Full Campus Master Map    │   │   • Building Bottom Sheets     │
       │   • Floor/Room Navigator      │   │   • Offline AI Assistant       │
       │   • Walking Route Engine      │   │   • Rapid SOS Alert Dispatch   │
       └───────────────────────────────┘   └────────────────────────────────┘
```

---

## 2. Directory Structure & Modular Separation

The codebase maintains strict boundary isolation:

```
DishaSetu/
├── web/                             # [WEB APPLICATION]
│   ├── src/
│   │   ├── components/
│   │   │   ├── indoor/              # Indoor Floor Plan & Room Grid
│   │   │   │   └── IndoorNavigationModal.jsx
│   │   │   ├── building/            # Building Detail Modal & Hierarchy
│   │   │   │   └── BuildingPopupModal.jsx
│   │   │   ├── map/                 # Campus Master Map Viewport
│   │   │   └── navigation/          # Pedestrian Route Pathfinding
│   │   ├── services/api.js          # Web API Service Layer
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── mobile/                          # [MOBILE APPLICATION - NATIVE FLUTTER]
│   ├── lib/
│   │   ├── config/
│   │   │   └── app_config.dart      # Runtime Configurable API Endpoint (10.0.2.2 / Localhost / LAN)
│   │   ├── models/
│   │   │   ├── building.dart        # Building Schema with D-Block/Classroom classification
│   │   │   ├── floor.dart           # Multi-Floor & Room Data Hierarchy
│   │   │   ├── cafe.dart            # Dining Facilities & Menus
│   │   │   ├── campus_event.dart    # University Events
│   │   │   └── ai_message.dart      # Intelligent Guide Chat Schema
│   │   ├── screens/
│   │   │   ├── main_navigation_shell.dart  # Material 3 Bottom Navigation Shell
│   │   │   ├── map_screen.dart             # Gesture-driven Campus Master Map with Pins
│   │   │   ├── directory_screen.dart       # Search & Filterable Directory
│   │   │   ├── cafes_screen.dart           # Food Courts & Hatti Kaapi
│   │   │   ├── events_screen.dart          # Campus Academic & Cultural Events
│   │   │   ├── ai_guide_screen.dart        # Conversational Campus AI Guide
│   │   │   └── splash_screen.dart          # Animated Calibration Splash
│   │   ├── services/
│   │   │   ├── api_service.dart            # HTTP Client consuming Shared Node.js Backend
│   │   │   ├── indoor_service.dart         # Verified Block Hierarchy Generator
│   │   │   ├── ai_assistant_service.dart   # Offline Presidency Knowledge Base Engine
│   │   │   └── emergency_service.dart      # University SOS Directory
│   │   ├── widgets/
│   │   │   ├── building_bottom_sheet.dart  # Multi-Floor Room Selector & Bay View
│   │   │   ├── emergency_sos_sheet.dart    # Rapid Dispatch Security Modal
│   │   │   └── server_config_dialog.dart   # In-App Backend IP Switcher
│   │   └── main.dart                       # Mobile Entrypoint
│   └── pubspec.yaml
│
├── server/                          # [SHARED BACKEND REST API]
│   ├── routes/                      # Shared Endpoints
│   │   ├── locations.js
│   │   ├── indoor.js
│   │   ├── cafes.js
│   │   └── emergency.js
│   ├── models/                      # MongoDB Schemas
│   └── server.js                    # Port 5000 HTTP Server
│
└── ARCHITECTURAL_SEPARATION.md      # This Specification Document
```

---

## 3. Standardized Building & Room Taxonomy

Both applications strictly enforce identical room nomenclature, numbering rules, and room categorization:

| Block | Classification | Ground Floor | First Floor | Second Floor |
| :--- | :--- | :--- | :--- | :--- |
| **D Block** | **ALL LABORATORIES** | `DGL01`, `DGL02`, `DGL03`... | `DFL01`, `DFL02`, `DFL03`... | `DSL01`, `DSL02`, `DSL03`... |
| **E Block** | **ALL CLASSROOMS** | `EG01`, `EG02`, `EG03`... | `EF01`, `EF02`, `EF03`... | `ES01`, `ES02`, `ES03`... |
| **F Block** | **ALL CLASSROOMS** | `FG01`, `FG02`, `FG03`... | `FF01`, `FF02`, `FF03`... | `FS01`, `FS02`, `FS03`... |
| **L Block** | **ALL CLASSROOMS** | `LG01`, `LG02`, `LG03`... | `LF01`, `LF02`, `LF03`... | `LS01`, `LS02`, `LS03`... |
| **N Block** | **ALL CLASSROOMS** | `NG01`, `NG02`, `NG03`... | `NF01`, `NF02`, `NF03`... | `NS01`, `NS02`, `NS03`... |
| **M Block** | **ALL CLASSROOMS** | `MG01`, `MG02`, `MG03`... | `MF01`, `MF02`, `MF03`... | `MS01`, `MS02`, `MS03`... |

### Floor Selection Flow in Both Apps
1. User clicks or selects an Academic Block on the interactive Campus Master Map.
2. The system opens the Building Information Interface.
3. User selects the desired floor (Ground Level 0, First Level 1, Second Level 2).
4. Floor-specific rooms are dynamically rendered in standardized corridor bay layouts.
5. User clicks any room to inspect details (Room Code, Lab/Classroom type badge, department, capacity).
6. Tapping **"Navigate to Room"** triggers pedestrian routing from campus entrance/current location to that block.

---

## 4. How to Run Each Application

### 1. Launching the Shared Backend
```bash
# From workspace root
node server/server.js
# Backend runs on http://localhost:5000 and is connected to MongoDB Atlas
```

### 2. Launching the Web Application
```bash
# In another terminal
cd web
npm run dev
# Accessible in your browser at http://localhost:5173 (or http://localhost:5000 via production build)
```

### 3. Launching the Flutter Mobile Application
```bash
# In another terminal
cd mobile

# Run on Android Emulator, Physical Phone, or Windows Desktop
flutter run
```

> **Network Configuration for Mobile**:
> - **Android Emulator**: Uses `http://10.0.2.2:5000/api` automatically to route to the host machine.
> - **Physical Android / iOS Device**: Connect phone to the same Wi-Fi as your development computer, tap the **Settings icon** in the mobile app header, and enter your computer's local IP (e.g. `http://192.168.1.5:5000/api`).
> - No hardcoded URLs: Persistent storage via `SharedPreferences` saves the selected IP.

---

## 5. Verification & Quality Assurance

- **Dart Code Quality**: Analyzed via Flutter/Dart analyzer with **0 errors**.
- **Web App Parity**: Indoor floor modal only opens upon explicit building click; room letter codes match block names (`DGL`, `EG`, `FG`, `LG`, `NG`, `MG`).
- **Data Synchronization**: Any location, floor, or cafe added to the MongoDB database automatically reflects on both Web and Mobile simultaneously.
