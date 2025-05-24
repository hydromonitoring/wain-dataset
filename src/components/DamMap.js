import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, GeoJSON } from "react-leaflet";
import L from "leaflet";
import DamDetailsPanel from "./DamDetailsPanel";
import ZoomToGeoJson from "./ZoomToGeoJson";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";

function DamMap({ dams }) {
  const [selectedDam, setSelectedDam] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBasin, setSelectedBasin] = useState("All");
  const [indiaBoundary, setIndiaBoundary] = useState(null);
  const [zoom, setZoom] = useState(5);
  const [showOnlyHydro, setShowOnlyHydro] = useState(false);

  const mapRef = useRef();

  const basins = [
    "All",
    ...Array.from(new Set(dams.map((d) => d["River Basin Name"])).values()),
  ];

  // Filtered dams
  const filteredDams = dams.filter((dam) => {
    const matchesName = dam["Station Name"]
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBasin =
      selectedBasin === "All" || dam["River Basin Name"] === selectedBasin;
    const matchesHydro = !showOnlyHydro || hasHydrologyData(dam);
    return matchesName && matchesBasin && matchesHydro;
  });

  // Fetch India boundary GeoJSON on mount and set up zoom listener
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleZoom = () => setZoom(map.getZoom());
    map.on("zoomend", handleZoom);

    return () => {
      map.off("zoomend", handleZoom);
    };
  }, []);
  useEffect(() => {
    const fetchIndiaBoundary = async () => {
      try {
        const response = await fetch(
          "https://hydromonitoring-lab-datasets.s3.ap-south-1.amazonaws.com/india_boundary_line.geojson"
        );
        if (response.ok) {
          const boundaryData = await response.json();
          setIndiaBoundary(boundaryData);
        } else {
          console.error("Failed to fetch India boundary GeoJSON");
        }
      } catch (error) {
        console.error("Error fetching India boundary GeoJSON:", error);
      }
    };
    fetchIndiaBoundary();
  }, []);

  // Dynamically size marker based on zoom (smaller when zoomed out)
  function getMarkerIcon(zoom) {
    // At zoom 5: size = 6, at zoom 10: size = 16, at zoom 15: size = 18 (max)
    const size = Math.max(6, Math.min(18, (zoom - 2) * 2));
    return L.divIcon({
      className: "custom-circle-marker",
      iconSize: [size, size],
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#1976d2;border:2px solid white;"></div>`,
    });
  }

  // Fetch GeoJSON & select dam
  const handleDamSelect = async (dam) => {
    setSelectedDam(dam);
    setGeoJsonData(null);

    if (!dam["Station ID"]) return;

    try {
      const resp = await fetch(
        `https://hydromonitoring-lab-datasets.s3.ap-south-1.amazonaws.com/shapefiles/${dam["Station ID"]}.geojson`
      );
      if (resp.ok) {
        const json = await resp.json();
        const geoData = json.geojson ? json.geojson : json;
        setGeoJsonData(geoData);
      } else {
        console.error("Failed to fetch GeoJSON data");
        setGeoJsonData(null);
      }
    } catch (error) {
      console.error("Error fetching GeoJSON:", error);
      setGeoJsonData(null);
    }
  };

  // Style for India boundary
  const indiaBoundaryStyle = {
    color: "black",
    weight: 0.6,
    fill: false,
  };

  const handleClosePanel = () => {
    setSelectedDam(null);
    setGeoJsonData(null);
    setSearchTerm("");
  };

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

  return (
    <div className="app-layout">
      <header className="header">
        <span className="header-title">WAIN Data Set</span>
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
          onChange={(e) => setSelectedBasin(e.target.value)}
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
          {showOnlyHydro ? "Reset" : "Show Only Hydrological Signature Dams"}
        </button>
      </div>
      <div className="main-content">
        <div className="map-container">
          <MapContainer
            center={[22.5, 78.9]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
              setZoom(mapInstance.getZoom());
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {/* Render India Boundary GeoJSON */}
            {indiaBoundary && (
              <GeoJSON data={indiaBoundary} style={indiaBoundaryStyle} />
            )}

            <MarkerClusterGroup chunkedLoading>
              {filteredDams.map((dam) => {
                const lat = parseFloat(dam["Latitude (°)"]);
                const lng = parseFloat(dam["Longitude (°)"]);
                if (!lat || !lng) return null;
                return (
                  <Marker
                    key={dam["Station ID"]}
                    position={[lat, lng]}
                    icon={getMarkerIcon(zoom)}
                    eventHandlers={{
                      click: () => handleDamSelect(dam),
                    }}
                  />
                );
              })}
            </MarkerClusterGroup>
            {geoJsonData && <ZoomToGeoJson geoJsonData={geoJsonData} />}
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
