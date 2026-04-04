export interface HeroBackground {
  id: string;
  name: string;
  className: string;
  previewColor: string;
}

export const HERO_BACKGROUNDS: HeroBackground[] = [
  {
    id: "modern-slate",
    name: "Modern Slate",
    className: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    previewColor: "#0f172a"
  },
  {
    id: "deep-blue",
    name: "Deep Ocean Blue",
    className: "bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900",
    previewColor: "#172554"
  },
  {
    id: "midnight-purple",
    name: "Midnight Purple",
    className: "bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900",
    previewColor: "#1e1b4b"
  },
  {
    id: "emerald-night",
    name: "Emerald Night",
    className: "bg-gradient-to-br from-emerald-950 via-slate-900 to-black",
    previewColor: "#064e3b"
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    className: "bg-gradient-to-r from-blue-900 to-indigo-900",
    previewColor: "#1e3a8a"
  },
  {
    id: "dark-industrial",
    name: "Dark Industrial",
    className: "bg-slate-900 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]",
    previewColor: "#0f172a"
  },
  {
    id: "tech-grid",
    name: "Tech Grid",
    className: "bg-slate-950 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]",
    previewColor: "#020617"
  },
  {
    id: "vibrant-gradient",
    name: "Vibrant Professional",
    className: "bg-gradient-to-tr from-blue-900 via-indigo-900 to-purple-900",
    previewColor: "#312e81"
  },
  {
    id: "minimal-dark",
    name: "Minimalist Dark",
    className: "bg-zinc-950",
    previewColor: "#09090b"
  },
  {
    id: "steel-gray",
    name: "Steel Gray",
    className: "bg-gradient-to-b from-gray-900 to-slate-950",
    previewColor: "#111827"
  }
];

export const getHeroBackground = (id?: string) => {
  return HERO_BACKGROUNDS.find(bg => bg.id === id) || HERO_BACKGROUNDS[0];
};
