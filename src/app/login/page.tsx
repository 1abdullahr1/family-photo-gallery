import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const runtime = "edge";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  // If already authenticated, redirect directly to gallery
  if (sessionCookie?.value) {
    const session = await verifySessionToken(sessionCookie.value);
    if (session?.authenticated) {
      redirect("/");
    }
  }

  const title = process.env.NEXT_PUBLIC_GALLERY_TITLE || "The Family Album";
  const subtitle =
    process.env.NEXT_PUBLIC_GALLERY_SUBTITLE ||
    "Private archive of our moments and memories";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-album-bg">
      <LoginForm title={title} subtitle={subtitle} />
    </main>
  );
}
