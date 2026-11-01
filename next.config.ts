import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The TM.7 generator reads these with fs at request time; make sure they
  // are always bundled into the API route's server trace (e.g. on Vercel).
  outputFileTracingIncludes: {
    "/api/generate-tm7": [
      "./public/templates/tm7-rayong.pdf",
      "./public/fonts/Sarabun-Regular.ttf",
    ],
  },
};

export default nextConfig;
