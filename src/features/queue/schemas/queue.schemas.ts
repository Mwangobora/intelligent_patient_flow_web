import { z } from "zod";

const requiredUuid = z.string().uuid("Please select a valid option.");

export const queueCreateSchema = z.object({
  service_point_id: requiredUuid,
  facility_specialty_id: z.string().uuid().optional().or(z.literal("")),
  queue_date: z.string().min(1, "Please choose a queue date."),
});

export const queueEntryCreateSchema = z
  .object({
    patient_checkin_id: requiredUuid,
    priority_level: z.coerce.number().int().min(0).max(3).default(0),
    priority_reason: z.string().max(250, "Reason must be 250 characters or fewer.").optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.priority_level > 0 && !value.priority_reason?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["priority_reason"],
        message: "Priority reason is required for non-normal queue priority.",
      });
    }
  });

export const queueEntryCancelSchema = z.object({
  cancellation_reason: z.string().min(3, "Please provide a cancellation reason."),
});

export const queuePrioritySchema = z.object({
  priority_level: z.coerce.number().int().min(0).max(3),
  priority_reason: z.string().min(3, "Please explain the priority change."),
});

export const queueTransferSchema = z.object({
  destination_queue_id: requiredUuid,
  transfer_reason: z.string().min(3, "Please provide a transfer reason."),
});

export const queueStatusActionSchema = z.object({
  at: z.string().optional(),
});

export type QueueCreateFormValues = z.infer<typeof queueCreateSchema>;
export type QueueEntryCreateFormValues = z.infer<typeof queueEntryCreateSchema>;
export type QueueEntryCancelFormValues = z.infer<typeof queueEntryCancelSchema>;
export type QueuePriorityFormValues = z.infer<typeof queuePrioritySchema>;
export type QueueTransferFormValues = z.infer<typeof queueTransferSchema>;
