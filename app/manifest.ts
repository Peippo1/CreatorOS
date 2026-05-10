import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CreatorOS",
    short_name: "CreatorOS",
    description: "AI operating system for creators and internet brands.",
    start_url: "/generate",
    display: "standalone",
    background_color: "#fbfbfa",
    theme_color: "#111111",
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
