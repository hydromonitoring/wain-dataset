import React, { useState, useMemo, useEffect } from "react";

// Helper function to create category keys
const createCategoryKeys = (keys) => keys.map(([name, source]) => ({ name, source }));

const CATEGORIES = [
  {
    label: "Overview",
    keys: createCategoryKeys([
      ["Station ID", ""],
      ["Station Name", ""],
      ["River Basin Name", ""],
      ["Latitude (°)", ""],
      ["Longitude (°)", ""],
    ]),
  },
  {
    label: "Topographical",
    keys: createCategoryKeys([
      ["Area (km²)", "SRTM"],
      ["Perimeter (km)", "SRTM"],
      ["Circularity Ratio", "SRTM"],
      ["Minimum Elevation (m)", "SRTM"],
      ["Maximum Elevation (m)", "SRTM"],
      ["Mean Elevation (m)", "SRTM"],
      ["Mean Slope (m/km)", "SRTM"],
    ]),
  },
  {
    label: "Climatic",
    keys: [
      { name: "Mean Precipitation Rate (mm/day)", source: "IMD(ERA5)" },
      { name: "Maximum Temperature (°C)", source: "IMD(ERA5)" },
      { name: "Minimum Temperature (°C)", source: "IMD(ERA5)" },
      { name: "High Precipitation Frequency (days/year)", source: "IMD(ERA5)" },
      { name: "Low Precipitation Frequency (days/year)", source: "IMD(ERA5)" },
      { name: "High Precipitation Season", source: "IMD(ERA5)" },
      { name: "Low Precipitation Season", source: "IMD(ERA5)" },
      { name: "High Precipitation Spell (days)", source: "IMD(ERA5)" },
      { name: "Low Precipitation Spell (days)", source: "IMD(ERA5)" },
      { name: "Aridity Index", source: "IMD(ERA5)" },
      { name: "Seasonality", source: "IMD(ERA5)" },
      { name: "1 day Maximum Precipitation (mm)", source: "IMD(ERA5)" },
      { name: "Maximum Wind Speed (m/s)", source: "ERA5" },
      { name: "Mean Wind Speed (m/s)", source: "ERA5" },
      { name: "Evaporation (mm/day)", source: "ERA5" },
      { name: "Potential Evapotranspiration (mm/day)", source: "IMD(ERA5)" },
      { name: "Evaporation_GLEAM (mm/day)", source: "GLEAM" },
      { name: "Potential Evapotranspiration_GLEAM (mm/day)", source: "GLEAM" },
    ],
  },
  {
    label: "Geological",
    keys: [
      { name: "Dominant Lithological Class", source: "GLiM" },
      { name: "Area Covered by Dominant Lithological Class", source: "GLiM" },
      { name: "Second Dominant Lithological Class", source: "GLiM" },
      { name: "Area Covered by Second Dominant Lithological Class", source: "GLiM" },
      { name: "Subsurface Permeability (m², log scale)", source: "GLHYMPS" },
      { name: "Subsurface Porosity", source: "GLHYMPS" },
      { name: "Groundwater Mean Level (m)", source: "CWC (India-WRIS)" },
    ],
  },
  {
    label: "LULC",
    keys: [
      { name: "Dominant LULC Class", source: "GLC_FCS30" },
      { name: "Fraction of Builtup", source: "GLC_FCS30" },
      { name: "Fraction of Agriculture", source: "GLC_FCS30" },
      { name: "Fraction of Forest Land", source: "GLC_FCS30" },
      { name: "Fraction of Grassland", source: "GLC_FCS30" },
      { name: "Fraction of Scrub", source: "GLC_FCS30" },
      { name: "Fraction of Water", source: "GLC_FCS30" },
      { name: "Fraction of Snow", source: "GLC_FCS30" },
      { name: "Fraction of Bareland", source: "GLC_FCS30" },
      { name: "Fraction of Wetland", source: "GLC_FCS30" },
      { name: "Fraction of Tundra", source: "GLC_FCS30" },
      { name: "NDVI DJF", source: "AVHRR" },
      { name: "NDVI MAM", source: "AVHRR" },
      { name: "NDVI JJA", source: "AVHRR" },
      { name: "NDVI SON", source: "AVHRR" },
    ],
  },
  {
    label: "Soil",
    keys: [
      { name: "Coarse Content (vol. %)", source: "HWSD" },
      { name: "Sand Content (%)", source: "HWSD" },
      { name: "Silt Content (%)", source: "HWSD" },
      { name: "Clay Content (%)", source: "HWSD" },
      { name: "Organic Carbon Content (g/kg)", source: "HWSD" },
      { name: "AWC (mm/m)", source: "HWSD" },
      { name: "Conductivity (mm/day)", source: "FAO" },
      { name: "Porosity", source: "FAO" },
      { name: "Maximum Water Content (m)", source: "FAO" },
      { name: "Bulk Density (kg/m³)", source: "FAO" },
      {name: 'cfvo_0–5cm (cm³/dm³ (vol‰))', 'source': 'SoilGrids 1km'},
      {name: 'cfvo_5–15cm (cm³/dm³ (vol‰))', 'source': 'SoilGrids 1km'},
      {name: 'cfvo_15–30cm (cm³/dm³ (vol‰))', 'source': 'SoilGrids 1km'},
      {name: 'cfvo_30–60cm (cm³/dm³ (vol‰))', 'source': 'SoilGrids 1km'},
      {name: 'cfvo_60–100cm (cm³/dm³ (vol‰))', 'source': 'SoilGrids 1km'},
      {name: 'cfvo_100–200cm (cm³/dm³ (vol‰))', 'source': 'SoilGrids 1km'},
      {name: 'sand_0–5cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'sand_5–15cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'sand_15–30cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'sand_30–60cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'sand_60–100cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'sand_100–200cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'silt_0–5cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'silt_5–15cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'silt_15–30cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'silt_30–60cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'silt_60–100cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'silt_100–200cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'clay_0–5cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'clay_5–15cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'clay_15–30cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'clay_30–60cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'clay_60–100cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'clay_100–200cm (g/kg)', 'source': 'SoilGrids 1km'},
      {name: 'bdod_0–5cm(cg/cm³)', 'source': 'SoilGrids 1km'},
      {name: 'bdod_5–15cm (cg/cm³)', 'source': 'SoilGrids 1km'},
      {name: 'bdod_15–30cm (cg/cm³)', 'source': 'SoilGrids 1km'},
      {name: 'bdod_30–60cm (cg/cm³)', 'source': 'SoilGrids 1km'},
      {name: 'bdod_60–100cm (cg/cm³)', 'source': 'SoilGrids 1km'},
      {name: 'bdod_100–200cm (cg/cm³)', 'source': 'SoilGrids 1km'},
      {name: 'cec_0–5cm (mmol(c)/kg)', 'source': 'SoilGrids 1km'},
      {name: 'cec_5–15cm (mmol(c)/kg)', 'source': 'SoilGrids 1km'},
      {name: 'cec_15–30cm (mmol(c)/kg)', 'source': 'SoilGrids 1km'},
      {name: 'cec_30–60cm (mmol(c)/kg)', 'source': 'SoilGrids 1km'},
      {name: 'cec_60–100cm (mmol(c)/kg)', 'source': 'SoilGrids 1km'},
      {name: 'cec_100–200cm (mmol(c)/kg)', 'source': 'SoilGrids 1km'},
      {name: 'nitrogen_0–5cm (cg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'nitrogen_5–10cm (cg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'nitrogen_15–30cm (cg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'nitrogen_30–60cm (cg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'nitrogen_60–100cm (cg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'nitrogen_100–200cm (cg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'phh2o_0–5cm (pH×10)', 'source': 'SoilGrids 1km'},
      {name: 'phh2o_5–15cm (pH×10)', 'source': 'SoilGrids 1km'},
      {name: 'phh2o_15–30cm (pH×10)', 'source': 'SoilGrids 1km'},
      {name: 'phh2o_30–60cm (pH×10)', 'source': 'SoilGrids 1km'},
      {name: 'phh2o_60–100cm (pH×10)', 'source': 'SoilGrids 1km'},
      {name: 'phh2o_100–200cm (pH×10)', 'source': 'SoilGrids 1km'},
      {name: 'soc_0–5cm (dg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'soc_5–15cm (dg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'soc_15–30cm (dg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'soc_30–60cm (dg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'soc_60–100cm (dg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'soc_100–200cm (dg/kg)', 'source': 'SoilGrids 1km'},
      {name: 'ocd_0–5cm (hg/m³)', 'source': 'SoilGrids 1km'},
      {name: 'ocd_5–15cm (hg/m³)', 'source': 'SoilGrids 1km'},
      {name: 'ocd_15–30cm (hg/m³)', 'source': 'SoilGrids 1km'},
      {name: 'ocd_30–60cm (hg/m³)', 'source': 'SoilGrids 1km'},
      {name: 'ocd_60–100cm (hg/m³)', 'source': 'SoilGrids 1km'},
      {name: 'ocd_100–200cm (hg/m³)', 'source': 'SoilGrids 1km'}
    ],
  },
  {
    label: "Human Activity",
    keys: [
      { name: "Road Density (m/km²)", source: "Meijer et al., 2018" },
      { name: "Population", source: "CIESIN" },
      { name: "Population Density (people/km²)", source: "CIESIN" },
      { name: "Human Footprint", source: "CIESIN" },
      { name: "Stable Light", source: "DMSP" },
    ],
  },
  {
    label: "Hydrological Signature",
    keys: [
      { name: "Q5 (m³/sec)", source: "" },
      { name: "Q95 (m³/sec)", source: "" },
      { name: "High Discharge Frequency (days/year)", source: "" },
      { name: "Low Discharge Frequency (days/year)", source: "" },
      { name: "Zero Discharge Frequency (days/year)", source: "" },
      { name: "Slope of Flow Duration Curve", source: "" },
      { name: "High Spell Days", source: "" },
      { name: "Low Spell Days", source: "" },
      { name: "Baseflow Index", source: "" },
      { name: "Mean Half-Flow Days", source: "" },
      { name: "Mean Discharge (mm/day)", source: "" },
      { name: "Runoff Coefficient", source: "" },
      { name: "Elasticity", source: "" },
    ],
  },
];

// Utility function for export
const exportCategoryAsJSON = (dam, geoJsonData, tab) => {
  const damName = (dam["Station Name"] || "dam").replace(/[^a-z0-9]/gi, "_");
  const category = CATEGORIES[tab];
  const json = {};
  
  category.keys.forEach((k) => {
    json[k.name] = dam[k.name];
  });

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
};

// Subcomponents
const ExportButtons = ({ dam, geoJsonData, filteredCategories, tab }) => (
  <div style={{ margin: "12px 0" }}>
    <button
      onClick={() => exportCategoryAsJSON(
        dam,
        geoJsonData,
        CATEGORIES.findIndex(c => c.label === filteredCategories[tab].label)
      )}
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
      {filteredCategories[tab].label === "Overview" ? "(+Shapefile)" : ""}
    </button>
    
    <a
      href={`https://hydromonitoring.github.io/wain-reports/${encodeURIComponent(
        (dam["River Basin Name"] || "").replace(/ /g, "_")
      )}/${encodeURIComponent(
        (dam["Station Name"] || "").replace(/ /g, "_")
      )}`}
      target="_blank"
      rel="noopener"
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
);

const DataRow = ({ keyItem, value }) => {
  if (value === undefined) return null;
  
  return (
    <tr key={keyItem.name}>
      <td style={{ fontWeight: "bold", verticalAlign: "top" }}>
        {keyItem.name}
        <div style={{ 
          fontSize: "0.75em", 
          color: "#666", 
          fontWeight: "normal", 
          marginTop: "2px" 
        }}>
          {keyItem.source}
        </div>
      </td>
      <td style={{ verticalAlign: "top" }}>
        {typeof value === "number" ? value.toFixed(3) : value}
      </td>
    </tr>
  );
};

const TabNavigation = ({ filteredCategories, activeTab, onTabChange }) => (
  <div className="sidebar-tabs">
    {filteredCategories.map((cat, idx) => (
      <button
        key={cat.label}
        className={activeTab === idx ? "sidebar-tab active" : "sidebar-tab"}
        onClick={() => onTabChange(idx)}
      >
        {cat.label}
      </button>
    ))}
  </div>
);

const DataTable = ({ categoryKeys, dam }) => (
  <table>
    <tbody>
      {categoryKeys.map((k) => (
        <DataRow key={k.name} keyItem={k} value={dam[k.name]} />
      ))}
    </tbody>
  </table>
);

const EmptyState = () => (
  <div className="sidebar-empty">
    <span>Select a dam marker to see details here.</span>
  </div>
);

// Hook for category filtering
const useFilteredCategories = (dam) => {
  return useMemo(() => {
    return CATEGORIES.filter((cat) => {
      if (cat.label !== "Hydrological Signature") return true;
      return cat.keys.some(
        (k) => dam && dam[k.name] !== undefined && dam[k.name] !== null && dam[k.name] !== ""
      );
    });
  }, [dam]);
};

// Main component

function DamDetailsPanel({ dam, geoJsonData, open, onClose }) {
  const [tab, setTab] = useState(0);
  const filteredCategories = useFilteredCategories(dam);

  // Reset tab if it exceeds available categories
  useEffect(() => {
    if (tab >= filteredCategories.length) setTab(0);
  }, [filteredCategories, tab]);

  if (!open) {
    return <div className="sidebar-details" />;
  }

  return (
    <div className="sidebar-details open">
      <button className="sidebar-close-btn" onClick={onClose}>
        ×
      </button>
      
      {dam ? (
        <>
          <h2 className="sidebar-title">{dam["Station Name"]}</h2>
          
          <TabNavigation 
            filteredCategories={filteredCategories}
            activeTab={tab}
            onTabChange={setTab}
          />
          
          <div className="sidebar-tab-content">
            <ExportButtons 
              dam={dam}
              geoJsonData={geoJsonData}
              filteredCategories={filteredCategories}
              tab={tab}
            />
            
            <DataTable 
              categoryKeys={filteredCategories[tab]?.keys || []}
              dam={dam}
            />
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

export default DamDetailsPanel;
