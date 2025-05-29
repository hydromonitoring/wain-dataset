import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import DamDetailsPanel from "./DamDetailsPanel";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";

// Default map center and zoom
const DEFAULT_CENTER = [22.5, 78.9];
const DEFAULT_ZOOM = 5;

// This component accesses the map instance directly
// It handles all map operations in a reliable way
function MapController({
  selectedDam,
  selectedBasin,
  basinGeoJson,
  geoJsonData,
  resetMapFlag,
  setResetMapFlag,
}) {
  const map = useMap();

  // Effect to handle dam selection zoom
  useEffect(() => {
    if (geoJsonData && selectedDam) {
      try {
        const geoJsonLayer = L.geoJSON(geoJsonData);
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          const sidebar = document.querySelector(".sidebar-details.open");
          const sidebarWidth = sidebar ? sidebar.offsetWidth : 350;
          map.fitBounds(bounds, {
            paddingTopLeft: [0, 0],
            paddingBottomRight: [sidebarWidth + 40, 0],
            maxZoom: 12,
            animate: true,
          });
        }
      } catch (error) {
        console.error("Error zooming to dam:", error);
      }
    }
  }, [map, geoJsonData, selectedDam]);

  // Effect to handle basin selection zoom
  useEffect(() => {
    if (basinGeoJson && selectedBasin !== "All" && !selectedDam) {
      try {
        const geoJsonLayer = L.geoJSON(basinGeoJson);
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          const sidebar = document.querySelector(".sidebar-details.open");
          const sidebarWidth = sidebar ? sidebar.offsetWidth : 350;
          map.fitBounds(bounds, {
            paddingTopLeft: [0, 0],
            paddingBottomRight: [sidebarWidth + 40, 0],
            maxZoom: 8,
            animate: true,
          });
        }
      } catch (error) {
        console.error("Error zooming to basin:", error);
      }
    }
  }, [map, basinGeoJson, selectedBasin, selectedDam]);

  // Effect to handle reset map view
  useEffect(() => {
    if (resetMapFlag) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      setResetMapFlag(false);
    }
  }, [map, resetMapFlag, setResetMapFlag]);

  return null;
}

