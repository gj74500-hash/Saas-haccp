import {
  LayoutDashboard,
  Thermometer,
  SprayCan,
  ClipboardList,
  Bell,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  /** Key into the `nav` messages namespace */
  labelKey: "dashboard" | "temperatures" | "cleaning" | "records" | "alerts" | "reports" | "settings";
  href: string;
  icon: LucideIcon;
  /** Show in the mobile bottom tab bar */
  mobile?: boolean;
};

export const navItems: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard, mobile: true },
  { labelKey: "temperatures", href: "/temperatures", icon: Thermometer, mobile: true },
  { labelKey: "cleaning", href: "/cleaning", icon: SprayCan, mobile: true },
  { labelKey: "records", href: "/records", icon: ClipboardList },
  { labelKey: "alerts", href: "/alerts", icon: Bell, mobile: true },
  { labelKey: "reports", href: "/reports", icon: BarChart3 },
  { labelKey: "settings", href: "/settings", icon: Settings },
];
