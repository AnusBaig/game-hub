export interface FilterOption {
  name: string;
  slug: string;
}

export interface EsrbRating {
  value: string;
  label: string;
}

export const GAME_TAGS: FilterOption[] = [
  { name: "Singleplayer", slug: "31" },
  { name: "Multiplayer", slug: "7" },
  { name: "Co-op", slug: "18" },
  { name: "RPG", slug: "24" },
  { name: "Atmospheric", slug: "13" },
  { name: "Great Soundtrack", slug: "42" },
  { name: "Action", slug: "14" },
  { name: "Adventure", slug: "30" },
  { name: "Strategy", slug: "10" },
  { name: "Shooter", slug: "36" },
  { name: "Platformer", slug: "83" },
  { name: "Racing", slug: "8" },
  { name: "Sports", slug: "15" },
  { name: "Simulation", slug: "14" },
  { name: "Horror", slug: "4" },
  { name: "Survival", slug: "2" },
  { name: "Open World", slug: "37" },
  { name: "Indie", slug: "3" }
];

export const ESRB_RATINGS: EsrbRating[] = [
  { value: "", label: "Any Rating" },
  { value: "everyone", label: "Everyone" },
  { value: "everyone-10-plus", label: "Everyone 10+" },
  { value: "teen", label: "Teen" },
  { value: "mature", label: "Mature 17+" },
  { value: "adults-only", label: "Adults Only 18+" },
];

export const GAME_PUBLISHERS: FilterOption[] = [
  { name: "Valve", slug: "valve" },
  { name: "Electronic Arts", slug: "electronic-arts" },
  { name: "Square Enix", slug: "square-enix" },
  { name: "Ubisoft", slug: "ubisoft-entertainment" },
  { name: "Microsoft Studios", slug: "microsoft-studios" },
  { name: "SEGA", slug: "sega-2" },
  { name: "Activision", slug: "activision" },
  { name: "Sony Interactive Entertainment", slug: "sony-interactive-entertainment" },
  { name: "Nintendo", slug: "nintendo" }
];

export const GAME_DEVELOPERS: FilterOption[] = [
  { name: "Valve Software", slug: "valve-software" },
  { name: "Ubisoft Montreal", slug: "ubisoft-montreal" },
  { name: "Square Enix", slug: "square-enix" },
  { name: "Capcom", slug: "capcom" },
  { name: "Bethesda Game Studios", slug: "bethesda-game-studios" },
  { name: "CD Projekt RED", slug: "cd-projekt-red" },
  { name: "Rockstar North", slug: "rockstar-north" },
  { name: "Naughty Dog", slug: "naughty-dog" }
];

export const getTagName = (slug: string): string => {
  const tag = GAME_TAGS.find(t => t.slug === slug);
  return tag ? tag.name : slug;
};

export const getPublisherName = (slug: string): string => {
  const publisher = GAME_PUBLISHERS.find(p => p.slug === slug);
  return publisher ? publisher.name : slug;
};

export const getDeveloperName = (slug: string): string => {
  const developer = GAME_DEVELOPERS.find(d => d.slug === slug);
  return developer ? developer.name : slug;
};

export const getEsrbRatingLabel = (value: string): string => {
  const rating = ESRB_RATINGS.find(r => r.value === value);
  return rating ? rating.label : value;
};