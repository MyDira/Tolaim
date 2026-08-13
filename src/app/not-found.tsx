import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="label">Not found</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">That page is not here</h1>
      <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
        The address may be mistyped, or the item may not have been published yet — only content that has been reviewed
        appears on this site.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/produce"
          className="rounded-md border border-transparent bg-ink px-4 py-2.5 text-[0.9375rem] font-medium text-paper no-underline"
        >
          Search produce
        </Link>
        <Link
          href="/"
          className="rounded-md border border-edge bg-panel px-4 py-2.5 text-[0.9375rem] font-medium no-underline transition-colors hover:border-accent hover:text-accent"
        >
          Go to the front page
        </Link>
      </div>
    </div>
  );
}
