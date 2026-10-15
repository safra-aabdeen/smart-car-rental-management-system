/**
 * Helper to get the backend API URL.
 * In production (e.g., hosted on Vercel), API requests are served on the same domain ('').
 * In local development, defaults to 'http://localhost:5000'.
 */
export const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "";
  }
  return "http://localhost:5000";
};

export default getBackendUrl;
