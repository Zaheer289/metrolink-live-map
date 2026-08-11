# System Requirements and Architecture: Real-Time Metrolink Map
**Author:** Zaheer Ahmed
**Document Purpose:** Define the architectural requirements, design patterns, and execution steps for the Manchester Metrolink real-time tracking application.

## 1. Project Overview
This application visualizes the Manchester Metrolink network by displaying live tram movements on an interactive map. Since the Transport for Greater Manchester (TfGM) API provides estimated arrival times at stops rather than live GPS coordinates, the system will interpolate tram positions along predefined track polylines.

## 2. Technology Stack
*   **Frontend:** React, Mapbox GL JS
*   **Backend:** Node.js (Express)
*   **Data Transport:** Server-Sent Events (SSE) for unidirectional real-time data broadcasting.
*   **External API:** TfGM Open Data API

## 3. System Architecture
The architecture is designed to decouple the data fetching process from the client broadcasting process. This ensures the system remains highly responsive and strictly adheres to TfGM API rate limits, regardless of the number of concurrent users.

*   **TfGM Polling Engine (Backend):** A background worker process on the Node.js server continuously polls the TfGM API at a safe frequency.
*   **Interpolation Service (Backend):** This module processes the arrival times, maps them against static track polyline data, and calculates the current estimated geographical coordinates of each active tram.
*   **SSE Broadcaster (Backend):** Maintains an open, one-way HTTP connection with all connected web clients. It pushes the calculated global tram state object to clients at a set tick rate (e.g., every 3 seconds).
*   **Interactive Client (Frontend):** The React application listens to the SSE stream. Upon receiving a new state object, it updates the Mapbox GL JS markers, applying smooth transitions between the old and new coordinates to create the illusion of continuous movement.

## 4. Design Patterns
*   **Singleton Pattern:** Used for the TfGM API client and the internal state manager. Only one instance must handle the API polling to prevent rate limiting, and only one source of truth should hold the current calculated tram positions.
*   **Observer / Pub-Sub Pattern:** The SSE Broadcaster acts as a publisher. The internal polling engine publishes new coordinates to an event emitter, and the SSE connections subscribe to these events to push updates to the client browsers.
*   **Adapter Pattern:** Transforms the raw, stop-centric JSON data provided by the TfGM API into a standardized, coordinate-centric format optimized for Mapbox GL JS markers.