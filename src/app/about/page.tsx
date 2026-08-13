import type { Metadata } from "next";
import Link from "next/link";
import { getAuthorities } from "@/lib/data";

export const metadata: Metadata = {
  title: "About this site",
  description:
    "How the content on this site is prepared, reviewed and cited, what it is for, and what it deliberately does not do.",
};

export const revalidate = 300;

export default async function AboutPage() {
  const authorities = await getAuthorities();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl">About this site</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          A public reference for insect inspection in fruit, vegetables and herbs — written for someone standing at
          their kitchen sink, not for a specialist.
        </p>
      </header>

      <div className="rich mt-8 text-[1rem]">
        <h3>What it is for</h3>
        <p>
          You are holding something and you want to know three things: does it need checking, how serious is it, and
          what do you actually do. Every produce page answers those three in that order, before anything else.
        </p>

        <h3>How the content is prepared</h3>
        <p>
          Everything published here is prepared under rabbinic oversight and reviewed before it becomes visible.
          Nothing reaches the public site before that review, and the review is recorded — who approved a given item
          and when.
        </p>
        <p>
          Positions are attributed and cited. Where an authority has published a source, the citation names it; where a
          position was given directly, that is stated instead.
        </p>

        <h3>What it deliberately does not do</h3>
        <p>
          This site reports positions. It does not decide questions of halacha, and it does not resolve disagreements
          between the authorities it cites. Where they differ, each page shows the difference and names who holds what.
          For a ruling that applies to you, ask your own rabbi.
        </p>
        <p>
          Setting a rabbi on this site changes which position is shown <em>first</em>. It never hides the others, and it
          is not a substitute for asking.
        </p>

        <h3>Seasons and regions</h3>
        <p>
          Infestation is not a fixed property of a vegetable. It changes with the season, the growing region and the
          weather a crop grew in, which is why the{" "}
          <Link href="/alerts">alerts</Link> section exists. An authority whose guidance covers one supply may not be
          describing the produce in front of you — where that matters, the item page says so.
        </p>

        <h3>Authorities cited</h3>
        <p>
          {authorities.length} {authorities.length === 1 ? "authority is" : "authorities are"} currently cited on this
          site. <Link href="/authorities">See the full list</Link>, including what each one covers and which items they
          have positions on.
        </p>

        <h3>Corrections</h3>
        <p>
          If something here is wrong, out of date, or misattributed, it should be corrected rather than argued with.
          Raise it with the rabbinic authority responsible for the site.
        </p>
      </div>

      <div className="panel mt-10 bg-paper p-5">
        <h2 className="label">Printing</h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed">
          Every page on this site is set up to print. The{" "}
          <Link href="/cleaning" className="link">
            cleaning method pages
          </Link>{" "}
          in particular are laid out for a kitchen wall — navigation drops away and the level badges print as ink
          outlines, so a photocopy still reads correctly.
        </p>
      </div>
    </div>
  );
}
