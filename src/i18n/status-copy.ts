import type { Locale } from "./config";

/**
 * Copy for error and not-found states. Kept separate from the main
 * dictionaries so client error boundaries can import it cheaply.
 */
export const statusCopy = {
  en: {
    errorTitle: "Something went wrong.",
    errorBody: "Please try again. If it keeps happening, call us — we are happy to help.",
    retry: "Try again",
    home: "Back to home",
    notFoundTitle: "This page could not be found.",
    notFoundBody: "The link may be old or mistyped.",
  },
  te: {
    errorTitle: "ఏదో పొరపాటు జరిగింది.",
    errorBody: "దయచేసి మళ్ళీ ప్రయత్నించండి. సమస్య కొనసాగితే మాకు కాల్ చేయండి.",
    retry: "మళ్ళీ ప్రయత్నించండి",
    home: "హోమ్‌కు వెళ్ళండి",
    notFoundTitle: "ఈ పేజీ కనబడలేదు.",
    notFoundBody: "లింక్ పాతది లేదా తప్పుగా ఉండవచ్చు.",
  },
} satisfies Record<Locale, Record<string, string>>;
