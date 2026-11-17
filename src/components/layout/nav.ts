export const navItems = [
  { key: "home", path: "" },
  { key: "services", path: "/services" },
  { key: "about", path: "/about" },
  { key: "location", path: "/location" },
  { key: "contact", path: "/contact" },
] as const;

export type NavKey = (typeof navItems)[number]["key"];
