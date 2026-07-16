"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/forms/select-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { SectionCard } from "@/components/common/section-card";

import { QueuePriorityBadge } from "./queue-priority-badge";
import { QueueStatusBadge } from "./queue-status-badge";
import type { QueueEntryRecord, QueueRecord } from "../types/queue.types";

type QueueServiceActionsPanelProps = {
  selectedEntry?: QueueEntryRecord | null;
  destinationQueues: QueueRecord[];
  canCall: boolean;
  canSkip: boolean;
  canStart: boolean;
  canComplete: boolean;
  canCancel: boolean;
  canTransfer: boolean;
  canChangePriority: boolean;
  isBusy: boolean;
  onCall: () => Promise<void>;
  onRecall: () => Promise<void>;
  onSkip: (reason?: string) => Promise<void>;
  onStart: () => Promise<void>;
  onComplete: () => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  onTransfer: (destinationQueueId: string, reason: string) => Promise<void>;
  onChangePriority: (level: 0 | 1 | 2 | 3, reason: string) => Promise<void>;
};

export function QueueServiceActionsPanel({
  selectedEntry,
  destinationQueues,
  canCall,
  canSkip,
  canStart,
  canComplete,
  canCancel,
  canTransfer,
  canChangePriority,
  isBusy,
  onCall,
  onRecall,
  onSkip,
  onStart,
  onComplete,
  onCancel,
  onTransfer,
  onChangePriority,
}: QueueServiceActionsPanelProps) {
  const [skipReason, setSkipReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [transferQueueId, setTransferQueueId] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("0");
  const [priorityReason, setPriorityReason] = useState("");

  if (!selectedEntry) {
    return (
      <SectionCard title="Service desk actions" description="Select a queue entry to start managing the patient flow.">
        <p className="text-sm text-muted-foreground">No queue entry selected yet.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Service desk actions" description="Run the operational queue workflow from one panel.">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-secondary p-4">
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{selectedEntry.display_queue_number}</p>
            <p className="text-sm text-muted-foreground">{selectedEntry.patient_name}</p>
          </div>
          <QueueStatusBadge status={selectedEntry.status} entry />
          <QueuePriorityBadge level={selectedEntry.priority_level} />
        </div>

        <div className="flex flex-wrap gap-2">
          {canCall ? <Button onClick={() => void onCall()} disabled={isBusy || selectedEntry.status !== "waiting"}>Call</Button> : null}
          {canCall ? <Button variant="secondary" onClick={() => void onRecall()} disabled={isBusy || selectedEntry.status !== "skipped"}>Recall</Button> : null}
          {canSkip ? <Button variant="secondary" onClick={() => void onSkip(skipReason || undefined)} disabled={isBusy || selectedEntry.status !== "called"}>Skip</Button> : null}
          {canStart ? <Button variant="secondary" onClick={() => void onStart()} disabled={isBusy || selectedEntry.status !== "called"}>Start service</Button> : null}
          {canComplete ? <Button onClick={() => void onComplete()} disabled={isBusy || selectedEntry.status !== "in_service"}>Complete service</Button> : null}
        </div>

        {canSkip ? (
          <TextareaField
            label="Skip reason"
            rows={2}
            value={skipReason}
            onChange={(event) => setSkipReason(event.target.value)}
            helperText="Optional reason used when the patient is skipped."
          />
        ) : null}

        {canChangePriority ? (
          <div className="grid gap-4 rounded-xl border border-border p-4 lg:grid-cols-[180px_1fr_auto]">
            <SelectField
              label="Priority"
              options={[
                { label: "Normal", value: "0" },
                { label: "Priority", value: "1" },
                { label: "Urgent", value: "2" },
                { label: "Emergency", value: "3" },
              ]}
              value={priorityLevel}
              onChange={(event) => setPriorityLevel(event.target.value)}
            />
            <TextareaField
              label="Priority reason"
              rows={2}
              value={priorityReason}
              onChange={(event) => setPriorityReason(event.target.value)}
            />
            <div className="flex items-end">
              <Button
                className="w-full lg:w-auto"
                variant="secondary"
                onClick={() => void onChangePriority(Number(priorityLevel) as 0 | 1 | 2 | 3, priorityReason)}
                disabled={isBusy}
              >
                Change priority
              </Button>
            </div>
          </div>
        ) : null}

        {canTransfer ? (
          <div className="grid gap-4 rounded-xl border border-border p-4 lg:grid-cols-[240px_1fr_auto]">
            <SelectField
              label="Destination queue"
              options={[
                { label: "Select destination queue", value: "" },
                ...destinationQueues.map((queue) => ({
                  label: `${queue.service_point_name} · ${queue.specialty_name ?? "General"}`,
                  value: queue.id,
                })),
              ]}
              value={transferQueueId}
              onChange={(event) => setTransferQueueId(event.target.value)}
            />
            <TextareaField
              label="Transfer reason"
              rows={2}
              value={transferReason}
              onChange={(event) => setTransferReason(event.target.value)}
            />
            <div className="flex items-end">
              <Button
                className="w-full lg:w-auto"
                variant="secondary"
                onClick={() => void onTransfer(transferQueueId, transferReason)}
                disabled={isBusy || !transferQueueId}
              >
                Transfer
              </Button>
            </div>
          </div>
        ) : null}

        {canCancel ? (
          <div className="grid gap-4 rounded-xl border border-danger/20 p-4 lg:grid-cols-[1fr_auto]">
            <TextareaField
              label="Cancellation reason"
              rows={2}
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
            />
            <div className="flex items-end">
              <Button
                className="w-full lg:w-auto"
                variant="danger"
                onClick={() => void onCancel(cancelReason)}
                disabled={isBusy}
              >
                Cancel entry
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
