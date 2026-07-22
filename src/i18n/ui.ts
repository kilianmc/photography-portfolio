import ca from "./ca.json";
import es from "./es.json";
import en from "./en.json";
import fr from "./fr.json";
import de from "./de.json";
import it from "./it.json";
import pt from "./pt.json";

/*
 * UI-chrome dictionaries (PROJECT_SPEC.md §6). Only interface strings live here;
 * the artwork/prose content stays Catalan and comes from content collections.
 * Catalan is the fallback. Adding a language later = drop in one JSON file and
 * add it to `languages` + `ui`.
 */
export const languages = ["ca", "es", "en", "fr", "de", "it", "pt"] as const;
export type Lang = (typeof languages)[number];

export const defaultLang: Lang = "ca";

export const ui = { ca, es, en, fr, de, it, pt } satisfies Record<
  Lang,
  Record<string, string>
>;

export type UIKey = keyof typeof ca;

/** Server-side helper: `const t = useTranslations(lang); t("works")`. */
export function useTranslations(lang: Lang) {
  return (key: UIKey): string =>
    (ui[lang] as Record<UIKey, string>)[key] ??
    (ui[defaultLang] as Record<UIKey, string>)[key];
}
