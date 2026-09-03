import { NextRequest, NextResponse } from "next/server";
import {
  verifyFamilyAccessCode,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Check brute-force rate limit
    const rateLimit = checkRateLimit(ip);
    if (rateLimit.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Please try again in ${rateLimit.retryAfterSeconds || 900} seconds.`,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const accessCode = body?.accessCode;

    if (!accessCode || typeof accessCode !== "string") {
      return NextResponse.json(
        { success: false, error: "Access code is required." },
        { status: 400 }
      );
    }

    // Verify access code in constant-time on the server
    const isValid = verifyFamilyAccessCode(accessCode);

    if (!isValid) {
      const updatedRateLimit = recordFailedAttempt(ip);

      if (updatedRateLimit.isBlocked) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many failed attempts. Access has been temporarily locked for 15 minutes.",
            retryAfter: updatedRateLimit.retryAfterSeconds,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Incorrect access code. Please check and try again.",
          remainingAttempts: updatedRateLimit.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    resetRateLimit(ip);

    // Create cryptographically signed session token
    const token = await createSessionToken();
    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      message: "Authenticated successfully.",
    });

    // Attach secure HTTP-only cookie
    response.cookies.set({
      name: cookieOptions.name,
      value: token,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
    });

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
