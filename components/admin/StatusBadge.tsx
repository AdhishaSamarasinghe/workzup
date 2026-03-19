type StatusBadgeProps = {
  status: string;
  type?: "success" | "warning" | "error" | "default" | "info";
};

export default function StatusBadge({
  status,
  type = "default",
}: StatusBadgeProps) {
  const styles = {
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    error: "bg-rose-100 text-rose-600",
    default: "bg-slate-100 text-slate-600",
    info: "bg-blue-100 text-blue-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[type]}`}
    >
      {status}
    </span>
  );
}