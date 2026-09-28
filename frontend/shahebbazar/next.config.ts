import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    turbopack: {
        // Pins the Turbopack root to this app, since the repo root has its own package-lock.json.
        root: path.resolve(__dirname),
    },
};

export default nextConfig;
