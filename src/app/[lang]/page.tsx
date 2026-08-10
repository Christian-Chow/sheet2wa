import { notFound } from "next/navigation";
import Header from "@/components/Header";
import SheetConverter from "@/components/SheetConverter";
import { ClipboardIcon, SparklesIcon, TableIcon } from "@/components/icons";
import { getDictionary, hasLocale } from "@/lib/dictionaries";

const stepIcons = [TableIcon, SparklesIcon, ClipboardIcon];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header dict={dict.header} lang={lang} />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center sm:pt-24 wide:max-w-5xl">
          <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#F3F1E4] px-3 py-1 text-xs font-medium text-[#7C744E]">
            <SparklesIcon className="h-3.5 w-3.5" />
            {dict.hero.badge}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl wide:text-6xl">
            {dict.hero.titleLine1}
            <br className="hidden sm:block" /> {dict.hero.titleLine2}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500 wide:max-w-2xl wide:text-xl">
            {dict.hero.subtitle}
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24 wide:max-w-7xl">
          <SheetConverter t={dict.converter} />
        </section>

        <section id="how-it-works" className="border-t border-slate-100 bg-white py-20">
          <div className="mx-auto max-w-5xl px-6 wide:max-w-7xl">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
              {dict.howItWorksHeading}
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {dict.steps.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <div key={step.title} className="relative text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#BFB378] to-[#998F60] text-white shadow-md shadow-[#BFB378]/20">
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <p className="text-xs font-semibold text-[#998F60]">{dict.stepLabel(i + 1)}</p>
                    <h3 className="mt-1 font-medium text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        {dict.footer}
      </footer>
    </div>
  );
}
