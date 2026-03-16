import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "event-pass",
  project: "payment-system",
});

