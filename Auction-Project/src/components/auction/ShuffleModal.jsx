// React import removed (JSX runtime handles it automatically)

const ShuffleModal = ({ isOpen }) => {
  if (!isOpen) return null;
  return <div className="shuffle-modal">ShuffleModal</div>;
};

export default ShuffleModal;
