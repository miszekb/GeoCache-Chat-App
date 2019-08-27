import React from "react";
import "./Legend.style.scss";

const Legend = () => {
  return (
    <div className="legend">
      <span className="legend__name legend__title">Title</span>
      <div className="legend__wrapper">
        <span className="legend__name">Join</span>
        <span className="legend__name">Seekers</span>
        <span className="legend__name">Found</span>
        <span className="legend__name">Difficulty level</span>
      </div>
    </div>
  );
};

export default Legend;