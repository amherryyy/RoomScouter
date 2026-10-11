import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RoomScouter",
    short_name: "RoomScouter",
    description: "Find and compare approved boarding houses near Nueva Vizcaya State University.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#245f91",
    icons: [
      {
        src: "/roomscouter-icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
