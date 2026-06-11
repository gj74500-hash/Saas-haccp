import { getRequestConfig } from "next-intl/server";

// Locales the product is architected for. English ships first; French and
// Thai are enabled by adding messages/fr.json and messages/th.json and
// resolving the locale from the user profile below.
export const locales = ["en", "fr", "th"] as const;
export const defaultLocale = "en";

export default getRequestConfig(async () => {
  // Later: resolve from the authenticated user's `locale` field or an
  // Accept-Language cookie. English-first for now.
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
