import "./CricketLoader.css";

/**
 * Premium Cricket Bat & Ball animated loader.
 *
 * Props:
 *  text  – loading message (default "Loading...")
 *  size  – "sm" | "md" | "lg" (default "md")
 */
const CricketLoader = ({ text = "Loading...", size = "md" }) => {
  return (
    <div className={`cricket-loader cricket-loader--${size}`}>
      <div className="cricket-loader__scene">
        {/* Pitch / crease line */}
        <div className="cricket-loader__pitch" />

        {/* Ball */}
        <div className="cricket-loader__ball">
          <div className="cricket-loader__ball-seam" />
        </div>

        {/* Bat */}
        <div className="cricket-loader__bat">
          <div className="cricket-loader__bat-blade" />
          <div className="cricket-loader__bat-handle" />
        </div>

        {/* Speed trail particles */}
        <div className="cricket-loader__trail cricket-loader__trail--1" />
        <div className="cricket-loader__trail cricket-loader__trail--2" />
        <div className="cricket-loader__trail cricket-loader__trail--3" />
      </div>

      {/* Loading text */}
      <div className="cricket-loader__text">{text}</div>
    </div>
  );
};

export default CricketLoader;
