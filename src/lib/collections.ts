import type { CollectionEntry } from "astro:content";

/** Canonical work order for grids and Previous/Next: newest first, then title. */
export function sortWorks(works: CollectionEntry<"works">[]) {
  return [...works].sort((a, b) =>
    a.data.year !== b.data.year
      ? b.data.year - a.data.year
      : a.data.title.localeCompare(b.data.title, "ca"),
  );
}

/** A collection renders as an exhibition when it has a location or start date. */
export function isExhibition(c: CollectionEntry<"collections">) {
  return Boolean(c.data.startDate || c.data.location);
}

/** Current vs Past badge for dated collections; null when it has no dates. */
export function exhibitionStatus(
  c: CollectionEntry<"collections">,
  now = new Date(),
): "current" | "past" | null {
  if (!c.data.startDate) return null;
  if (c.data.endDate && c.data.endDate < now) return "past";
  return "current";
}
