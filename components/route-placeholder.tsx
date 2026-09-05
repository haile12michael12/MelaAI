import Link from "next/link";

export function RoutePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">MelaAI</p>
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{title}</h1>
      <p className="mt-3 max-w-xl text-neutral-600">
        {description ?? "This workspace is ready for the next feature to be connected."}
      </p>
      <Link className="mt-8 w-fit text-sm font-medium text-neutral-950 underline underline-offset-4" href="/">
        Return to dashboard
      </Link>
    </main>
  );
}