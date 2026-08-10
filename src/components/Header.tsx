import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/dictionaries";

export default function Header({ dict, lang }: { dict: Dictionary["header"]; lang: Locale }) {
  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 wide:max-w-7xl">
        <Image
          src="/amante-logo.jpeg"
          alt="Amante"
          width={280}
          height={140}
          priority
          className="h-16 w-auto object-contain"
        />
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
            <a href="#how-it-works" className="hover:text-slate-900">
              {dict.howItWorks}
            </a>
          </nav>
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
            <Link
              href="/en"
              aria-current={lang === "en" ? "page" : undefined}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === "en" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              EN
            </Link>
            <Link
              href="/zh"
              aria-current={lang === "zh" ? "page" : undefined}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === "zh" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              中文
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
