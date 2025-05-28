import React, { useState } from "react";

const CATEGORIES = [
  {
    label: "Overview",
    keys: [
      "Station ID",
      "Station Name",
      "River Basin Name",
      "Latitude (°)",
      "Longitude (°)",
      "Area (km²)",
      "Perimeter (km)",
      "Circularity Ratio",
    ],
  },
  {
    label: "Topographical",
    keys: [
      "Minimum Elevation (m)",
      "Maximum Elevation (m)",
      "Mean Elevation (m)",
      "Mean Slope (m/km)",
    ],
  },
  {
    label: "Climatic",
    keys: [
      "Mean Precipitation Rate (mm/day)",
      "Maximum Temperature (°C)",
      "Minimum Temperature (°C)",
      "High Precipitation Frequency (days/year)",
      "Maximum Wind Speed (m/s)",
      "Mean Wind Speed (m/s)",
      "Evaporation (mm)",
      "PET (mm)",
      "Maximum Precipitation (mm)",
      "Low Precipitation Frequency (days/year)",
      "High Precipitation Season",
      "Low Precipitation Season",
      "High Precipitation Spell (days)",
      "Low Precipitation Spell (days)",
      "Aridity Index",
      "Seasonality",
    ],
  },
  {
    label: "Geological",
    keys: [
      "Dominant Lithological Class",
      "Area Covered by Dominant Lithological Class",
      "Second Dominant Lithological Class",
      "Area Covered by Second Dominant Lithological Class",
      "Subsurface Permeability (m², log scale)",
      "Subsurface Porosity",
      "Groundwater Mean Level (m)",
    ],
  },
  {
    label: "LULC",
    keys: [
      "Dominant LULC Class",
      "Fraction of Builtup",
      "Fraction of Agriculture",
      "Fraction of Forest Land",
      "Fraction of Grassland",
      "Fraction of Scrub",
      "Fraction of Water",
      "Fraction of Snow",
      "Fraction of Bareland",
      "Fraction of Wetland",
      "Fraction of Tundra",
      "NDVI (DJF)",
      "NDVI (MAM)",
      "NDVI (JJA)",
      "NDVI (SON)",
    ],
  },
  {
    label: "Soil",
    keys: [
      "Coarse Content (vol. %)",
      "Sand Content (%)",
      "Silt Content (%)",
      "Clay Content (%)",
      "Organic Carbon Content (g/kg)",
      "AWC (mm/m)",
      "Conductivity (mm/day)",
      "Porosity",
      "Maximum Water Content (m)",
      "Bulk Density (kg/m³)",
    ],
  },
  {
    label: "Human Activity",
    keys: [
      "Road Density (m/km²)",
      "Population",
      "Human Footprint",
      "Stable Light",
    ],
  },
  {
    label: "Hydrological Signature",
    keys: [
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
    ],
  },
];

// Export the current tab/category as JSON, Overview includes GeoJSON
function exportCategoryAsJSON(dam, geoJsonData, tab) {
  const damName = (dam["Station Name"] || "dam").replace(/[^a-z0-9]/gi, "_");
  const category = CATEGORIES[tab];
  const json = {};
  category.keys.forEach((k) => {
    json[k] = dam[k];
  });

  // If Overview, include GeoJSON if available
  if (tab === 0 && geoJsonData) {
    json.GeoJSON = geoJsonData;
  }

  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${damName}-${category.label.replace(/ /g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function DamDetailsPanel({ dam, geoJsonData, open, onClose }) {
  // Filter categories: only show Hydrology if at least one value is not NaN
  const filteredCategories = React.useMemo(() => {
    return CATEGORIES.filter((cat) => {
      if (cat.label !== "Hydrological Signature") return true;
      // Only show Hydrology if at least one value is a valid number
      return cat.keys.some(
        (k) =>
          dam &&
          dam[k] !== undefined &&
          dam[k] !== null &&
          dam[k] !== ""
      );
    });
  }, [dam]);

  // Adjust tab index if needed
  const [tab, setTab] = useState(0);
  React.useEffect(() => {
    if (tab >= filteredCategories.length) setTab(0);
  }, [filteredCategories, tab]);

  return (
    <div className={`sidebar-details${open ? " open" : ""}`}>
      <button className="sidebar-close-btn" onClick={onClose}>
        ×
      </button>
      {dam ? (
        <>
          <h2 className="sidebar-title">{dam["Station Name"]}</h2>
          <div className="sidebar-tabs">
            {filteredCategories.map((cat, idx) => (
              <button
                key={cat.label}
                className={tab === idx ? "sidebar-tab active" : "sidebar-tab"}
                onClick={() => setTab(idx)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="sidebar-tab-content">
            <div style={{ margin: "12px 0" }}>
              <button
                onClick={() =>
                  exportCategoryAsJSON(
                    dam,
                    geoJsonData,
                    CATEGORIES.findIndex(
                      (c) => c.label === filteredCategories[tab].label
                    )
                  )
                }
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  padding: "7px 18px",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Export {filteredCategories[tab].label}{" "}
                {filteredCategories[tab].label === "Overview"
                  ? "(+Shapefile)"
                  : ""}
              </button>
              {/* DAM Report Button */}
              <a
                href={`https://hydromonitoring.github.io/wain-reports/${encodeURIComponent(
                  (dam["River Basin Name"] || "").replace(/ /g, "_")
                )}/${encodeURIComponent(
                  (dam["Station Name"] || "").replace(/ /g, "_")
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginLeft: 10,
                  background: "#388e3c",
                  color: "#fff",
                  padding: "7px 18px",
                  border: "none",
                  borderRadius: 6,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Watershed Report
              </a>
            </div>
            <table>
              <tbody>
                {filteredCategories[tab].keys.map((k) =>
                  dam[k] !== undefined ? (
                    <tr key={k}>
                      <td style={{ fontWeight: "bold" }}>{k}</td>
                      <td>{typeof dam[k] === "number"
                        ? dam[k].toFixed(3) : dam[k]}</td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="sidebar-empty">
          <span>Select a dam marker to see details here.</span>
        </div>
      )}
    </div>
  );
}

export default DamDetailsPanel;
