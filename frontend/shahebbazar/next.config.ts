import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    turbopack: {
        // The repo root also has a package-lock.json (it holds the scripts
        // that run the API and this app together). Without this, Next sees
        // two lockfiles, guesses the repo root is the workspace root, and
        // warns on every start. This app is the root of its own build.
        root: path.resolve(__dirname),
    },
};

export default nextConfig;
