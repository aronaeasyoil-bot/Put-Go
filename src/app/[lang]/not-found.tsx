import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <p className="eyebrow text-gold-deep">404</p>
      <h1 className="mt-3 font-display text-4xl">Page introuvable · Page not found</h1>
      <Link href="/fr" className="mt-8 inline-block bg-ink px-6 py-3 text-sm uppercase tracking-wider text-white">PUT &amp; GO</Link>
    </div>
  );
}
