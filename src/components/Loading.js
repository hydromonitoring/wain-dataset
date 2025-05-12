import React from "react";
import "./Loading.css";

function Loading() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <div className="loading-text">Loading...</div>
    </div>
  );
}

export default Loading;