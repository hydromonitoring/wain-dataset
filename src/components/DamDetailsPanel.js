import React, { useState } from "react";

const CATEGORIES = [
  { label: "Overview", keys: [
    "Station id","Station name","River basin name","latitude","longitude","area (in km2)","perimeter (in km)","circularity ratio"
  ]},
  { label: "Topographical", keys: [
    "Minimum elevation (m)","Maximum elevation (m)","Mean elevation(m)","Mean slope (m/km)"
  ]},
  { label: "Climatic", keys: [
    "Mean precipitation rate (mm/day)","Maximum Tempearture (0C)","Minimum Temperature ( 0C)","High precipitation frequency (days/year)","Low precipitation frequency (days/year)","High precipitation season","Low precipitation season","High precipitation spell (days)","Low precipitation spell (days)","Aridity Index","Seasonality"
  ]},
  { label: "Geological", keys: [
    "Dominant lithological class","Area covered by dominant lithological class","second dominant lithological class","area covered by second dominant lithological class","subsurface permeability (m2, logscale)","subsurface porosity","groundwater mean level (m)"
  ]},
  { label: "LULC", keys: [
    "LULC dominant class","fraction of builtup","fraction of agriculture","fraction of forest land","fraction of grassland","fraction of scrub","fraction of water","fraction of snow","fraction of bareland","fraction of wetland","fraction of tundra","NDVI DJF","NDVI MAM","NDVI JJA","NDVI SON"
  ]},
  { label: "Soil", keys: [
    "coarse content","sand content","silt content","clay content","organic content","AWC (mm)","Conductivity(mm/day)","porosity","maximum water content (m)","bulk density (kg m-3 )"
  ]},
  { label: "Human Activity", keys: [
    "road density (m/km2)","population","human_footprint","stable light"
  ]}
];

// Export the current tab/category as JSON, Overview includes GeoJSON
function exportCategoryAsJSON(dam, geoJsonData, tab) {
  const damName = (dam["Station name"] || "dam").replace(/[^a-z0-9]/gi, "_");
  const category = CATEGORIES[tab];
  const json = {};
  category.keys.forEach(k => { json[k] = dam[k]; });

  // If Overview, include GeoJSON if available
  if (tab === 0 && geoJsonData) {
    json.GeoJSON = geoJsonData;
  }

  const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${damName}-${category.label.replace(/ /g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function DamDetailsPanel({ dam, geoJsonData, open, onClose }) {
  const [tab, setTab] = useState(0);

  return (
    <div className={`sidebar-details${open ? " open" : ""}`}>
      <button className="sidebar-close-btn" onClick={onClose}>×</button>
      {dam ? (
        <>
          <h2 className="sidebar-title">{dam["Station name"]}</h2>
          <div className="sidebar-tabs">
            {CATEGORIES.map((cat, idx) => (
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
                onClick={() => exportCategoryAsJSON(dam, geoJsonData, tab)}
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  padding: "7px 18px",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
                }}>
                Export {CATEGORIES[tab].label} {tab === 0 ? "(+Shapefile)" : ""}
              </button>
            </div>
            <table>
              <tbody>
                {CATEGORIES[tab].keys.map((k) =>
                  dam[k] !== undefined ? (
                    <tr key={k}>
                      <td style={{fontWeight:"bold"}}>{k}</td>
                      <td>{dam[k]}</td>
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