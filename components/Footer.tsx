import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">
            <span className="text-blue-600">Workzup</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
        </div>

        <p className="text-xs text-gray-400">©2024 Workzup. All Rights reserved</p>
      </div>
    </footer>
  );
}
