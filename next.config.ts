import type { NextConfig } from "next";

// cacheComponents is intentionally off: the dashboard and auth pages read
// the Supabase session cookie on every request, and the classic dynamic
// rendering model is the reliable fit for that here.
const nextConfig: NextConfig = {
  cacheComponents: false,
};

export default nextConfig;
