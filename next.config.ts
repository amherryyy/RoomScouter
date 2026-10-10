import type { NextConfig } from "next";

function mapTileImageSource(configuredTileUrl: string | undefined, fallback: string) {
  const tileUrl = configuredTileUrl?.trim();
  if (!tileUrl) return fallback;
  const subdomainHost = tileUrl.match(/^https:\/\/\{[^}]+\}\.([^/?#]+)/)?.[1];
  if (subdomainHost) return "https://*." + subdomainHost;
  try {
    const url = new URL(tileUrl.replace(/\{[^}]+\}/g, "0"));
    return url.protocol === "https:" ? url.origin : fallback;
  } catch {
    return fallback;
  }
}

const streetTileImageSource = mapTileImageSource(
  process.env.NEXT_PUBLIC_MAP_TILE_URL,
  "https://tile.openstreetmap.org",
);
const satelliteTileImageSource = mapTileImageSource(
  process.env.NEXT_PUBLIC_MAP_SATELLITE_TILE_URL,
  "https://server.arcgisonline.com",
);

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://*.supabase.co " +
    streetTileImageSource + " " +
    satelliteTileImageSource,
  "font-src 'self' data:",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  }
};

export default nextConfig;
