// In production the frontend and API are served from the SAME origin via the
// Vercel proxy (see vercel.json rewrites), so we use relative paths. This keeps
// the auth cookies first-party and avoids third-party cookie blocking.
// In local dev (vite serve) we point straight at the wrangler Worker on :8787.
const API_BASE = import.meta.env.PROD ? "" : "http://localhost:8787";

export const USERS_BACKEND_URL = `${API_BASE}/api/v1/users`;
export const BLOGS_BACKEND_URL = `${API_BASE}/api/v1/blog`;
export const GOOGLE_AUTH_URL = `${API_BASE}/auth/google`;

// Cloudinary (unsigned) settings used for image uploads.
// Both are public values, safe to expose to the browser.
export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
