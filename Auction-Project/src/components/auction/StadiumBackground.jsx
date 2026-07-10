import { memo } from "react";
import stadiumBgImage from "../../assets/stadiumbg.jpeg";

/**
 * StadiumBackground — Pure stadium image background
 */
const StadiumBackground = () => {
  return (
    <div className="stadium-bg" aria-hidden="true">
      <div
        className="stadium-bg__image"
        style={{ backgroundImage: `url(${stadiumBgImage})` }}
      />
      <div className="stadium-bg__vignette" />
    </div>
  );
};

export default memo(StadiumBackground);
