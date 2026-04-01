import type { User } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "journal-session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function getExpiryDate() {
  return new Date(Date.now() + SESSION_TTL_MS);
}

function getCookieOptions(expiresAt: Date) {
  return {
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production"
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createSessionForUser(userId: string) {
  const expiresAt = getExpiryDate();
  const session = await prisma.authSession.create({
    data: {
      userId,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.id, getCookieOptions(expiresAt));

  return session;
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await prisma.authSession.deleteMany({
      where: {
        id: sessionId
      }
    });
  }

  cookieStore.set(SESSION_COOKIE, "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return null;
  }

  const session = await prisma.authSession.findFirst({
    where: {
      id: sessionId,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
