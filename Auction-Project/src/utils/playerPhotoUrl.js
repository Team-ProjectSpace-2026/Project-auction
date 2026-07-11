const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const playerPhotoUrl = (photo) => {
  if (!photo) return null;
  // Already a full URL
  if (photo.startsWith("http")) return photo;
  return `${API_BASE}/uploads/photos/${encodeURIComponent(photo)}`;
};
