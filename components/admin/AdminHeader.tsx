type AdminHeaderProps = {
  title: string;
};

export default function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8">
      <div>
        <h1 className="text-[1.75rem] font-bold leading-none text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor activity, review records and manage the platform.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
            <input
              type="text"
              placeholder="Search anything..."
              className="w-[240px] bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
          A
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">Admin User</p>
          <p className="text-xs text-slate-500">Super Admin</p>
        </div>
      </div>
    </header>
  );
}