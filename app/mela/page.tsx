import Link from "next/link";
import { Sparkles, MessageSquare, Lightbulb, Compass, Zap, Database, ArrowRight } from "lucide-react";

export default function MelaPage() {
  const features = [
    {
      title: "MELA AI Assistant",
      desc: "Chat with your primary intelligence interface for finances, tasks, investments, and daily planning.",
      href: "/mela/assistant",
      icon: MessageSquare,
      badge: "Primary Interface",
      color: "from-indigo-600 to-purple-600 text-white",
    },
    {
      title: "AI Insights",
      desc: "Proactive financial trends, spending velocity, and habit consistency analysis.",
      href: "/mela/insights",
      icon: Lightbulb,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      title: "Recommendations",
      desc: "Personalized advice on budget adjustments, reading lists, and goal acceleration.",
      href: "/mela/recommendations",
      icon: Compass,
      color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    },
    {
      title: "Automations",
      desc: "Event triggers, autonomous actions, and smart alerts across your platforms.",
      href: "/mela/automations",
      icon: Zap,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
    {
      title: "Semantic Memory",
      desc: "Inspect contextual memories and facts Mela remembers across your conversations.",
      href: "/mela/memory",
      icon: Database,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">MELA AI Suite</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Intelligent companion and autonomous life operating system
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.href}
              href={f.href}
              className="group flex flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:hover:border-indigo-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr ${f.color} shadow-xs`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {f.badge && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {f.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{f.desc}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs font-semibold text-indigo-600 dark:border-neutral-800 dark:text-indigo-400">
                <span>Open {f.title}</span>
                <ArrowRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
