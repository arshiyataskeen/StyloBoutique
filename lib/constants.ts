export const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "InProgress",
  "Ready",
  "Completed",
  "Cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const QUERY_STATUSES = ["New", "Responded", "Closed"] as const;

export type QueryStatus = (typeof QUERY_STATUSES)[number];

export const ADMIN_SESSION_COOKIE = "stylo_admin_session";

export function formatStatusLabel(status: string) {
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  InProgress: "bg-purple-100 text-purple-800",
  Ready: "bg-emerald-100 text-emerald-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  New: "bg-amber-100 text-amber-800",
  Responded: "bg-blue-100 text-blue-800",
  Closed: "bg-green-100 text-green-800",
};
