export type Locale = "en" | "hi";

export type TranslationValue = string | TranslationDict;
export type TranslationDict = { [key: string]: TranslationValue };
