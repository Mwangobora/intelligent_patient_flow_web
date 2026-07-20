"use client";

import Link from "next/link";
import { Eye, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { PatientNotificationRecord } from "../types/notification.types";
import { NotificationChannelBadge, NotificationStatusBadge } from "./notification-badges";
import { formatNotificationDate, formatNotificationLabel, formatOptional } from "./notification-formatters";

type NotificationsTableProps = {
  notifications: PatientNotificationRecord[];
  canSend: boolean;
  canCancel: boolean;
  onSend: (notification: PatientNotificationRecord) => void;
  onCancel: (notification: PatientNotificationRecord) => void;
  onMarkRead: (notification: PatientNotificationRecord) => void;
};

function canSendNotification(notification: PatientNotificationRecord) {
  return notification.status === "pending" || notification.status === "processing";
}

function canCancelNotification(notification: PatientNotificationRecord) {
  return notification.status === "pending" || notification.status === "processing";
}

function canMarkReadNotification(notification: PatientNotificationRecord) {
  return notification.channel === "in_app" && notification.status === "delivered" && !notification.read_at;
}

export function NotificationsTable({ notifications, canSend, canCancel, onSend, onCancel, onMarkRead }: NotificationsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="hidden min-w-full divide-y divide-border text-sm md:table">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Patient</th>
            <th className="px-4 py-3 font-medium">Channel</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Scheduled</th>
            <th className="px-4 py-3 font-medium">Delivery</th>
            <th className="px-4 py-3 font-medium">Attempts</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {notifications.map((notification) => (
            <tr key={notification.id}>
              <td className="px-4 py-4 font-medium">{formatNotificationLabel(notification.notification_type)}</td>
              <td className="px-4 py-4">{notification.patient_number}</td>
              <td className="px-4 py-4"><NotificationChannelBadge channel={notification.channel} /></td>
              <td className="px-4 py-4"><NotificationStatusBadge status={notification.status} /></td>
              <td className="px-4 py-4">{formatNotificationDate(notification.scheduled_for)}</td>
              <td className="px-4 py-4 text-xs text-muted-foreground">
                <div>Sent: {formatNotificationDate(notification.sent_at)}</div>
                <div>Delivered: {formatNotificationDate(notification.delivered_at)}</div>
                <div>Failed: {formatNotificationDate(notification.failed_at)}</div>
              </td>
              <td className="px-4 py-4">{notification.attempt_count}</td>
              <td className="px-4 py-4"><NotificationActions notification={notification} canSend={canSend} canCancel={canCancel} onSend={onSend} onCancel={onCancel} onMarkRead={onMarkRead} /></td>
            </tr>
          ))}
          {!notifications.length ? <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No notifications found.</td></tr> : null}
        </tbody>
      </table>
      <div className="divide-y divide-border md:hidden">
        {notifications.map((notification) => (
          <article key={notification.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{formatNotificationLabel(notification.notification_type)}</p>
                <p className="text-sm text-muted-foreground">Patient {notification.patient_number}</p>
              </div>
              <NotificationStatusBadge status={notification.status} />
            </div>
            <div className="flex flex-wrap gap-2"><NotificationChannelBadge channel={notification.channel} /><span className="text-sm text-muted-foreground">{formatNotificationDate(notification.scheduled_for)}</span></div>
            <p className="text-sm text-muted-foreground">Attempts: {notification.attempt_count} · Failure: {formatOptional(notification.failure_reason)}</p>
            <NotificationActions notification={notification} canSend={canSend} canCancel={canCancel} onSend={onSend} onCancel={onCancel} onMarkRead={onMarkRead} />
          </article>
        ))}
        {!notifications.length ? <p className="p-6 text-center text-sm text-muted-foreground">No notifications found.</p> : null}
      </div>
    </div>
  );
}

type NotificationActionsProps = Omit<NotificationsTableProps, "notifications"> & {
  notification: PatientNotificationRecord;
};

function NotificationActions({ notification, canSend, canCancel, onSend, onCancel, onMarkRead }: NotificationActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/notifications/${notification.id}`}>
        <Button variant="secondary"><Eye className="mr-2 h-4 w-4" />View</Button>
      </Link>
      {canSend && canSendNotification(notification) ? <Button variant="secondary" onClick={() => onSend(notification)}><Send className="mr-2 h-4 w-4" />Send</Button> : null}
      {canCancel && canCancelNotification(notification) ? <Button variant="danger" onClick={() => onCancel(notification)}>Cancel</Button> : null}
      {canMarkReadNotification(notification) ? <Button variant="secondary" onClick={() => onMarkRead(notification)}>Mark read</Button> : null}
    </div>
  );
}
