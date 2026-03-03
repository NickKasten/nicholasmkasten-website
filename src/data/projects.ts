export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  repoUrl?: string;
  image?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "personal-website",
    title: "nicholasmkasten.com",
    tagline: "This very site — portfolio and blog built with Astro",
    description:
      "A personal website for showcasing projects and writing about tech, career, and the things I'm thinking about.",
    tech: ["Astro", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://nicholasmkasten.com",
    repoUrl: "https://github.com/NickKasten/nicholasmkasten-website",
    featured: true,
  },
  // Add more projects here
];
