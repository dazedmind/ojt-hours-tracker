"use server";

import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";

export async function actionCheckUserProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { ok: false, data: null, message: "Not authenticated" };
    }

    // Check if user exists in database
    const user = await prisma.users.findUnique({
      where: { email: authUser.email },
    });

    if (!user) {
      // Create user with basic info from auth
      const newUser = await prisma.users.create({
        data: {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.full_name || "",
          password: "", // OAuth users don't need password
          req_hours: 0,
        },
      });
      
      return { 
        ok: true, 
        data: newUser,
        needsOnboarding: !newUser.name || newUser.req_hours === 0 
      };
    }

    // Check if user needs to complete onboarding
    const needsOnboarding = !user.name || user.req_hours === 0;

    return { ok: true, data: user, needsOnboarding };
  } catch (error) {
    console.error("Error checking user profile:", error);
    return { ok: false, data: null, message: "Failed to check profile" };
  }
}

export async function actionUpdateUserProfile(name: string, reqHours: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { ok: false, data: null, message: "Not authenticated" };
    }

    const user = await prisma.users.update({
      where: { email: authUser.email },
      data: {
        name,
        req_hours: reqHours,
      },
    });

    return { ok: true, data: user };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { ok: false, data: null, message: "Failed to update profile" };
  }
}

export async function actionGetUserByEmail(email: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    return { ok: true, data: user };
  } catch (error) {
    console.error("Error getting user:", error);
    return { ok: false, data: null, message: "Failed to get user" };
  }
}
