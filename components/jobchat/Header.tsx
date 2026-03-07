import Image from "next/image";
import Link from "next/link";

export default function JobChatHeader() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo_main.png"
              alt="Workzup"
              width={140}
              height={32}
              priority
              className="h-7 sm:h-8 w-auto"
            />
          </Link>

          {/* Profile Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <span className="sr-only">Profile</span>
          </div>
        </div>
      </div>
    </header>
  );
}
