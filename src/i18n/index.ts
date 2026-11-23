import fr from "./dictionaries/fr";
import en from "./dictionaries/en";
import ar from "./dictionaries/ar";
import type { Dictionary } from "./dictionaries/fr";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { fr, en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
