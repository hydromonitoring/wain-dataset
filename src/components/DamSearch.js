import React from "react";

function DamSearch({ dams, onDamSelect }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Search dam name..."
        style={{ width: "100%", padding: 8 }}
        onChange={e => {
          const value = e.target.value.toLowerCase();
          const found = dams.find(dam =>
            dam["Station name"].toLowerCase().includes(value)
          );
          if (found) onDamSelect(found);
        }}
      />
    </div>
  );
}

export default DamSearch;