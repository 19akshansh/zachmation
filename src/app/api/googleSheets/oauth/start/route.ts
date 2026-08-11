import { NodeType } from "@/generated/prisma/enums";
import { getNodeCredentialTypes } from "@/config/nodeTypes";
import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { envSchem } from "@/config/envSchema";
import { getSubscriptionStatus } from "@/lib/subscriptions";

const STATE_COOKIE = "google-sheets-oauth-state";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const name = request.nextUrl.searchParams.get("name")?.trim();
  const credentialId = request.nextUrl.searchParams.get("credentialId")?.trim();

  if (!name || name.length > 25) {
    return NextResponse.redirect(
      new URL("/credentials/new?error=invalid_name", request.url),
    );
  }

  if (credentialId) {
    const credential = await prisma.credential.findFirst({
      where: { id: credentialId, userId: session.user.id },
      select: { id: true, type: true },
    });

    if (!credential || credential.type !== getNodeCredentialTypes(NodeType.GOOGLE_SHEETS)[0]) {
      return NextResponse.redirect(
        new URL("/credentials/new?error=invalid_credential", request.url),
      );
    }
  } else {
    const subscriptionStatus = await getSubscriptionStatus(session.user.id);
    if (subscriptionStatus === "UNKNOWN") {
      return NextResponse.redirect(
        new URL(
          "/credentials/new?error=subscription_check_failed",
          request.url,
        ),
      );
    }

    if (subscriptionStatus !== "PRO") {
      const credentialCount = await prisma.credential.count({
        where: { userId: session.user.id },
      });

      if (credentialCount >= 2) {
        return NextResponse.redirect(
          new URL("/credentials/new?error=credential_limit", request.url),
        );
      }
    }
  }

  const nonce = crypto.randomUUID();
  const state = encrypt(
    JSON.stringify({
      nonce,
      userId: session.user.id,
      name,
      credentialId: credentialId || null,
    }),
  );

  const redirectUri = `${envSchem.NEXT_PUBLIC_APP_URL}/api/googleSheets/oauth/callback`;
  const authorizationUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth",
  );
  authorizationUrl.search = new URLSearchParams({
    client_id: envSchem.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES.join(" "),
    state,
  }).toString();

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
