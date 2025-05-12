import React, { useEffect } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";

function ZoomToGeoJson({ geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    if (!geoJsonData || !map) return;

    try {
      const layer = L.geoJSON(geoJsonData);
      const bounds = layer.getBounds();
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          maxZoom: 16,
          padding: [50, 50],
          animate: true,
          duration: 1
        });
      }
    } catch (error) {
      console.error("Error zooming to GeoJSON:", error);
    }
  }, [geoJsonData, map]);

  return geoJsonData ? (
    <GeoJSON
      data={geoJsonData}
      style={{ color: "#2196f3", weight: 3, fillOpacity: 0.2 }}
    />
  ) : null;
}

export default ZoomToGeoJson;