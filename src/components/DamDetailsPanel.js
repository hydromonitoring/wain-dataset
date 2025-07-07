import React, { useState } from "react";

const CATEGORIES = [
  {
    label: "Overview",
    keys: [
      { name: "Station ID", source: "" },
      { name: "Station Name", source: "" },
      { name: "River Basin Name", source: "" },
      { name: "Latitude (°)", source: "" },
      { name: "Longitude (°)", source: "" },
    ],
  },
  {
    label: "Topographical",
    keys: [
      { name: "Area (km²)", source: "SRTM" },
      { name: "Perimeter (km)", source: "SRTM" },
      { name: "Circularity Ratio", source: "SRTM" },
      { name: "Minimum Elevation (m)", source: "SRTM" },
      { name: "Maximum Elevation (m)", source: "SRTM" },
      { name: "Mean Elevation (m)", source: "SRTM" },
      { name: "Mean Slope (m/km)", source: "SRTM" },
    ],
  },
  {
    label: "Climatic",
    keys: [
      { name: "Mean Precipitation Rate (mm/day)", source: "IMD, ERA5" },
      { name: "Maximum Temperature (°C)", source: "IMD, ERA5" },
      { name: "Minimum Temperature (°C)", source: "IMD, ERA5" },
      { name: "High Precipitation Frequency (days/year)", source: "IMD, ERA5" },
      { name: "Low Precipitation Frequency (days/year)", source: "IMD, ERA5" },
      { name: "High Precipitation Season", source: "IMD, ERA5" },
      { name: "Low Precipitation Season", source: "IMD, ERA5" },
      { name: "High Precipitation Spell (days)", source: "IMD, ERA5" },
      { name: "Low Precipitation Spell (days)", source: "IMD, ERA5" },
      { name: "Aridity Index", source: "IMD, ERA5" },
      { name: "Seasonality", source: "IMD, ERA5" },
      { name: "1 day Maximum Precipitation (mm)", source: "IMD, ERA5" },
      { name: "Maximum Wind Speed (m/s)", source: "IMD, ERA5" },
      { name: "Minimum Wind Speed (m/s)", source: "IMD, ERA5" },
      { name: "Evaporation (mm/day)", source: "IMD, ERA5" },
      { name: "Potential Evapotranspiration (mm/day)", source: "IMD, ERA5" },
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
      { name: "NDVI (DJF)", source: "AVHRR" },
      { name: "NDVI (MAM)", source: "AVHRR" },
      { name: "NDVI (JJA)", source: "AVHRR" },
      { name: "NDVI (SON)", source: "AVHRR" },
    ],
  },
  {
    label: "Soil",
    keys: [
      { name: "Coarse Content (vol. %)", source: "FAO" },
      { name: "Sand Content (%)", source: "FAO" },
      { name: "Silt Content (%)", source: "FAO" },
      { name: "Clay Content (%)", source: "FAO" },
      { name: "Organic Carbon Content (g/kg)", source: "FAO" },
      { name: "AWC (mm/m)", source: "FAO" },
      { name: "Conductivity (mm/day)", source: "FAO" },
      { name: "Porosity", source: "FAO" },
      { name: "Maximum Water Content (m)", source: "FAO" },
      { name: "Bulk Density (kg/m³)", source: "FAO" },
      { name: 'cfvo_0-5cm (cm3/dm3 (vol‰))',  source: 'SoilGrids 1km'},
      { name: 'cfvo_5-15cm (cm3/dm3 (vol‰))',  source: 'SoilGrids 1km'},
      { name: 'cfvo_15-30cm (cm3/dm3 (vol‰))',  source: 'SoilGrids 1km'},
      { name: 'cfvo_30-60cm (cm3/dm3 (vol‰))',  source: 'SoilGrids 1km'},
      { name: 'cfvo_60-100cm (cm3/dm3 (vol‰))',  source: 'SoilGrids 1km'},
      { name: 'cfvo_100-200cm (cm3/dm3 (vol‰))',  source: 'SoilGrids 1km'},
      { name: 'sand_0-5cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'sand_5-15cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'sand_15-30cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'sand_30-60cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'sand_60-100cm (g/kg) ',  source: 'SoilGrids 1km'},
      { name: 'sand_100-200cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'silt_0-5cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'silt_5-15cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'silt_15-30cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'silt_30-60cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'silt_60-100cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'silt_100-200cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'clay_0-5cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'clay_5-15cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'clay_15-30cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'clay_30-60cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'clay_60-100cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'clay_100-200cm (g/kg)',  source: 'SoilGrids 1km'},
      { name: 'bdod_0-5cm(cg/cm³)',  source: 'SoilGrids 1km'},
      { name: 'bdod_5-15cm (cg/cm³)',  source: 'SoilGrids 1km'},
      { name: 'bdod_15-30cm (cg/cm³)',  source: 'SoilGrids 1km'},
      { name: 'bdod_30-60cm (cg/cm³)',  source: 'SoilGrids 1km'},
      { name: 'bdod_60-100cm (cg/cm³)',  source: 'SoilGrids 1km'},
      { name: 'bdod_100-200cm (cg/cm³)',  source: 'SoilGrids 1km'},
      { name: 'cec_0-5cm (mmol(c)/kg)',  source: 'SoilGrids 1km'},
      { name: 'cec_5-15cm (mmol(c)/kg)',  source: 'SoilGrids 1km'},
      { name: 'cec_15-30cm (mmol(c)/kg)',  source: 'SoilGrids 1km'},
      { name: 'cec_30-60cm (mmol(c)/kg)',  source: 'SoilGrids 1km'},
      { name: 'cec_60-100cm (mmol(c)/kg)',  source: 'SoilGrids 1km'},
      { name: 'cec_100-200cm (mmol(c)/kg)',  source: 'SoilGrids 1km'},
      { name: 'nitrogen_0-5cm (cg/kg)',  source: 'SoilGrids 1km'},
      { name: 'nitrogen_5-10cm (cg/kg)',  source: 'SoilGrids 1km'},
      { name: 'nitrogen_15-30cm (cg/kg)',  source: 'SoilGrids 1km'},
      { name: 'nitrogen_30-60cm (cg/kg)',  source: 'SoilGrids 1km'},
      { name: 'nitrogen_60-100cm (cg/kg)',  source: 'SoilGrids 1km'},
      { name: 'nitrogen_100-200cm (cg/kg)',  source: 'SoilGrids 1km'},
      { name: 'phh2o_0-5cm (pHx10)',  source: 'SoilGrids 1km'},
      { name: 'phh2o_5-15cm (pHx10)',  source: 'SoilGrids 1km'},
      { name: 'phh2o_15-30cm (pHx10)',  source: 'SoilGrids 1km'},
      { name: 'phh2o_30-60cm (pHx10)',  source: 'SoilGrids 1km'},
      { name: 'phh2o_60-100cm (pHx10)',  source: 'SoilGrids 1km'},
      { name: 'phh2o_100-200cm (pHx10)',  source: 'SoilGrids 1km'},
      { name: 'soc_0-5cm (dg/kg)',  source: 'SoilGrids 1km'},
      { name: 'soc_5-15cm (dg/kg)',  source: 'SoilGrids 1km'},
      { name: 'soc_15-30cm (dg/kg)',  source: 'SoilGrids 1km'},
      { name: 'soc_30-60cm (dg/kg)',  source: 'SoilGrids 1km'},
      { name: 'soc_60-100cm (dg/kg)',  source: 'SoilGrids 1km'},
      { name: 'soc_100-200cm (dg/kg)',  source: 'SoilGrids 1km'},
      { name: 'ocd_0-5cm (hg/m³)',  source: 'SoilGrids 1km'},
      { name: 'ocd_5-15cm (hg/m³)',  source: 'SoilGrids 1km'},
      { name: 'ocd_15-30cm (hg/m³)',  source: 'SoilGrids 1km'},
      { name: 'ocd_30-60cm (hg/m³)',  source: 'SoilGrids 1km'},
      { name: 'ocd_60-100cm (hg/m³)',  source: 'SoilGrids 1km'},
      { name: 'ocd_100-200cm (hg/m³)',  source: 'SoilGrids 1km'}
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

// Export the current tab/category as JSON, Overview includes GeoJSON
function exportCategoryAsJSON(dam, geoJsonData, tab) {
  const damName = (dam["Station Name"] || "dam").replace(/[^a-z0-9]/gi, "_");
  const category = CATEGORIES[tab];
  const json = {};
  category.keys.forEach((k) => {
    json[k.name] = dam[k.name];
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
          dam[k.name] !== undefined &&
          dam[k.name] !== null &&
          dam[k.name] !== ""
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
            <table>
              <tbody>
                {filteredCategories[tab].keys.map((k) =>
                  dam[k.name] !== undefined ? (
                    <tr key={k.name}>
                      <td style={{ fontWeight: "bold", verticalAlign: "top" }}>
                        {k.name}
                        <div style={{ 
                          fontSize: "0.75em", 
                          color: "#666", 
                          fontWeight: "normal", 
                          marginTop: "2px" 
                        }}>
                          {k.source}
                        </div>
                      </td>
                      <td style={{ verticalAlign: "top" }}>
                        {typeof dam[k.name] === "number"
                          ? dam[k.name].toFixed(3) : dam[k.name]}
                      </td>
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
