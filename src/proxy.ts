import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localeCookie, negotiateLocale } from "@/i18n/config";

/** Prefixes locale-less URLs with the visitor's saved or preferred language. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isLocale(pathname.split("/")[1])) return;

  const saved = request.cookies.get(localeCookie)?.value;
  const locale = isLocale(saved)
    ? saved
    : negotiateLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
