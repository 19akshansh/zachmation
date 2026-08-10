import { headers, cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { envSchem } from "@/config/envSchema";
import { getSubscriptionStatus } from "@/lib/subscriptions";

const STATE_COOKIE = "google-sheets-oauth-state";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

type OAuthState = {
  nonce: string;
  userId: string;
  name: string;
  credentialId: string | null;
};

const redirectWithError = (request: NextRequest, error: string) =>
  NextResponse.redirect(
    new URL(
      `/credentials/new?type=GOOGLE_SHEETS&error=${encodeURIComponent(error)}`,
      request.url,
    ),
  );

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  const cookieStore = await cookies();
  const nonce = cookieStore.get(STATE_COOKIE)?.value;

  const clearCookie = (response: NextResponse) => {
    response.cookies.set(STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  };

  if (error) {
    return clearCookie(
      redirectWithError(request, `Google authorization failed: ${error}`),
    );
  }

  if (!code || !state || !nonce) {
    return clearCookie(
      redirectWithError(request, "Missing OAuth state or authorization code."),
    );
  }

  let oauthState: OAuthState;
  try {
    oauthState = JSON.parse(decrypt(state)) as OAuthState;
  } catch {
    return clearCookie(redirectWithError(request, "Invalid OAuth state."));
  }

  if (oauthState.nonce !== nonce) {
    return clearCookie(
      redirectWithError(request, "OAuth state validation failed."),
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.id !== oauthState.userId) {
    return clearCookie(
      redirectWithError(request, "Your session expired. Please try again."),
    );
  }

  try {
    const redirectUri = `${envSchem.NEXT_PUBLIC_APP_URL}/api/googleSheets/oauth/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: envSchem.GOOGLE_CLIENT_ID,
        client_secret: envSchem.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = (await tokenResponse.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
      token_type?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenResponse.ok || !tokens.access_token) {
      throw new Error(
        tokens.error_description ||
          tokens.error ||
          "Google token exchange failed.",
      );
    }

    const existingCredential = oauthState.credentialId
      ? await prisma.credential.findFirst({
          where: {
            id: oauthState.credentialId,
            userId: session.user.id,
            type: "GOOGLE_SHEETS",
          },
        })
      : null;

    if (oauthState.credentialId && !existingCredential) {
      throw new Error("Google Sheets credential was not found.");
    }

    const previousTokens = existingCredential
      ? (JSON.parse(decrypt(existingCredential.value)) as {
          refresh_token?: string;
        })
      : null;

    const refreshToken = tokens.refresh_token || previousTokens?.refresh_token;
    if (!refreshToken) {
      throw new Error(
        "Google did not return a refresh token. Reconnect and approve the requested access.",
      );
    }

    const credentialValue = JSON.stringify({
      provider: "google",
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      expiry_date: tokens.expires_in
        ? Date.now() + tokens.expires_in * 1000
        : undefined,
      scope: tokens.scope || SCOPES.join(" "),
      token_type: tokens.token_type,
    });

    if (!oauthState.credentialId) {
      const subscriptionStatus = await getSubscriptionStatus(session.user.id);
      if (subscriptionStatus === "UNKNOWN") {
        throw new Error("Unable to verify your subscription status.");
      }

      if (subscriptionStatus !== "PRO") {
        const credentialCount = await prisma.credential.count({
          where: { userId: session.user.id },
        });
        if (credentialCount >= 2) {
          throw new Error("Credential limit reached. Upgrade to PRO.");
        }
      }

      const credential = await prisma.credential.create({
        data: {
          name: oauthState.name,
          userId: session.user.id,
          type: "GOOGLE_SHEETS",
          value: encrypt(credentialValue),
        },
        select: { id: true },
      });

      const response = NextResponse.redirect(
        new URL(`/credentials/${credential.id}?connected=1`, request.url),
      );
      return clearCookie(response);
    }

    await prisma.credential.update({
      where: { id: oauthState.credentialId },
      data: {
        name: oauthState.name,
        value: encrypt(credentialValue),
      },
    });

    const response = NextResponse.redirect(
      new URL(
        `/credentials/${oauthState.credentialId}?connected=1`,
        request.url,
      ),
    );
    return clearCookie(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Google OAuth connection failed.";
    return clearCookie(redirectWithError(request, message));
  }
}
