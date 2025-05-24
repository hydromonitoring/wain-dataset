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
  const [basinGeoJson, setBasinGeoJson] = useState(null);

  const mapRef = useRef();

  const basins = React.useMemo(
    () => ["All", ...Array.from(new Set(dams.map((d) => d["River Basin Name"])).values())],
    [dams]
  );

  // Filtered dams
  const filteredDams = React.useMemo(() => 
    dams.filter((dam) => {
      const matchesName = dam["Station Name"]
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesBasin =
        selectedBasin === "All" || dam["River Basin Name"] === selectedBasin;
      const matchesHydro = !showOnlyHydro || hasHydrologyData(dam);
      return matchesName && matchesBasin && matchesHydro;
    }),
    [dams, searchTerm, selectedBasin, showOnlyHydro]
  );

  // Fetch India boundary GeoJSON on mount
  useEffect(() => {
    fetch("https://hydromonitoring-lab-datasets.s3.ap-south-1.amazonaws.com/india_boundary_line.geojson")
      .then((response) => response.ok ? response.json() : null)
      .then((boundaryData) => boundaryData && setIndiaBoundary(boundaryData))
      .catch(() => {});
  }, []);

  // Update zoom state on map zoom
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handleZoom = () => setZoom(map.getZoom());
    map.on("zoomend", handleZoom);
    return () => map.off("zoomend", handleZoom);
  }, []);

  // Fit map to basin when basinGeoJson changes
  useEffect(() => {
    if (
      basinGeoJson &&
      mapRef.current &&
      selectedBasin &&
      selectedBasin !== "All"
    ) {
      // Use requestAnimationFrame for more reliable timing
      requestAnimationFrame(() => {
        const geoJsonLayer = L.geoJSON(basinGeoJson);
        const bounds = geoJsonLayer.getBounds();
        const sidebar = document.querySelector('.sidebar-details.open');
        const sidebarWidth = sidebar ? sidebar.offsetWidth : 350;
        mapRef.current.fitBounds(bounds, {
          paddingTopLeft: [0, 0],
          paddingBottomRight: [sidebarWidth + 40, 0],
          maxZoom: 8,
        });
      });
    }
  }, [basinGeoJson, selectedBasin]);

  // Fetch basin GeoJSON
  async function fetchBasinGeoJson(basinName) {
    setBasinGeoJson(null);
    if (!basinName || basinName === "All") return;
    try {
      const url = `https://hydromonitoring-lab-datasets.s3.ap-south-1.amazonaws.com/river_basin_geojson/${encodeURIComponent(
        basinName
      )}.geojson`;
      const resp = await fetch(url);
      if (resp.ok) {
        const geo = await resp.json();
        setBasinGeoJson(geo);
      }
    } catch {
      // Already cleared
    }
  }

  // Fetch dam shapefile & select dam
  const handleDamSelect = async (dam) => {
    setSelectedDam(dam);
    setGeoJsonData(null);
    if (dam["Station ID"]) {
      try {
        const resp = await fetch(
          `https://hydromonitoring-lab-datasets.s3.ap-south-1.amazonaws.com/shapefiles/${dam["Station ID"]}.geojson`
        );
        if (resp.ok) {
          const json = await resp.json();
          const geoData = json.geojson ? json.geojson : json;
          setGeoJsonData(geoData);
        } else {
          setGeoJsonData(null);
        }
      } catch {
        setGeoJsonData(null);
      }
    }
    // Do NOT fetch basin shapefile here
  };

  const handleClosePanel = () => {
    setSelectedDam(null);
    setGeoJsonData(null);
    setBasinGeoJson(null);
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
          onChange={(e) => {
            setSelectedBasin(e.target.value);
            fetchBasinGeoJson(e.target.value);
          }}
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
            {indiaBoundary && (
              <GeoJSON data={indiaBoundary} style={{ color: "black", weight: 0.6, fill: false }} />
            )}
            {basinGeoJson && (
              <GeoJSON
                data={basinGeoJson}
                style={{ color: "#ff9800", weight: 2, fillOpacity: 0.1 }}
              />
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
