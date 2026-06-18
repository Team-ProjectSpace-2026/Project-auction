import React from "react";

const AlertBanner = ({ message, type = "info" }) => (
  <div className={`alert-banner ${type}`}>{message}</div>
);

export default AlertBanner;
