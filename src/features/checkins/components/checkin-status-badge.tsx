import { StatusBadge } from "@/components/common/status-badge";

import { getCheckinMethodLabel, getCheckinModeLabel, getCheckinStatusLabel, getTokenStateLabel } from "./checkin-formatters";
import type { CheckinRecord, CheckinTokenRecord } from "../types/checkin.types";

export function CheckinStatusBadge({ checkin }: { checkin: CheckinRecord }) {
  return <StatusBadge label={getCheckinStatusLabel(checkin)} status={checkin.voided_at ? "danger" : "success"} />;
}

export function CheckinModeBadge({ checkin }: { checkin: CheckinRecord }) {
  return <StatusBadge label={getCheckinModeLabel(checkin)} status={checkin.appointment ? "info" : "warning"} />;
}

export function CheckinMethodBadge({ method }: { method: CheckinRecord["checkin_method"] }) {
  const status = method === "qr_code" ? "info" : method === "reception" ? "success" : "neutral";
  return <StatusBadge label={getCheckinMethodLabel(method)} status={status} />;
}

export function CheckinTokenStateBadge({ token }: { token: CheckinTokenRecord }) {
  const status = token.revoked_at ? "danger" : token.used_at ? "success" : token.is_active ? "info" : "warning";
  return <StatusBadge label={getTokenStateLabel(token)} status={status} />;
}
