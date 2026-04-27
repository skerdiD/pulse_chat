import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("Next.js security headers", () => {
  it("sets baseline browser hardening headers for all routes", async () => {
    const headersConfig =
      typeof nextConfig.headers === "function"
        ? await nextConfig.headers()
        : [];

    const allRouteHeaders = headersConfig.find(
      (entry) => entry.source === "/:path*",
    )?.headers;

    expect(allRouteHeaders).toEqual(
      expect.arrayContaining([
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ]),
    );
  });
});
