import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/d9JM0Hb-rMV-NrqSBZRSvxz02X8BI_3UiHvcvfp42FQ.apk";

export async function GET() {
  return NextResponse.redirect(APK_URL, 302);
}
