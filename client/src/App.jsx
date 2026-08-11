import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import metrolinkLines from './data/Metrolink_Lines_Functional.json';
import metrolinkStops from './data/Metrolink_Stops_Functional.json';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-2.2426, 53.4808],
      zoom: 11
    });

    map.current.on('load', () => {
      // Lines Source and Layer
      map.current.addSource('metrolink-lines-source', {
        type: 'geojson',
        data: metrolinkLines
      });

      map.current.addLayer({
        id: 'metrolink-lines-layer',
        type: 'line',
        source: 'metrolink-lines-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FFC72C',
          'line-width': 3
        }
      });

      // Stops Source and Layer
      map.current.addSource('metrolink-stops-source', {
        type: 'geojson',
        data: metrolinkStops
      });

      map.current.addLayer({
        id: 'metrolink-stops-layer',
        type: 'circle',
        source: 'metrolink-stops-source',
        paint: {
          'circle-radius': 4,
          'circle-color': '#FFFFFF',
          'circle-stroke-color': '#111111',
          'circle-stroke-width': 2
        }
      });

      // Interactivity: Cursor style on hover
      map.current.on('mouseenter', 'metrolink-stops-layer', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'metrolink-stops-layer', () => {
        map.current.getCanvas().style.cursor = '';
      });

      // Interactivity: Popup on click
      map.current.on('click', 'metrolink-stops-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { StationLocation, name } = e.features[0].properties;
        const stationName = StationLocation || name || 'Unknown Station';

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<strong style="color: black;">${stationName}</strong>`)
          .addTo(map.current);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-screen" />
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded shadow-md pointer-events-auto">
        <h1 className="text-xl font-bold text-gray-800">Metrolink Live Map</h1>
      </div>
    </div>
  );
}

export default App;
