import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { persistSubmittedProfile } from "@/app/api/signup/_lib/profile-submission";
import {
  createTherapistUser,
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";

const adminUserActionSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "provider"]),
});

const createProfileSchema = z.object({
  fullName: z.string().min(2),
  displayName: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  neighborhood: z.string().optional(),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).default([]),
  education: z.string().optional(),
  certifications: z.string().optional(),
  yearsExperience: z.union([z.number(), z.string()]).optional(),
  serviceCategories: z.array(z.string()).default([]),
  sessionLengths: z.array(z.string()).default([]),
  locationType: z.enum(["incall", "outcall", "both", ""]).optional(),
  startingPrice: z.union([z.number(), z.string()]).optional(),
  addOns: z.string().optional(),
  availableNow: z.boolean().default(false),
  profileStatus: z.enum(["draft", "pending_approval", "active"]).default("pending_approval"),
  role: z.enum(["admin", "provider", "client"]).default("provider"),
});

async function updateUserRole(
  adminUserId: string,
  input: z.infer<typeof adminUserActionSchema>,
) {
  const adminClient = createSupabaseAdminClient();

  const { error: deleteError } = await adminClient.from("user_roles").delete().eq("user_id", input.userId);
  if (deleteError) {
    throw new RouteError(500, deleteError.message);
  }

  const { data, error } = await adminClient
    .from("user_roles")
    .insert({
      user_id: input.userId,
      role: input.role,
    })
    .select("user_id, role")
    .single();

  if (error) {
    throw new RouteError(500, error.message);
  }

  await recordAuditLog(adminUserId, "update_user_role", "user", input.userId, {
    role: input.role,
  });

  return data;
}

async function createUserWithProfile(
  adminUserId: string,
  input: z.infer<typeof createProfileSchema>,
) {
  const adminClient = createSupabaseAdminClient();
  const created = await createTherapistUser({
    fullName: input.fullName,
    email: input.email,
    password: input.password,
  });

  const persistenceError = await persistSubmittedProfile(
    created.user.id,
    {
      fullName: input.fullName,
      displayName: input.displayName || input.fullName,
      email: input.email,
      phone: input.phone,
      city: input.city,
      state: input.state,
      neighborhood: input.neighborhood,
      tagline: input.tagline,
      bio: input.bio,
      languages: input.languages,
      education: input.education,
      certifications: input.certifications,
      yearsExperience: input.yearsExperience,
      serviceCategories: input.serviceCategories,
      sessionLengths: input.sessionLengths,
      locationType: input.locationType,
      startingPrice: input.startingPrice,
      addOns: input.addOns,
      availableNow: input.availableNow,
      termsAccepted: true,
      emailVerified: true,
      phoneVerified: true,
      identityVerified: false,
    },
    "premium",
  );

  if (persistenceError) {
    throw new RouteError(500, persistenceError);
  }

  if (input.profileStatus !== "pending_approval") {
    const profileStatusUpdate: Record<string, unknown> = {
      status: input.profileStatus,
      updated_at: new Date().toISOString(),
    };

    if (input.profileStatus === "active") {
      profileStatusUpdate.is_active = true;
      profileStatusUpdate.is_verified_profile = true;
    }

    const { error: profileStatusError } = await adminClient
      .from("profiles")
      .update(profileStatusUpdate)
      .eq("user_id", created.user.id);

    if (profileStatusError) {
      throw new RouteError(500, profileStatusError.message);
    }
  }

  if (input.role !== "provider") {
    const { error: deleteError } = await adminClient
      .from("user_roles")
      .delete()
      .eq("user_id", created.user.id);
    if (deleteError) {
      throw new RouteError(500, deleteError.message);
    }

    const { error: roleError } = await adminClient.from("user_roles").insert({
      user_id: created.user.id,
      role: input.role,
    });
    if (roleError) {
      throw new RouteError(500, roleError.message);
    }
  }

  await recordAuditLog(adminUserId, "create_user_profile", "user", created.user.id, {
    email: input.email,
    fullName: input.fullName,
    role: input.role,
    profileStatus: input.profileStatus,
  });

  return {
    userId: created.user.id,
    email: created.user.email,
    role: input.role,
  };
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const rawBody = await parseJsonBody(request, z.record(z.string(), z.unknown()));
    const roleUpdateCandidate = adminUserActionSchema.safeParse(rawBody);
    const createProfileCandidate = createProfileSchema.safeParse(rawBody);

    if (roleUpdateCandidate.success) {
      const result = await updateUserRole(admin.userId, roleUpdateCandidate.data);

      return json({
        ok: true,
        role: result,
      });
    }

    if (createProfileCandidate.success) {
      const result = await createUserWithProfile(admin.userId, createProfileCandidate.data);

      return json({
        ok: true,
        createdUser: result,
      });
    }

    throw new RouteError(400, "Invalid admin user action payload.");
  } catch (error) {
    return errorResponse(error);
  }
}
