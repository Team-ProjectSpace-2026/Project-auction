import React from "react";

const SoldModal = ({ isOpen }) => {
  if (!isOpen) return null;
  return <div className="sold-modal">SoldModal</div>;
};

export default SoldModal;
