import React from "react";

const ShuffleModal = ({ isOpen }) => {
  if (!isOpen) return null;
  return <div className="shuffle-modal">ShuffleModal</div>;
};

export default ShuffleModal;
