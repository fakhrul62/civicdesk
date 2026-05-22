"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signUpSchema, signInSchema, type SignUpInput, type SignInInput } from "@/lib/validations";
import { getLoginLimiter } from "@/lib/redis";
import { clearAppSession, createAppSession, getAppSession } from "@/lib/auth-session";
import bcrypt from "bcryptjs";
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
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, role: true, password_hash: true, is_active: true },
    });

    if (existingUser) {
      if (!existingUser.password_hash) {
        const passwordHash = await bcrypt.hash(password, 12);
        const repairedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password_hash: passwordHash,
            full_name,
            phone: phone || null,
            is_active: true,
          },
          select: { id: true, email: true, role: true },
        });

        await createAppSession({
          sub: repairedUser.id,
          email: repairedUser.email,
          role: repairedUser.role,
        });

        revalidatePath("/", "layout");
        return { success: true, redirect: "/dashboard", message: "Account is ready." };
      }

      return { error: "An account with this email already exists." };
    }

    let authUserId: string | undefined;

    try {
      const supabase = await createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name,
            role: "citizen",
          },
        },
      });

      if (!authError) {
        authUserId = authData.user?.id;
      } else {
        console.warn("Supabase sign up unavailable, using local account:", authError.message);
      }
    } catch (error) {
      console.warn("Supabase sign up unavailable, using local account:", error);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        id: authUserId || crypto.randomUUID(),
        email: normalizedEmail,
        password_hash: passwordHash,
        full_name,
        phone: phone || null,
        role: "citizen",
      },
      select: { id: true, email: true, role: true },
    });

    await createAppSession({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    revalidatePath("/", "layout");
    return { success: true, redirect: "/dashboard", message: "Account created successfully." };
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
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    const limiter = getLoginLimiter();

    if (limiter) {
      try {
        const { success: allowed } = await Promise.race([
          limiter.limit(ip),
          new Promise<{ success: true }>((resolve) =>
            setTimeout(() => resolve({ success: true }), 2500)
          ),
        ]);

        if (!allowed) {
          return { error: "Too many login attempts. Please try again in 15 minutes." };
        }
      } catch (error) {
        console.warn("Login rate limiter unavailable:", error);
      }
    }

    const localUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        password_hash: true,
        role: true,
        is_active: true,
      },
    });

    if (localUser?.password_hash) {
      const passwordMatches = await bcrypt.compare(password, localUser.password_hash);

      if (!passwordMatches) {
        return { error: "Invalid email or password" };
      }

      if (!localUser.is_active) {
        return { error: "This account is disabled. Contact an administrator." };
      }

      await createAppSession({
        sub: localUser.id,
        email: localUser.email,
        role: localUser.role,
      });

      revalidatePath("/", "layout");

      if (["admin", "supervisor", "agent"].includes(localUser.role)) {
        return { success: true, redirect: "/admin" };
      }

      return { success: true, redirect: "/dashboard" };
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
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

      const user = await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          email: data.user.email || normalizedEmail,
          full_name: fullName,
          is_active: true,
        },
        create: {
          id: data.user.id,
          email: data.user.email || normalizedEmail,
          password_hash: "",
          full_name: fullName,
          role: metadataRole || "citizen",
        },
        select: { id: true, email: true, role: true, is_active: true },
      });

      if (!user.is_active) {
        await supabase.auth.signOut();
        return { error: "This account is disabled. Contact an administrator." };
      }

      await createAppSession({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      revalidatePath("/", "layout");

      if (["admin", "supervisor", "agent"].includes(user.role)) {
        return { success: true, redirect: "/admin" };
      }

      return { success: true, redirect: "/dashboard" };
    } catch (error) {
      console.error("Supabase sign in fallback failed:", error);
      return { error: "Invalid email or password" };
    }
  } catch (err: any) {
    console.error("Sign in error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// ─────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────

export async function signOut() {
  await clearAppSession();
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.warn("Supabase sign out skipped:", error);
  }
  revalidatePath("/", "layout");
  redirect("/");
}

// ─────────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────────

export async function getCurrentUser() {
  try {
    const session = await getAppSession();

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
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

      if (user) return user;
    }

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
