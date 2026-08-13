import type { Metadata } from "next";
import { Suspense } from "react";
import { ProduceExplorer } from "@/components/ProduceExplorer";
import { getCategories, getProduceSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Produce",
  description:
    "Every fruit, vegetable and herb on this site, with the level of checking each one needs. Search by name, or filter to just the items that need real inspection.",
};

// Content changes only when an admin publishes. Five minutes keeps the listing
// fresh without rebuilding, and revalidatePath in the admin makes it immediate.
export const revalidate = 300;

export default async function ProducePage() {
  const [items, categories] = await Promise.all([getProduceSummaries(), getCategories()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-2 max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl">Produce</h1>
        <p className="mt-2 text-[1.0625rem] leading-relaxed text-muted">
          Search for what you are holding. Every item shows how much checking it needs and what to do about it.
        </p>
      </header>

      <Suspense fallback={<div className="mt-8 h-64" />}>
        <ProduceExplorer items={items} categories={categories} />
      </Suspense>
    </div>
  );
}
