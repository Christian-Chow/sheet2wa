import { en } from "./dictionaries/en";
import { zh } from "./dictionaries/zh";

const dictionaries = { en, zh };

export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof en;

export const locales: Locale[] = ["en", "zh"];
export const defaultLocale: Locale = "en";

export const hasLocale = (locale: string): locale is Locale => locale in dictionaries;

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
