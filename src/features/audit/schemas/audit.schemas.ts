import { z } from "zod";

export const auditOutcomeSchema = z.enum(["success", "failure", "denied"]);

export const auditLogFilterSchema = z.object({
  actor_user_id: z.string().trim().optional(),
  organization_id: z.string().trim().optional(),
  facility_id: z.string().trim().optional(),
  action: z.string().trim().optional(),
  resource_type: z.string().trim().optional(),
  resource_id: z.string().trim().optional(),
  outcome: auditOutcomeSchema.optional().or(z.literal("")),
  date_from: z.string().trim().optional(),
  date_to: z.string().trim().optional(),
  search: z.string().trim().optional(),
}).refine((value) => !value.date_from || !value.date_to || value.date_to >= value.date_from, {
  message: "date_to must be greater than or equal to date_from.",
  path: ["date_to"],
});

export const auditLogCreateSchema = z.object({
  actor_user_id: z.string().trim().optional(),
  organization_id: z.string().trim().optional(),
  facility_id: z.string().trim().optional(),
  action: z.string().trim().min(1, "Action is required."),
  resource_type: z.string().trim().min(1, "Resource type is required."),
  resource_id: z.string().trim().optional(),
  outcome: auditOutcomeSchema,
  source: z.enum(["web", "mobile", "api", "system", "admin"]).default("admin"),
  metadata_json: z.string().trim().optional(),
});
