"use server";

import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { signupSchema, loginSchema, SignupInput, LoginInput } from "@/lib/validations/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function signupAction(values: SignupInput): Promise<ActionResponse> {
  const validated = signupSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      message: "Please fix the validation errors.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, organizationName } = validated.data;

  // Check email uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email address already exists. Please log in.",
    };
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  try {
    // Transaction: Create Organization + User
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName.trim(),
          defaultThreshold: 10,
          currency: "USD",
        },
      });

      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email,
          passwordHash,
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });

    // Establish authenticated session
    await createSession(result.user.id);
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during account creation. Please try again.",
    };
  }

  redirect("/dashboard");
}

export async function loginAction(values: LoginInput): Promise<ActionResponse> {
  const validated = loginSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      message: "Please enter a valid email and password.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validated.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // Establish session
    await createSession(user.id);
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Failed to authenticate. Please check your credentials.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/login");
}
