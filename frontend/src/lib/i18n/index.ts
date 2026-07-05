import { en } from "./locales/en";
import { hi } from "./locales/hi";
import type { Locale, TranslationDict } from "./types";

const locales: Record<Locale, TranslationDict> = { en, hi };

function getNestedValue(dict: TranslationDict, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as TranslationDict)) {
      return (acc as TranslationDict)[key];
    }
    return undefined;
  }, dict);

  return typeof value === "string" ? value : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const text = getNestedValue(locales[locale], key) ?? getNestedValue(locales.en, key) ?? key;

  if (!vars) return text;

  return text.replace(/\{(\w+)\}/g, (_, name) => {
    const value = vars[name];
    return value !== undefined ? String(value) : `{${name}}`;
  });
}

export function getNavLabel(locale: Locale, href: string): string {
  const segment = href.replace(/^\//, "").replace(/\//g, ".") || "dashboard";
  const key = segment === "trust-score" ? "nav.trustScore" : `nav.${toCamel(segment)}`;
  return translate(locale, key);
}

function toCamel(segment: string): string {
  return segment.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export type { Locale, TranslationDict } from "./types";
export { en, hi };
