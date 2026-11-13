import { Cpu, Music, Briefcase, Trophy, Palette, Utensils, GraduationCap, Gamepad2, Sparkles } from "lucide-react";

export const CATEGORIES = [
  { name: "Technology", icon: Cpu, hue: 232 },
  { name: "Music", icon: Music, hue: 320 },
  { name: "Business", icon: Briefcase, hue: 200 },
  { name: "Sports", icon: Trophy, hue: 24 },
  { name: "Art", icon: Palette, hue: 285 },
  { name: "Food", icon: Utensils, hue: 12 },
  { name: "Education", icon: GraduationCap, hue: 160 },
  { name: "Gaming", icon: Gamepad2, hue: 265 },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export const getCategory = (name) =>
  CATEGORIES.find((c) => c.name === name) || { name, icon: Sparkles, hue: 250 };
