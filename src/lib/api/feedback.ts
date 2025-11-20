"use server";

import { FeatureRequestTemplate } from "@/components/email/feature-request-template";
import { meta } from "@/lib/config";
import { resend } from "@/lib/services/resend";
import { action } from "@/lib/utils";
import { z } from "zod";

const featureRequestSchema = z.object({
  request: z.string().min(10, "Please provide more detail about your request."),
  email: z.email("Please enter a valid email address."),
  roles: z
    .array(
      z.enum([
        "individual_myself",
        "individual_others",
        "funeral_home_owner",
        "funeral_home_manager",
        "funeral_home_employee",
      ])
    )
    .min(1, "Please select at least one role."),
});

const ROLE_LABELS: Record<string, string> = {
  individual_myself: "Individual (for myself)",
  individual_others: "Individual (for others)",
  funeral_home_owner: "Funeral Home Owner",
  funeral_home_manager: "Funeral Home Manager",
  funeral_home_employee: "Funeral Home Employee (Non-Manager)",
};

export const featureRequestAction = action(
  featureRequestSchema,
  async (_, formData) => {
    const request = formData.get("request") as string;
    const email = formData.get("email") as string;
    const rolesRaw = formData.getAll("roles") as string[];

    if (!request || !email || rolesRaw.length === 0) {
      return { error: "Please fill out all required fields" };
    }

    // Map role values to labels
    const roles = rolesRaw.map((role) => ROLE_LABELS[role] || role);

    try {
      await resend.emails.send({
        from: `${meta.title} <${process.env.RESEND_EMAIL_FROM as string}>`,
        to: ["feedback@deathmattertools.com"],
        replyTo: email,
        subject: `Feature Request from ${email}`,
        react: FeatureRequestTemplate({
          request,
          email,
          roles,
        }) as React.ReactElement,
      });
      return { success: "Thank you! Your feature request has been submitted." };
    } catch (error) {
      console.error(error);
      return { error: "Failed to submit feature request. Please try again." };
    }
  }
);
