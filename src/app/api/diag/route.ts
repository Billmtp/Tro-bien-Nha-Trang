import { NextResponse } from "next/server";

export async function GET() {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER || null;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || null;

  return NextResponse.json({
    status: "ok",
    commit: "diag-check",
    time: new Date().toISOString(),
    env: {
      hasGmailUser: !!gmailUser,
      gmailUserValue: gmailUser ? `${gmailUser.substring(0, 4)}***@gmail.com` : "CHƯA CÓ",
      hasGmailPass: !!gmailPass,
      gmailPassLength: gmailPass ? gmailPass.length : 0,
      hasResend: !!process.env.RESEND_API_KEY,
      vercelEnv: process.env.VERCEL_ENV || "unknown",
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
