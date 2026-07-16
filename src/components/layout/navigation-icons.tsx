import {
  Bell,
  BrainCircuit,
  CalendarClock,
  Hospital,
  LayoutDashboard,
  ListOrdered,
  QrCode,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
  FileText,
} from "lucide-react";

import type { NavigationIconName } from "@/config/navigation.config";

export const navigationIcons: Record<NavigationIconName, typeof Bell> = {
  "layout-dashboard": LayoutDashboard,
  "calendar-clock": CalendarClock,
  "list-ordered": ListOrdered,
  "qr-code": QrCode,
  users: Users,
  stethoscope: Stethoscope,
  hospital: Hospital,
  "brain-circuit": BrainCircuit,
  bell: Bell,
  "file-text": FileText,
  "shield-check": ShieldCheck,
  settings: Settings,
};
