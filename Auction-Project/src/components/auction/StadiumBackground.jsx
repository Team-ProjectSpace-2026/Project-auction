import { memo } from "react";
import { useTheme } from "../../context/ThemeContext";
import stadiumBgImage from "../../assets/stadiumbg.jpeg";

/**
 * StadiumBackground — Pure stadium image background
 */
const StadiumBackground = () => {
  const { theme } = useTheme();
  if (theme === "dark") return null;

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
