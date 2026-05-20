"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signUpSchema, signInSchema, type SignUpInput, type SignInInput } from "@/lib/validations";
import { getLoginLimiter } from "@/lib/redis";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────────

export async function signUp(input: SignUpInput) {
  // Validate input
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { full_name, email, password, phone } = parsed.data;

  try {
    const supabase = await createClient();

    // Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: "citizen",
        },
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Failed to create user account" };
    }

    // Create user record in our database
    await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        password_hash: "", // Supabase manages passwords
        full_name,
        phone: phone || null,
        role: "citizen",
      },
    });

    return { success: true, message: "Account created successfully! Please check your email to verify." };
  } catch (err: any) {
    console.error("Sign up error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// ─────────────────────────────────────────────
// SIGN IN
// ─────────────────────────────────────────────

export async function signIn(input: SignInInput) {
  // Validate input
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  try {
    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    const limiter = getLoginLimiter();
    const { success: allowed } = await limiter.limit(ip);

    if (!allowed) {
      return { error: "Too many login attempts. Please try again in 15 minutes." };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: "Invalid email or password" };
    }

    const fullName =
      data.user.user_metadata?.full_name ||
      data.user.email?.split("@")[0] ||
      "CivicDesk User";

    const metadataRole = data.user.user_metadata?.role as
      | "citizen"
      | "agent"
      | "supervisor"
      | "admin"
      | undefined;

    // Keep the app database in sync with Supabase Auth so verified users can log in.
    const user = await prisma.user.upsert({
      where: { id: data.user.id },
      update: {
        email: data.user.email || email,
        full_name: fullName,
        is_active: true,
      },
      create: {
        id: data.user.id,
        email: data.user.email || email,
        password_hash: "",
        full_name: fullName,
        role: metadataRole || "citizen",
      },
      select: { role: true, is_active: true },
    });

    if (!user.is_active) {
      await supabase.auth.signOut();
      return { error: "This account is disabled. Contact an administrator." };
    }

    revalidatePath("/", "layout");

    // Redirect based on role
    if (user?.role === "admin" || user?.role === "supervisor" || user?.role === "agent") {
      return { success: true, redirect: "/admin" };
    }

    return { success: true, redirect: "/dashboard" };
  } catch (err: any) {
    console.error("Sign in error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// ─────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ─────────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────────

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        avatar_url: true,
        created_at: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
