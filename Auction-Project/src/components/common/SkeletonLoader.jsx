import "./SkeletonLoader.css";

export const SkeletonRect = ({ width = "100%", height = "20px", borderRadius = "10px", style = {} }) => (
  <div
    className="skeleton skeleton-rect"
    style={{ width, height, borderRadius, ...style }}
  />
);

export const SkeletonCircle = ({ size = "40px", style = {} }) => (
  <div
    className="skeleton skeleton-circle"
    style={{ width: size, height: size, ...style }}
  />
);

export const SkeletonText = ({ width = "100%", count = 1, size = "md" }) => {
  const heightClass = size === "sm" ? "skeleton-text-sm" : size === "lg" ? "skeleton-text-lg" : "skeleton-text";
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${heightClass}`}
          style={{ width: i === count - 1 ? "70%" : width }}
        />
      ))}
    </div>
  );
};

export const RegistrationTabSkeleton = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" }}>
    {/* Left Panel - Registration Link */}
    <div style={{
      background: "var(--card-bg-light)",
      borderRadius: "16px",
      border: "1px solid var(--border-light)",
      padding: "28px",
    }}>
      <SkeletonText width="180px" size="lg" />

      {/* Status Box Skeleton */}
      <div style={{
        padding: "20px",
        borderRadius: "12px",
        marginTop: "16px",
      }}>
        <SkeletonText width="120px" size="sm" />
        <SkeletonText width="80px" size="lg" style={{ marginTop: "8px" }} />
      </div>

      {/* Description Skeleton */}
      <div style={{ marginTop: "20px" }}>
        <SkeletonText width="90%" />
      </div>

      {/* URL Section Skeleton */}
      <div style={{ marginTop: "24px" }}>
        <SkeletonText width="140px" size="sm" />
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <SkeletonRect height="44px" style={{ flex: 1 }} />
          <SkeletonRect width="100px" height="44px" />
        </div>
      </div>

      {/* Button Skeleton */}
      <div style={{ marginTop: "16px" }}>
        <SkeletonRect width="110px" height="40px" />
      </div>
    </div>

    {/* Right Panel - Registration Deadline */}
    <div style={{
      background: "var(--card-bg-light)",
      borderRadius: "16px",
      border: "1px solid var(--border-light)",
      padding: "28px",
    }}>
      <SkeletonText width="200px" size="lg" />
      <SkeletonText width="100%" />
      <SkeletonText width="80%" />

      {/* Date Input Skeleton */}
      <div style={{ marginTop: "20px" }}>
        <SkeletonText width="120px" size="sm" />
        <SkeletonRect height="44px" style={{ marginTop: "8px" }} />
      </div>

      {/* Buttons Skeleton */}
      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        <SkeletonRect height="44px" style={{ flex: 1 }} />
        <SkeletonRect width="80px" height="44px" />
      </div>

      {/* Info Box Skeleton */}
      <div style={{
        marginTop: "24px",
        padding: "16px",
        borderRadius: "12px",
      }}>
        <SkeletonText width="70%" />
        <SkeletonText width="90%" />
        <SkeletonText width="60%" />
        <SkeletonText width="50%" size="sm" style={{ marginTop: "8px" }} />
      </div>
    </div>
  </div>
);

export default RegistrationTabSkeleton;
