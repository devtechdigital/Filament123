import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Filament.home",
    short_name: "Filament",
    description: "Track filament spools and AMS slots",
    start_url: "/",
    display: "standalone",
    background_color: "#e3efe5",
    theme_color: "#14532d",
  };
}
