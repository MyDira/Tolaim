import type { Metadata } from "next";
import { RabbiPicker } from "@/components/RabbiPicker";

export const metadata: Metadata = {
  title: "Your rabbi",
  description:
    "Tell the site which rabbi you follow and the position that applies to you is shown first on every produce page. Stored in your browser only.",
};

export const revalidate = 300;

export default function MyRabbiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl">Your rabbi</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          Most people follow a particular rabbi, and that rabbi in turn follows a particular expert — usually across the
          board, sometimes differently on a specific item. Choose yours here and the position that applies to you is
          shown first everywhere on the site.
        </p>
      </header>

      <div className="panel mt-6 bg-paper p-4 text-[0.875rem] leading-relaxed text-muted">
        <p>
          <strong className="font-semibold text-ink">This stays in your browser.</strong> There are no accounts on this
          site and nothing is sent anywhere. Clearing your browser data clears the choice, and so does the button below.
        </p>
        <p className="mt-2">
          Setting a rabbi changes which position is shown <em>first</em>. Every other authority&rsquo;s position stays
          visible on each produce page — nothing is hidden.
        </p>
      </div>

      <RabbiPicker />
    </div>
  );
}
