"use server";

import { redirect } from "next/navigation";
import { createSessionForUser, destroyCurrentSession, normalizeEmail } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { logDatabaseError, prisma } from "@/lib/prisma";

function redirectToLogin(params: Record<string, string>): never {
  const searchParams = new URLSearchParams(params);
  redirect(`/login?${searchParams.toString()}`);
}

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(formData: FormData) {
  const displayName = getRequiredString(formData, "displayName");
  const email = normalizeEmail(getRequiredString(formData, "email"));
  const password = getRequiredString(formData, "password");

  if (!email || !password) {
    redirectToLogin({
      error: "Email and password are required.",
      mode: "register"
    });
  }

  if (password.length < 8) {
    redirectToLogin({
      error: "Use at least 8 characters for your password.",
      mode: "register"
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      redirectToLogin({
        error: "An account with that email already exists.",
        mode: "register"
      });
    }

    const user = await prisma.user.create({
      data: {
        displayName: displayName || email.split("@")[0],
        email,
        passwordHash: hashPassword(password)
      }
    });

    await createSessionForUser(user.id);
    redirect("/dashboard");
  } catch (error) {
    logDatabaseError("registerAction", error);
    redirectToLogin({
      error: "We couldn't reach the trade journal database. Check your deployment database settings and try again.",
      mode: "register"
    });
  }
}

export async function signInAction(formData: FormData) {
  const email = normalizeEmail(getRequiredString(formData, "email"));
  const password = getRequiredString(formData, "password");

  if (!email || !password) {
    redirectToLogin({
      error: "Enter your email and password to continue.",
      mode: "signin"
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
      redirectToLogin({
        error: "That email/password combination did not match.",
        mode: "signin"
      });
    }

    await createSessionForUser(user.id);
    redirect("/dashboard");
  } catch (error) {
    logDatabaseError("signInAction", error);
    redirectToLogin({
      error: "We couldn't reach the trade journal database. Check your deployment database settings and try again.",
      mode: "signin"
    });
  }
}

export async function signOutAction() {
  try {
    await destroyCurrentSession();
    redirect("/login?message=Signed out successfully.");
  } catch (error) {
    logDatabaseError("signOutAction", error);
    redirect("/login?message=Signed out locally, but the session could not be removed from the database.");
  }
}
