type StatCardProps = {
  label: string;
  value: string;
  change: string;
  icon?: string;
  changeType?: "positive" | "negative" | "neutral";
};

export default function StatCard({
  label,
  value,
  change,
  icon = "●",
  changeType = "positive",
}: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-500"
      : changeType === "negative"
      ? "text-rose-500"
      : "text-slate-400";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-lg text-slate-500">
          {icon}
        </div>
        <span className={`text-xs font-semibold ${changeColor}`}>{change}</span>
      </div>

      <div className="mt-5">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-[2rem] font-bold leading-none text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}