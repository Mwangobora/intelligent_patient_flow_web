import { Mail, MessageSquare, Smartphone, Bell, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { NotificationChannel, NotificationStatus } from "../types/notification.types";
import { formatNotificationLabel } from "./notification-formatters";

const statusTone: Record<NotificationStatus, "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  processing: "info",
  sent: "info",
  delivered: "success",
  failed: "danger",
  cancelled: "danger",
};

const StatusIcon = {
  pending: Clock,
  processing: Clock,
  sent: CheckCircle,
  delivered: CheckCircle,
  failed: AlertTriangle,
  cancelled: XCircle,
} satisfies Record<NotificationStatus, typeof Clock>;

const ChannelIcon = {
  sms: MessageSquare,
  email: Mail,
  push: Smartphone,
  in_app: Bell,
} satisfies Record<NotificationChannel, typeof Bell>;

export function NotificationStatusBadge({ status }: { status: NotificationStatus }) {
  const Icon = StatusIcon[status];
  return (
    <Badge tone={statusTone[status]}>
      <Icon className="mr-1 h-3 w-3" />
      {formatNotificationLabel(status)}
    </Badge>
  );
}

export function NotificationChannelBadge({ channel }: { channel: NotificationChannel }) {
  const Icon = ChannelIcon[channel];
  return (
    <Badge tone="info">
      <Icon className="mr-1 h-3 w-3" />
      {formatNotificationLabel(channel)}
    </Badge>
  );
}
