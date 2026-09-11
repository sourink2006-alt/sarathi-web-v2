import { NextResponse, userAgent } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { device } = userAgent(request);
  const ua = request.headers.get("user-agent") || "";
  const chMobile = request.headers.get("sec-ch-ua-mobile");

  const isPhone =
    chMobile === "?1" ||
    device.type === "mobile" ||
    /iphone|ipod|windows phone|iemobile|blackberry/i.test(ua) ||
    (/android/i.test(ua) && /mobile/i.test(ua));

  if (isPhone) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/about"],
};
