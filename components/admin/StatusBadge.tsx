import { cn } from "@/lib/utils";
import { STATUS_COLORS, formatStatusLabel } from "@/lib/constants";

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-medium",
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
