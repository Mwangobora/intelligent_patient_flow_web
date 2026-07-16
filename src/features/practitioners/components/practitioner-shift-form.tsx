"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";

import { shiftSchema, type ShiftFormValues } from "../schemas/practitioner.schemas";
import type {
  ConsultationRoomLookupRecord,
  PractitionerDepartmentAssignmentRecord,
  PractitionerFacilityAssignmentRecord,
  ServicePointLookupRecord,
} from "../types/practitioner.types";

type PractitionerShiftFormProps = {
  assignments: PractitionerFacilityAssignmentRecord[];
  departmentAssignments: PractitionerDepartmentAssignmentRecord[];
  servicePoints: ServicePointLookupRecord[];
  rooms: ConsultationRoomLookupRecord[];
  isSubmitting?: boolean;
  onSubmit: (values: ShiftFormValues) => Promise<void>;
};

export function PractitionerShiftForm({
  assignments,
  departmentAssignments,
  servicePoints,
  rooms,
  isSubmitting = false,
  onSubmit,
}: PractitionerShiftFormProps) {
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      practitioner_facility_assignment_id: "",
      practitioner_department_assignment_id: "",
      service_point_id: "",
      consultation_room_id: "",
      starts_at: "",
      ends_at: "",
      accepts_appointments: true,
      notes: "",
    },
  });
  const selectedAssignmentId = useWatch({ control: form.control, name: "practitioner_facility_assignment_id" });
  const filteredDepartments = departmentAssignments.filter((item) => item.practitioner_facility_assignment === selectedAssignmentId);
  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => { await onSubmit(values); form.reset(); })}>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Facility assignment" options={[{ label: "Select assignment", value: "" }, ...assignments.map((assignment) => ({ label: `${assignment.practitioner_number} • ${assignment.facility_name}`, value: assignment.id }))]} error={errors.practitioner_facility_assignment_id?.message} {...form.register("practitioner_facility_assignment_id")} />
        <SelectField label="Department assignment" options={[{ label: "Optional department", value: "" }, ...filteredDepartments.map((assignment) => ({ label: assignment.department_name, value: assignment.id }))]} error={errors.practitioner_department_assignment_id?.message} {...form.register("practitioner_department_assignment_id")} />
        <SelectField label="Service point" options={[{ label: "Optional service point", value: "" }, ...servicePoints.map((point) => ({ label: `${point.name} (${point.code})`, value: point.id }))]} error={errors.service_point_id?.message} {...form.register("service_point_id")} />
        <SelectField label="Consultation room" options={[{ label: "Optional room", value: "" }, ...rooms.map((room) => ({ label: `${room.name} (${room.code})`, value: room.id }))]} error={errors.consultation_room_id?.message} {...form.register("consultation_room_id")} />
        <TextInputField label="Starts at" type="datetime-local" error={errors.starts_at?.message} {...form.register("starts_at")} />
        <TextInputField label="Ends at" type="datetime-local" error={errors.ends_at?.message} {...form.register("ends_at")} />
      </div>
      <TextareaField label="Notes" rows={3} error={errors.notes?.message} {...form.register("notes")} />
      <label className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-3 text-sm text-foreground">
        <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("accepts_appointments")} />
        <span>Accepts appointments during this shift</span>
      </label>
      <SubmitButton label="Create shift" loadingLabel="Saving..." isLoading={isSubmitting} />
    </form>
  );
}