function DamMap({ dams }) {
  const [selectedDam, setSelectedDam] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBasin, setSelectedBasin] = useState("All");
  const [indiaBoundary, setIndiaBoundary] = useState(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [showOnlyHydro, setShowOnlyHydro] = useState(false);
  const [basinGeoJson, setBasinGeoJson] = useState(null);
  const [resetMapFlag, setResetMapFlag] = useState(false);

  const mapRef = useRef();

  const basins = React.useMemo(
    () => [
      "All",
      ...Array.from(new Set(dams.map((d) => d["River Basin Name"] || "")))
        .filter(Boolean)
        .sort(),
    ],
    [dams]
  );

  // Filtered dams
  const filteredDams = React.useMemo(
    () =>
      dams.filter((dam) => {
        const matchesName =
          dam["Station Name"]
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) || false;
        const matchesBasin =
          selectedBasin === "All" || dam["River Basin Name"] === selectedBasin;
        const matchesHydro = !showOnlyHydro || hasHydrologyData(dam);
        return matchesName && matchesBasin && matchesHydro;
      }),
    [dams, searchTerm, selectedBasin, showOnlyHydro]
  );

  // Fetch India boundary GeoJSON on mount
  useEffect(() => {
    fetch(
      "https://hydromonitoring-lab-datasets.s3.ap-south-1.amazonaws.com/india_boundary_line.geojson"
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((boundaryData) => boundaryData && setIndiaBoundary(boundaryData))
      .catch((error) => console.error("Error fetching India boundary:", error));
  }, []);

  // Handle basin selection
  const handleBasinChange = useCallback(async (basinName) => {
    // Clear the current basin GeoJSON data immediately
    setBasinGeoJson(null);
    setSelectedBasin(basinName);

    if (!basinName || basinName === "All") {
      setResetMapFlag(true);
      return;
    }

    try {
      const url = `https://hydromonitoring-lab-datasets.s3.ap-south-1.amazonaws.com/river_basin_geojson/${encodeURIComponent(
        basinName
      )}.geojson`;

      console.log(`Fetching basin data for: ${basinName}`);
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log("Basin data received successfully");
        setBasinGeoJson(data);
      } else {
        console.error(`Failed to fetch basin GeoJSON for ${basinName}`);
        setResetMapFlag(true);
      }
    } catch (error) {
      console.error("Error fetching basin GeoJSON:", error);
      setResetMapFlag(true);
    }
  }, []);

  // Fetch dam shapefile & select dam
  const handleDamSelect = useCallback(async (dam) => {
    setSelectedDam(dam);
    setGeoJsonData(null);

    if (!dam || !dam["Station ID"]) return;

    try {
      const url = `https://hydromonitoring-lab-datasets.s3.ap-south-1.amazonaws.com/shapefiles/${dam["Station ID"]}.geojson`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const geoData = data.geojson ? data.geojson : data;
        setGeoJsonData(geoData);
      } else {
        console.error(`Failed to fetch GeoJSON for dam ${dam["Station ID"]}`);
      }
    } catch (error) {
      console.error("Error fetching dam GeoJSON:", error);
    }
  }, []);

  // Handle close panel
  const handleClosePanel = useCallback(() => {
    setSelectedDam(null);
    setGeoJsonData(null);
    setResetMapFlag(true);
  }, []);

  function hasHydrologyData(dam) {
    const hydroKeys = [
      "Q5 (m³/sec)",
      "Q95 (m³/sec)",
      "High Discharge Frequency (days/year)",
      "Low Discharge Frequency (days/year)",
      "Zero Discharge Frequency (days/year)",
      "Slope of Flow Duration Curve",
      "High Spell Days",
      "Low Spell Days",
      "Baseflow Index",
      "Mean Half-Flow Days",
      "Mean Discharge (mm/day)",
      "Runoff Coefficient",
      "Elasticity",
    ];

    return hydroKeys.some(
      (k) =>
        dam[k] !== undefined &&
        dam[k] !== null &&
        dam[k] !== "" &&
        typeof dam[k] === "number" &&
        !Number.isNaN(dam[k])
    );
  }

  function getMarkerIcon(zoom) {
    const size = Math.max(6, Math.min(18, (zoom - 2) * 2));
    return L.divIcon({
      className: "custom-circle-marker",
      iconSize: [size, size],
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#1976d2;border:2px solid white;"></div>`,
    });
  }

  return (
    <div className="app-layout">
      <header className="header">
        <span className="header-title">WAIN Data Set</span>
        <button 
          className="back-button"
          onClick={() => window.location.href = "https://hydromonitoring.github.io/lab-datasets/"}
          aria-label="Go back to datasets page"
        >
          Back to Datasets
        </button>
      </header>
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search Watershed name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="toolbar-input"
        />
        <select
          value={selectedBasin}
          onChange={(e) => handleBasinChange(e.target.value)}
          className="toolbar-select"
        >
          {basins.map((basin) => (
            <option key={basin} value={basin}>
              {basin}
            </option>
          ))}
        </select>
        <button
          style={{
            marginLeft: 10,
            padding: "7px 18px",
            border: "none",
            borderRadius: 6,
            background: showOnlyHydro ? "#1976d2" : "#888",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={() => setShowOnlyHydro((v) => !v)}
        >
          {showOnlyHydro ? "Reset" : "Show Only Hydrological Signature Watersheds"}
        </button>
      </div>
      <div className="main-content">
        <div className="map-container">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
            whenReady={(map) => {
              setZoom(map.target.getZoom());
              map.target.on("zoomend", () => {
                setZoom(map.target.getZoom());
              });
            }}
          >
            <MapController
              selectedDam={selectedDam}
              selectedBasin={selectedBasin}
              basinGeoJson={basinGeoJson}
              geoJsonData={geoJsonData}
              resetMapFlag={resetMapFlag}
              setResetMapFlag={setResetMapFlag}
            />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {indiaBoundary && (
              <GeoJSON
                data={indiaBoundary}
                style={{ color: "black", weight: 0.6, fill: false }}
              />
            )}
            {basinGeoJson && (
              <GeoJSON
                data={basinGeoJson}
                style={{ color: "#ff9800", weight: 2, fillOpacity: 0.1 }}
              />
            )}
            {geoJsonData && (
              <GeoJSON
                data={geoJsonData}
                style={{ color: "#e91e63", weight: 3, fillOpacity: 0.2 }}
              />
            )}
            <MarkerClusterGroup chunkedLoading>
              {filteredDams.map((dam) => {
                const lat = parseFloat(dam["Latitude (°)"]);
                const lng = parseFloat(dam["Longitude (°)"]);
                if (!lat || !lng) return null;
                return (
                  <Marker
                    key={dam["Station ID"] || `${lat}-${lng}`}
                    position={[lat, lng]}
                    icon={getMarkerIcon(zoom)}
                    eventHandlers={{
                      click: () => handleDamSelect(dam),
                    }}
                  />
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
        <DamDetailsPanel
          dam={selectedDam}
          geoJsonData={geoJsonData}
          open={!!selectedDam}
          onClose={handleClosePanel}
        />
      </div>
    </div>
  );
}

export default DamMap;
