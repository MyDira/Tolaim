/**
 * The sample dataset.
 *
 * ---------------------------------------------------------------------------
 * SAMPLE CONTENT — NOT A HALACHIC SOURCE
 * ---------------------------------------------------------------------------
 * Every authority, rabbi, ruling and alert below is invented for development
 * and demonstration. The organisation and rabbi names are deliberately generic
 * so that nothing here can be mistaken for a real published position. Replace
 * the entire dataset with reviewed content before the site goes live.
 * ---------------------------------------------------------------------------
 *
 * This file is the single source of truth for two consumers:
 *   1. `src/lib/data/fixtures.ts`, which shapes it into domain objects so the
 *      site runs with no Supabase project configured.
 *   2. `scripts/generate-seed.mjs`, which emits `supabase/seed.sql` from it.
 *
 * Editing this file and running `npm run seed:gen` keeps both in step.
 */

import type { RiskLevel } from "../risk";
import type { AlertSeverity, AuthorityKind } from "../types";

export interface SeedCategory {
  slug: string;
  name: string;
  sortOrder: number;
}

export interface SeedAuthority {
  slug: string;
  name: string;
  shortName: string;
  kind: AuthorityKind;
  region: string;
  description: string;
  websiteUrl: string | null;
  sortOrder: number;
}

export interface SeedRuling {
  authority: string;
  level: RiskLevel;
  guidance: string;
  citation: string;
  effectiveDate?: string;
  notes?: string;
}

export interface SeedProduce {
  slug: string;
  name: string;
  alsoKnownAs: string[];
  category: string;
  summary: string;
  cleaningGuidance: string;
  seasonNote?: string;
  siteRiskLevel: RiskLevel | null;
  rulings: SeedRuling[];
  /** Left null in the sample data; real photographs are uploaded via /admin. */
  imagePath?: string | null;
}

export interface SeedRabbi {
  slug: string;
  name: string;
  community: string;
  region: string;
  description: string;
  defaultAuthority: string | null;
  overrides: { produce: string; authority: string; note: string }[];
}

export interface SeedAlert {
  slug: string;
  title: string;
  summary: string;
  body: string;
  severity: AlertSeverity;
  region: string;
  /** Days relative to the moment the dataset is read. Keeps the demo current. */
  publishedOffsetDays: number;
  expiresOffsetDays: number | null;
  produce: string[];
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const SEED_CATEGORIES: SeedCategory[] = [
  { slug: "leafy-greens", name: "Leafy greens", sortOrder: 10 },
  { slug: "herbs", name: "Fresh herbs", sortOrder: 20 },
  { slug: "cruciferous", name: "Broccoli & cabbage family", sortOrder: 30 },
  { slug: "berries", name: "Berries", sortOrder: 40 },
  { slug: "fruit", name: "Fruit", sortOrder: 50 },
  { slug: "vegetables", name: "Vegetables", sortOrder: 60 },
  { slug: "root-and-bulb", name: "Roots & bulbs", sortOrder: 70 },
  { slug: "dried-and-grains", name: "Dried goods & grains", sortOrder: 80 },
];

// ---------------------------------------------------------------------------
// Authorities
// ---------------------------------------------------------------------------

export const SEED_AUTHORITIES: SeedAuthority[] = [
  {
    slug: "metropolitan-produce-council",
    name: "Metropolitan Rabbinical Produce Council",
    shortName: "MRPC",
    kind: "organization",
    region: "North America",
    description:
      "Publishes a seasonal produce guide covering the North American supply, updated twice a year from its own inspection laboratory.",
    websiteUrl: null,
    sortOrder: 10,
  },
  {
    slug: "institute-produce-inspection",
    name: "Institute for Produce Inspection",
    shortName: "IPI",
    kind: "organization",
    region: "Israel",
    description:
      "Laboratory-based inspection body working primarily with Israeli-grown produce, where infestation patterns differ substantially from imported supply.",
    websiteUrl: null,
    sortOrder: 20,
  },
  {
    slug: "rav-yechezkel-adler",
    name: "Rav Yechezkel Adler",
    shortName: "R. Adler",
    kind: "posek",
    region: "North America",
    description:
      "Widely cited on questions of produce inspection. Positions are recorded from written responsa and from rulings given to the communities that follow him.",
    websiteUrl: null,
    sortOrder: 30,
  },
  {
    slug: "sefer-bedikas-hamazon",
    name: "Sefer Bedikas HaMazon",
    shortName: "SBH",
    kind: "publication",
    region: "International",
    description:
      "A standard reference work on food inspection, now in its second edition. Cited by page number throughout this site.",
    websiteUrl: null,
    sortOrder: 40,
  },
  {
    slug: "northern-vaad",
    name: "Northern Vaad HaKashrus",
    shortName: "Northern Vaad",
    kind: "organization",
    region: "United Kingdom",
    description:
      "Issues guidance for the British and Northern European supply, which draws on different growing regions than the North American market.",
    websiteUrl: null,
    sortOrder: 50,
  },
];

// ---------------------------------------------------------------------------
// Produce
// ---------------------------------------------------------------------------

export const SEED_PRODUCE: SeedProduce[] = [
  {
    slug: "romaine-lettuce",
    name: "Romaine lettuce",
    alsoKnownAs: ["Cos lettuce"],
    category: "leafy-greens",
    summary: "Heavily infested with thrips and aphids that sit deep in the rib of the leaf.",
    cleaningGuidance:
      "Separate every leaf from the head — nothing can be checked while the head is intact. Soak the leaves in cold water with a small amount of vegetable wash, agitate, then rinse each leaf individually under a strong stream of water. Inspect both sides of each leaf against a light box, paying particular attention to the white rib, where thrips lodge and are hard to see.\n\nIf you have not been shown how to do this in person, buy pre-checked lettuce instead. This is the single most common item people believe they have cleaned properly and have not.",
    seasonNote: "Infestation rises sharply in warm months and in field-grown rather than greenhouse supply.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance:
          "Leaf-by-leaf inspection over a light box after washing. Pre-checked product under reliable supervision is preferred for home use.",
        citation: "MRPC Produce Guide, 14th ed., §3.1",
        effectiveDate: "2025-09-01",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance:
          "Field-grown romaine from the Israeli supply is not recommended in its fresh form. Use greenhouse-grown product under supervision.",
        citation: "IPI Bulletin 41",
        effectiveDate: "2025-06-15",
        notes: "Applies to open-field supply. Greenhouse product is treated at level 2.",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 2,
        guidance:
          "May be checked at home by someone who has been trained. Washing without inspection is not sufficient.",
        citation: "Responsa, vol. II §17",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 2,
        guidance: "Requires washing followed by inspection of each leaf against strong light.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 112",
      },
    ],
  },
  {
    slug: "iceberg-lettuce",
    name: "Iceberg lettuce",
    alsoKnownAs: ["Crisphead lettuce"],
    category: "leafy-greens",
    summary: "The tight head protects the inner leaves, but the outer ones need real inspection.",
    cleaningGuidance:
      "Discard the outer leaves. Separate the remaining leaves, wash them, and inspect them against light. The inner core is generally clean, but do not assume the boundary between 'outer' and 'inner' — check until you have seen several consecutive clean leaves.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Discard outer leaves, wash and inspect the remainder. Within reach of a careful home cook.",
        citation: "MRPC Produce Guide, 14th ed., §3.2",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 3,
        guidance: "Outer leaves removed; remaining leaves washed and checked.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 115",
      },
      {
        authority: "northern-vaad",
        level: 2,
        guidance: "Recent UK supply has shown aphid presence well into the head. Treat as expert checking.",
        citation: "Northern Vaad Produce Notice 2026/02",
        effectiveDate: "2026-02-10",
      },
    ],
  },
  {
    slug: "spinach",
    name: "Spinach",
    alsoKnownAs: [],
    category: "leafy-greens",
    summary: "Leaf miners tunnel inside the leaf itself, where washing cannot reach them.",
    cleaningGuidance:
      "Leaf miner damage shows as a pale winding trail inside the leaf. A leaf with visible trails is discarded — the insect is inside the leaf and no washing removes it. Wash the remaining leaves, then inspect each one against light for trails and for thrips along the stem.\n\nBagged 'triple-washed' spinach has been washed, not inspected. It still requires checking unless it carries reliable supervision stating otherwise.",
    seasonNote: "Leaf miner activity peaks in spring and early summer.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "Discard leaves showing miner trails; inspect the rest leaf by leaf against light.",
        citation: "MRPC Produce Guide, 14th ed., §3.4",
      },
      {
        authority: "institute-produce-inspection",
        level: 2,
        guidance: "Requires trained inspection. Pre-checked frozen product is the practical option for home kitchens.",
        citation: "IPI Bulletin 39",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 2,
        guidance: "Checking is possible at home for one who knows what miner damage looks like.",
        citation: "Responsa, vol. II §19",
      },
    ],
  },
  {
    slug: "kale",
    name: "Kale",
    alsoKnownAs: ["Curly kale", "Cavolo nero", "Lacinato"],
    category: "leafy-greens",
    summary: "The curled edges hold aphids tightly; flat-leaf varieties are easier.",
    cleaningGuidance:
      "Strip the leaves from the stems. Soak in cold soapy water and agitate vigorously — the curl is what makes this hard, and agitation is what dislodges what is caught in it. Rinse thoroughly, then inspect against light, opening out the curled edge as you go.\n\nFlat-leaf varieties such as lacinato are meaningfully easier to check than curly kale.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "Soak, agitate, rinse and inspect. Curly varieties require particular care at the leaf edge.",
        citation: "MRPC Produce Guide, 14th ed., §3.6",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 2,
        guidance: "Washing with agitation followed by inspection.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 121",
      },
      {
        authority: "northern-vaad",
        level: 3,
        guidance: "May be checked at home following the soak-and-agitate method.",
        citation: "Northern Vaad Produce Guide, p. 8",
      },
    ],
  },
  {
    slug: "swiss-chard",
    name: "Swiss chard",
    alsoKnownAs: ["Silverbeet", "Mangold"],
    category: "leafy-greens",
    summary: "Both leaf miners and aphids; the thick stalk hides insects at the base.",
    cleaningGuidance:
      "Cut the leaf away from the stalk and treat the two separately. Discard leaves with miner trails. Wash and inspect the leaves against light. Split the stalks lengthwise and rinse the channel, which collects soil and insects.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "institute-produce-inspection",
        level: 2,
        guidance: "Leaf and stalk checked separately. Trained inspection required.",
        citation: "IPI Bulletin 44",
      },
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "Expert checking. Leaves with miner damage are discarded rather than cleaned.",
        citation: "MRPC Produce Guide, 14th ed., §3.7",
      },
    ],
  },
  {
    slug: "arugula",
    name: "Arugula",
    alsoKnownAs: ["Rocket", "Rucola"],
    category: "leafy-greens",
    summary: "Small, tender leaves that hold aphids and are difficult to inspect one by one.",
    cleaningGuidance:
      "Soak in cold soapy water, agitate well, and rinse through a fine strainer. Because the leaves are small, inspect in small batches spread thinly on a light box rather than leaf by leaf. Check the strainer and the wash water — insects that were dislodged will be there.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "Wash with agitation, filter the wash water, inspect in thin batches.",
        citation: "MRPC Produce Guide, 14th ed., §3.9",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 2,
        guidance: "Checking the wash water is an acceptable primary method for small-leaf greens.",
        citation: "Responsa, vol. II §22",
      },
    ],
  },
  {
    slug: "parsley",
    name: "Parsley",
    alsoKnownAs: ["Flat-leaf parsley", "Curly parsley"],
    category: "herbs",
    summary: "Among the most heavily infested items in the produce aisle.",
    cleaningGuidance:
      "Cut the bunch free of its tie and separate the sprigs. Soak in cold soapy water for several minutes, agitating hard. Rinse through a fine cloth or mesh and examine what the cloth caught — for herbs this is the primary check, not an afterthought. Then inspect the sprigs themselves against light.\n\nIf the wash water comes back visibly dirty a second and third time, keep washing.",
    seasonNote: "Consistently high year-round; not a seasonal item.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "Wash with agitation, filter, inspect the filter cloth, then inspect the sprigs.",
        citation: "MRPC Produce Guide, 14th ed., §4.1",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Not recommended fresh. Use supervised pre-checked or frozen product.",
        citation: "IPI Bulletin 38",
        notes: "IPI's position reflects the Israeli open-field supply specifically.",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 2,
        guidance: "Requires thorough washing and filtration of the wash water.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 138",
      },
      {
        authority: "northern-vaad",
        level: 2,
        guidance: "Expert checking. Pre-checked product widely available and preferred.",
        citation: "Northern Vaad Produce Guide, p. 12",
      },
    ],
  },
  {
    slug: "cilantro",
    name: "Cilantro",
    alsoKnownAs: ["Coriander leaf", "Fresh coriander", "Kusbara"],
    category: "herbs",
    summary: "Similar to parsley and generally worse; the leaf shape traps insects.",
    cleaningGuidance:
      "Treat exactly as parsley: separate, soak in soapy water with hard agitation, filter the wash water through a cloth, inspect the cloth, then inspect the sprigs against light. Repeat the wash until the water runs clean.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "As parsley. Filtering the wash water is required, not optional.",
        citation: "MRPC Produce Guide, 14th ed., §4.2",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Not recommended fresh.",
        citation: "IPI Bulletin 38",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 2,
        guidance: "Permitted with thorough washing and filtration by one trained in the method.",
        citation: "Responsa, vol. II §24",
      },
    ],
  },
  {
    slug: "fresh-dill",
    name: "Fresh dill",
    alsoKnownAs: ["Dill weed"],
    category: "herbs",
    summary: "The feathery fronds cannot be inspected reliably. Use dried or supervised frozen.",
    cleaningGuidance:
      "There is no home method that reliably clears fresh dill. The frond structure is too fine to inspect and too dense to wash through. Use dried dill, or frozen dill under reliable supervision, which is checked before freezing.\n\nIf a recipe calls for fresh dill, the supervised frozen product is the substitute — not a longer wash.",
    siteRiskLevel: 1,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 1,
        guidance: "Not recommended in fresh form. Use dried or supervised frozen.",
        citation: "MRPC Produce Guide, 14th ed., §4.5",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Not recommended fresh.",
        citation: "IPI Bulletin 38",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 1,
        guidance: "Cannot be checked adequately.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 141",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 2,
        guidance:
          "Where fresh dill is genuinely needed, repeated washing with filtration by a trained checker may be relied upon.",
        citation: "Responsa, vol. II §26",
        notes: "A minority position; most authorities on this site do not permit fresh dill.",
      },
    ],
  },
  {
    slug: "fresh-mint",
    name: "Fresh mint",
    alsoKnownAs: ["Nana", "Spearmint", "Peppermint"],
    category: "herbs",
    summary: "Very heavily infested, and the textured leaf makes inspection unreliable.",
    cleaningGuidance:
      "Most authorities do not accept a home method for fresh mint. The leaf surface is ridged and matte, which hides insects that would be visible on a smooth leaf, and the plant is grown in conditions that favour infestation.\n\nUse supervised pre-checked mint if you can find it; otherwise use dried.",
    siteRiskLevel: 1,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 1,
        guidance: "Not recommended fresh.",
        citation: "MRPC Produce Guide, 14th ed., §4.6",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Not recommended fresh. Pre-checked product available under supervision.",
        citation: "IPI Bulletin 38",
      },
      {
        authority: "northern-vaad",
        level: 2,
        guidance: "Expert checking permitted where supervised product is unavailable.",
        citation: "Northern Vaad Produce Guide, p. 14",
      },
    ],
  },
  {
    slug: "basil",
    name: "Basil",
    alsoKnownAs: ["Sweet basil"],
    category: "herbs",
    summary: "Thrips sit along the vein on the underside of the leaf.",
    cleaningGuidance:
      "Pick the leaves from the stems. Soak in cold soapy water, agitate, and rinse each leaf. Inspect the underside of every leaf against light, following the central vein — that is where thrips sit and they are the colour of the leaf.\n\nBasil grown hydroponically under supervision is substantially cleaner and is the practical choice if you use it often.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "Leaf-by-leaf inspection of the underside after washing.",
        citation: "MRPC Produce Guide, 14th ed., §4.8",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 2,
        guidance: "Washing and inspection required; hydroponic supply is preferable.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 144",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 3,
        guidance: "Hydroponic basil may be checked at home with a wash and a spot inspection.",
        citation: "Responsa, vol. III §4",
        notes: "Applies to hydroponic supply only.",
      },
    ],
  },
  {
    slug: "broccoli",
    name: "Broccoli",
    alsoKnownAs: [],
    category: "cruciferous",
    summary: "The floret head is dense enough that insects inside it cannot be seen or reached.",
    cleaningGuidance:
      "Fresh broccoli heads cannot be checked by looking at them — the florets close over anything inside. The accepted method is to break the head into small florets, soak in warm soapy water long enough to drive insects out, agitate, and then filter and examine the wash water. This takes training to do reliably.\n\nFrozen broccoli under reliable supervision is checked before freezing and is the ordinary choice for home kitchens.",
    seasonNote: "Aphid loads rise in late summer and autumn.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "Break into florets, soak in warm soapy water, agitate, filter and examine the wash water.",
        citation: "MRPC Produce Guide, 14th ed., §5.1",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Fresh broccoli heads are not recommended. Use supervised frozen product.",
        citation: "IPI Bulletin 40",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 2,
        guidance: "Requires the soak-and-filter method performed by a trained checker.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 156",
      },
      {
        authority: "northern-vaad",
        level: 2,
        guidance: "Expert checking. Supervised frozen strongly preferred for home use.",
        citation: "Northern Vaad Produce Guide, p. 19",
      },
    ],
  },
  {
    slug: "cauliflower",
    name: "Cauliflower",
    alsoKnownAs: [],
    category: "cruciferous",
    summary: "Denser than broccoli and harder again; the head conceals everything inside it.",
    cleaningGuidance:
      "Cut the head into small florets — smaller than you think, because the point is to open the interior. Soak in warm soapy water, agitate hard, then filter the wash water through a cloth and examine it carefully. Repeat until the filter comes back clean.\n\nSupervised frozen cauliflower is checked before freezing and avoids the whole procedure.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "Small florets, warm soapy soak, agitation, filtration and examination of the wash water.",
        citation: "MRPC Produce Guide, 14th ed., §5.2",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Not recommended fresh.",
        citation: "IPI Bulletin 40",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 2,
        guidance: "Permitted with the soak-and-filter method by a trained checker.",
        citation: "Responsa, vol. II §31",
      },
    ],
  },
  {
    slug: "cabbage",
    name: "Cabbage",
    alsoKnownAs: ["Green cabbage", "Red cabbage"],
    category: "cruciferous",
    summary: "The tight head keeps the interior clean; the outer layers do not stay clean.",
    cleaningGuidance:
      "Remove and discard the outer leaves. Then peel off leaves one at a time, rinsing and checking each, until you reach leaves that are clean and tightly packed. From that point inward the head is generally reliable.\n\nCheck the base of each leaf where it met the core, which is where aphids collect.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Discard outer leaves, check successive leaves until consistently clean.",
        citation: "MRPC Produce Guide, 14th ed., §5.4",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 3,
        guidance: "Outer leaves removed and successive leaves checked.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 160",
      },
      {
        authority: "institute-produce-inspection",
        level: 2,
        guidance: "Trained inspection recommended for open-field supply.",
        citation: "IPI Bulletin 40",
      },
    ],
  },
  {
    slug: "brussels-sprouts",
    name: "Brussels sprouts",
    alsoKnownAs: [],
    category: "cruciferous",
    summary: "Small tight heads — the same problem as cabbage, at a scale that makes it slower.",
    cleaningGuidance:
      "Trim the base and remove the outer two or three leaves of each sprout. Halve or quarter them and rinse, checking the cut faces and between the remaining layers. Because each sprout is a separate head, this has to be done individually — there is no batch shortcut.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Trim, remove outer leaves, halve and inspect each sprout.",
        citation: "MRPC Produce Guide, 14th ed., §5.5",
      },
      {
        authority: "northern-vaad",
        level: 3,
        guidance: "Home checking, sprout by sprout.",
        citation: "Northern Vaad Produce Guide, p. 21",
      },
    ],
  },
  {
    slug: "strawberries",
    name: "Strawberries",
    alsoKnownAs: [],
    category: "berries",
    summary: "The seeded surface and the hull both hold insects, but they can be reached.",
    cleaningGuidance:
      "Cut off the green hull and a thin slice of the flesh beneath it — that hollow is the main problem area. Soak the berries in cold soapy water, agitate, and rinse each one under a stream of water while rubbing the surface with your thumb. Inspect the surface and the cut end against light.\n\nDo not soak with the hull on; it traps what you are trying to remove.",
    seasonNote: "Higher risk in peak local season; imported winter supply is usually cleaner.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Hull removed, soaked, individually rinsed and rubbed, then inspected.",
        citation: "MRPC Produce Guide, 14th ed., §6.1",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 3,
        guidance: "Home checking following hull removal and individual rinsing.",
        citation: "Responsa, vol. II §35",
      },
      {
        authority: "institute-produce-inspection",
        level: 2,
        guidance: "Trained inspection recommended; the surface seed cavities require magnification to clear reliably.",
        citation: "IPI Bulletin 42",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 3,
        guidance: "Washing with surface rubbing and inspection.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 171",
      },
    ],
  },
  {
    slug: "raspberries",
    name: "Raspberries",
    alsoKnownAs: [],
    category: "berries",
    summary: "The hollow core and the gaps between drupelets cannot be cleared.",
    cleaningGuidance:
      "There is no reliable way to clean fresh raspberries. The berry is a cluster of small chambers around a hollow centre, and insects sit inside where neither water nor inspection reaches.\n\nUse supervised frozen or processed raspberry product. A purée or preserve made under supervision has been dealt with before processing.",
    siteRiskLevel: 1,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 1,
        guidance: "Not recommended fresh.",
        citation: "MRPC Produce Guide, 14th ed., §6.3",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Not recommended fresh.",
        citation: "IPI Bulletin 42",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 1,
        guidance: "Cannot be checked.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 174",
      },
      {
        authority: "northern-vaad",
        level: 1,
        guidance: "Not recommended fresh.",
        citation: "Northern Vaad Produce Guide, p. 24",
      },
    ],
  },
  {
    slug: "blackberries",
    name: "Blackberries",
    alsoKnownAs: [],
    category: "berries",
    summary: "Same structure as raspberries, with the same conclusion.",
    cleaningGuidance:
      "Not cleanable fresh, for the same reason as raspberries: the drupelet structure encloses spaces that cannot be reached or seen into. Use supervised frozen or processed product.",
    siteRiskLevel: 1,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 1,
        guidance: "Not recommended fresh.",
        citation: "MRPC Produce Guide, 14th ed., §6.4",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 1,
        guidance: "Cannot be checked.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 174",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Not recommended fresh.",
        citation: "IPI Bulletin 42",
      },
    ],
  },
  {
    slug: "blueberries",
    name: "Blueberries",
    alsoKnownAs: [],
    category: "berries",
    summary: "Smooth-skinned and mostly clean, but the blossom end needs a look.",
    cleaningGuidance:
      "Rinse in a colander, agitating so the berries turn over. Spread them on a light surface and look over them — you are checking the small opening at the blossom end and for any berry that is soft or split. Discard damaged berries rather than trying to clean them.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Rinse and inspect; discard soft or split berries.",
        citation: "MRPC Produce Guide, 14th ed., §6.5",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 4,
        guidance: "A rinse is sufficient for commercially graded supply.",
        citation: "Responsa, vol. III §9",
      },
      {
        authority: "northern-vaad",
        level: 3,
        guidance: "Rinse and look over. Damaged fruit discarded.",
        citation: "Northern Vaad Produce Guide, p. 25",
      },
    ],
  },
  {
    slug: "grapes",
    name: "Grapes",
    alsoKnownAs: ["Table grapes"],
    category: "fruit",
    summary: "Generally clean; check where the fruit meets the stem.",
    cleaningGuidance:
      "Separate the grapes from the stem or open the bunch out, and rinse under running water. Look at the point where each grape attached to the stem and discard any that are split or mouldy. Bunches that arrive with visible webbing between the grapes are rejected rather than washed.",
    siteRiskLevel: 4,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 4,
        guidance: "Rinse. Reject bunches with webbing or mould.",
        citation: "MRPC Produce Guide, 14th ed., §7.2",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 4,
        guidance: "Rinsing is sufficient.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 182",
      },
      {
        authority: "institute-produce-inspection",
        level: 3,
        guidance: "Open the bunch and check between grapes; mealybug has been found in some supply.",
        citation: "IPI Bulletin 43",
      },
    ],
  },
  {
    slug: "fresh-figs",
    name: "Fresh figs",
    alsoKnownAs: [],
    category: "fruit",
    summary: "The fruit is hollow and its interior is not accessible for inspection.",
    cleaningGuidance:
      "Fresh figs cannot be checked without destroying the fruit, and opening every fig is not a practical method. Most authorities do not permit fresh figs without supervision.\n\nDried figs are a separate question — see the dried figs entry, where the fruit can be opened and looked at.",
    siteRiskLevel: 1,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 1,
        guidance: "Not recommended fresh without supervision.",
        citation: "MRPC Produce Guide, 14th ed., §7.4",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Not recommended.",
        citation: "IPI Bulletin 43",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 2,
        guidance: "Each fig opened and inspected by a trained checker.",
        citation: "Responsa, vol. II §40",
        notes: "Practical only for small quantities.",
      },
    ],
  },
  {
    slug: "dried-figs",
    name: "Dried figs",
    alsoKnownAs: [],
    category: "dried-and-grains",
    summary: "Open each fig and look inside; infestation happens in storage, not the field.",
    cleaningGuidance:
      "Tear or cut each fig open and look at the interior against good light. You are looking for small insects and for fine webbing, which is the clearer sign. A fig with webbing is discarded along with any others stored touching it.\n\nProduct that has been vacuum-packed or refrigerated since packing is markedly cleaner than loose bulk supply.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Open each fig and inspect. Discard any showing webbing.",
        citation: "MRPC Produce Guide, 14th ed., §9.1",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 3,
        guidance: "Each fruit opened and checked.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 201",
      },
      {
        authority: "northern-vaad",
        level: 2,
        guidance: "Bulk supply requires trained inspection; packaged supply may be checked at home.",
        citation: "Northern Vaad Produce Guide, p. 31",
      },
    ],
  },
  {
    slug: "dates",
    name: "Dates",
    alsoKnownAs: ["Medjool dates", "Deglet Noor"],
    category: "dried-and-grains",
    summary: "Open each date to remove the pit and look inside while you do.",
    cleaningGuidance:
      "You are already opening the date to remove the pit — do it in good light and look at the cavity and the flesh around it. Discard any date with visible insects, webbing, or a powdery residue.\n\nRefrigerated or frozen supply is much less likely to be infested than dates kept at room temperature in bulk bins.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Open, pit and inspect each date.",
        citation: "MRPC Produce Guide, 14th ed., §9.2",
      },
      {
        authority: "institute-produce-inspection",
        level: 3,
        guidance: "Each date opened and checked at the pit cavity.",
        citation: "IPI Bulletin 45",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 3,
        guidance: "Home checking on opening.",
        citation: "Responsa, vol. III §12",
      },
    ],
  },
  {
    slug: "rice",
    name: "Rice",
    alsoKnownAs: ["White rice", "Basmati", "Jasmine rice"],
    category: "dried-and-grains",
    summary: "Spread it thin and look before cooking; storage pests are the concern.",
    cleaningGuidance:
      "Pour the rice in a thin layer onto a light-coloured tray and look across it — moving grains, small beetles, or clumped grains held together by webbing. Do this before the rice goes anywhere near the pot.\n\nRice kept sealed in a cool cupboard and used within a few months is rarely a problem. Long-stored open bags are where this shows up.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Spread thin on a light tray and inspect before use.",
        citation: "MRPC Produce Guide, 14th ed., §9.5",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 3,
        guidance: "Visual check of a thin layer.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 210",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 4,
        guidance: "Sealed commercial packaging within date requires no more than ordinary rinsing.",
        citation: "Responsa, vol. III §14",
      },
    ],
  },
  {
    slug: "celery",
    name: "Celery",
    alsoKnownAs: [],
    category: "vegetables",
    summary: "Insects sit in the groove that runs the length of each stalk.",
    cleaningGuidance:
      "Separate the stalks from the base. Run your thumb down the inner groove of each stalk under running water — that channel is the whole issue. Check the leafy tops separately, or discard them; they are as infested as any leafy green.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Stalks separated, groove rinsed and rubbed. Leafy tops treated as a leafy green.",
        citation: "MRPC Produce Guide, 14th ed., §8.1",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 3,
        guidance: "Each stalk rinsed along the groove.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 190",
      },
      {
        authority: "northern-vaad",
        level: 3,
        guidance: "Home checking, stalk by stalk.",
        citation: "Northern Vaad Produce Guide, p. 27",
      },
    ],
  },
  {
    slug: "asparagus",
    name: "Asparagus",
    alsoKnownAs: [],
    category: "vegetables",
    summary: "The overlapping scales at the tip hide insects and do not wash out.",
    cleaningGuidance:
      "Cut off the top inch or two, where the scales overlap tightly, and discard it. Rinse the remaining spear, rubbing along the shaft where smaller scales lie flat. Some authorities require the whole spear to be inspected under light after washing.",
    siteRiskLevel: 2,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 2,
        guidance: "Tips removed; remaining spear washed and inspected under light.",
        citation: "MRPC Produce Guide, 14th ed., §8.3",
      },
      {
        authority: "institute-produce-inspection",
        level: 2,
        guidance: "Trained inspection required.",
        citation: "IPI Bulletin 44",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 3,
        guidance: "Removing the tip and rinsing thoroughly is sufficient at home.",
        citation: "Responsa, vol. III §16",
      },
    ],
  },
  {
    slug: "artichoke",
    name: "Globe artichoke",
    alsoKnownAs: ["Artichoke"],
    category: "vegetables",
    summary: "Layer upon layer of tightly packed leaves with no way to see between them.",
    cleaningGuidance:
      "Fresh whole artichokes are not accepted by most authorities. The bracts overlap so tightly that neither water nor light reaches between them, and taking the vegetable apart leaf by leaf is beyond what anyone does in practice.\n\nSupervised frozen or jarred artichoke hearts are processed after checking and are the ordinary substitute.",
    siteRiskLevel: 1,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 1,
        guidance: "Not recommended fresh. Use supervised frozen or jarred hearts.",
        citation: "MRPC Produce Guide, 14th ed., §8.5",
      },
      {
        authority: "institute-produce-inspection",
        level: 1,
        guidance: "Not recommended.",
        citation: "IPI Bulletin 44",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 1,
        guidance: "Cannot be checked adequately in whole form.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 195",
      },
    ],
  },
  {
    slug: "corn-on-the-cob",
    name: "Corn on the cob",
    alsoKnownAs: ["Sweetcorn"],
    category: "vegetables",
    summary: "Strip the husk and silk and look at the tip, where the earworm enters.",
    cleaningGuidance:
      "Pull off the husk and all of the silk. Look at the tip of the cob — that is where corn earworm enters and where the damage is visible as chewed or discoloured kernels. Cut away any damaged section. Rinse the cob.",
    seasonNote: "Earworm damage is most common in late-summer local corn.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Husk and silk removed; tip inspected and damage cut away.",
        citation: "MRPC Produce Guide, 14th ed., §8.7",
      },
      {
        authority: "northern-vaad",
        level: 3,
        guidance: "Home checking at the tip.",
        citation: "Northern Vaad Produce Guide, p. 29",
      },
    ],
  },
  {
    slug: "bell-peppers",
    name: "Bell peppers",
    alsoKnownAs: ["Capsicum", "Sweet peppers"],
    category: "vegetables",
    summary: "The outside is clean; cut it open and check the seed cavity.",
    cleaningGuidance:
      "Rinse the outside. Cut the pepper open and remove the seed core — look at the cavity and at the folds inside the flesh before you slice further. Discard any pepper with soft spots or entry holes on the skin.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Cut open and inspect the seed cavity.",
        citation: "MRPC Produce Guide, 14th ed., §8.9",
      },
      {
        authority: "rav-yechezkel-adler",
        level: 4,
        guidance: "Rinse and remove the core; no further inspection required for graded supply.",
        citation: "Responsa, vol. III §18",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 3,
        guidance: "The interior cavity is checked on opening.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 197",
      },
    ],
  },
  {
    slug: "cucumber",
    name: "Cucumber",
    alsoKnownAs: [],
    category: "vegetables",
    summary: "Rinse it. Nothing further is required.",
    cleaningGuidance:
      "Rinse under running water. If the skin has soft spots or holes, cut them away or discard the cucumber — but ordinary graded supply needs nothing beyond a rinse.",
    siteRiskLevel: 4,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 4,
        guidance: "Rinse only.",
        citation: "MRPC Produce Guide, 14th ed., §8.11",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 4,
        guidance: "Rinsing is sufficient.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 198",
      },
      {
        authority: "institute-produce-inspection",
        level: 4,
        guidance: "Rinse only.",
        citation: "IPI Bulletin 44",
      },
    ],
  },
  {
    slug: "tomatoes",
    name: "Tomatoes",
    alsoKnownAs: ["Vine tomatoes", "Cherry tomatoes"],
    category: "vegetables",
    summary: "Rinse, and look at the stem scar.",
    cleaningGuidance:
      "Rinse under running water and glance at the scar where the stem attached, which is the one place anything collects. Split or mouldy fruit is discarded rather than washed.",
    siteRiskLevel: 4,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 4,
        guidance: "Rinse; discard split fruit.",
        citation: "MRPC Produce Guide, 14th ed., §8.12",
      },
      {
        authority: "northern-vaad",
        level: 4,
        guidance: "Rinse only.",
        citation: "Northern Vaad Produce Guide, p. 30",
      },
    ],
  },
  {
    slug: "carrots",
    name: "Carrots",
    alsoKnownAs: [],
    category: "root-and-bulb",
    summary: "Scrub or peel. The root itself is not an infestation concern.",
    cleaningGuidance:
      "Scrub under running water or peel. Cut away any cracked or damaged section. The leafy tops, if attached, are treated as a leafy green and are usually discarded.",
    siteRiskLevel: 4,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 4,
        guidance: "Scrub or peel.",
        citation: "MRPC Produce Guide, 14th ed., §10.1",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 4,
        guidance: "Washing is sufficient.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 205",
      },
    ],
  },
  {
    slug: "leeks",
    name: "Leeks",
    alsoKnownAs: [],
    category: "root-and-bulb",
    summary: "Split lengthwise and rinse between the layers — soil and insects sit there.",
    cleaningGuidance:
      "Trim the root and the dark green tops. Split the leek lengthwise and fan the layers open under running water, rinsing between each one. The layers are sleeves and everything collects inside them; rinsing the outside does nothing.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Split lengthwise and rinse between every layer.",
        citation: "MRPC Produce Guide, 14th ed., §10.3",
      },
      {
        authority: "institute-produce-inspection",
        level: 3,
        guidance: "Layers separated and rinsed individually.",
        citation: "IPI Bulletin 45",
      },
      {
        authority: "northern-vaad",
        level: 3,
        guidance: "Home checking between the layers.",
        citation: "Northern Vaad Produce Guide, p. 32",
      },
    ],
  },
  {
    slug: "scallions",
    name: "Scallions",
    alsoKnownAs: ["Spring onions", "Green onions"],
    category: "root-and-bulb",
    summary: "Same layered problem as leeks, at smaller scale.",
    cleaningGuidance:
      "Trim the roots and the tips. Split the green portion lengthwise and rinse inside the tube, where insects sit out of reach of a surface rinse. The white bulb needs its outer layer removed.",
    siteRiskLevel: 3,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 3,
        guidance: "Green tube split and rinsed inside; outer layer of the bulb removed.",
        citation: "MRPC Produce Guide, 14th ed., §10.4",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 3,
        guidance: "Split and rinse the interior.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 207",
      },
    ],
  },
  {
    slug: "onions",
    name: "Onions",
    alsoKnownAs: ["Brown onions", "Red onions"],
    category: "root-and-bulb",
    summary: "Peel and use. Nothing is required.",
    cleaningGuidance:
      "Remove the papery skin and the first layer beneath it. Discard onions that are soft or have visible rot. Nothing further applies.",
    siteRiskLevel: 5,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 5,
        guidance: "No checking required.",
        citation: "MRPC Produce Guide, 14th ed., §10.6",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 5,
        guidance: "No concern.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 208",
      },
      {
        authority: "institute-produce-inspection",
        level: 5,
        guidance: "No checking required.",
        citation: "IPI Bulletin 45",
      },
    ],
  },
  {
    slug: "potatoes",
    name: "Potatoes",
    alsoKnownAs: [],
    category: "root-and-bulb",
    summary: "Scrub or peel; cut out any eyes or damage.",
    cleaningGuidance:
      "Scrub under running water or peel. Cut out sprouting eyes, green patches and any damaged flesh. There is no insect concern in sound potatoes.",
    siteRiskLevel: 4,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 4,
        guidance: "Scrub or peel.",
        citation: "MRPC Produce Guide, 14th ed., §10.7",
      },
      {
        authority: "northern-vaad",
        level: 4,
        guidance: "Wash before use.",
        citation: "Northern Vaad Produce Guide, p. 33",
      },
    ],
  },
  {
    slug: "apples",
    name: "Apples",
    alsoKnownAs: [],
    category: "fruit",
    summary: "Rinse, and cut out the core as you normally would.",
    cleaningGuidance:
      "Rinse under running water. Check the skin for entry holes — a small dark puncture usually means damage inside, and that apple is cut open or discarded. The core is removed in the ordinary course of eating.",
    siteRiskLevel: 4,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 4,
        guidance: "Rinse; discard fruit with entry holes.",
        citation: "MRPC Produce Guide, 14th ed., §7.1",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 4,
        guidance: "Rinsing is sufficient for sound fruit.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 180",
      },
    ],
  },
  {
    slug: "bananas",
    name: "Bananas",
    alsoKnownAs: [],
    category: "fruit",
    summary: "Nothing required.",
    cleaningGuidance: "Peel and eat. The peel protects the fruit and there is no known concern.",
    siteRiskLevel: 5,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 5,
        guidance: "No checking required.",
        citation: "MRPC Produce Guide, 14th ed., §7.7",
      },
      {
        authority: "sefer-bedikas-hamazon",
        level: 5,
        guidance: "No concern.",
        citation: "Sefer Bedikas HaMazon, 2nd ed., p. 186",
      },
    ],
  },
  {
    slug: "avocado",
    name: "Avocado",
    alsoKnownAs: [],
    category: "fruit",
    summary: "Nothing required beyond discarding fruit that is rotten inside.",
    cleaningGuidance:
      "Cut open and remove the pit. Discard flesh that is brown or rotten — that is a quality question, not an infestation one. Nothing else applies.",
    siteRiskLevel: 5,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 5,
        guidance: "No checking required.",
        citation: "MRPC Produce Guide, 14th ed., §7.8",
      },
      {
        authority: "institute-produce-inspection",
        level: 5,
        guidance: "No checking required.",
        citation: "IPI Bulletin 43",
      },
    ],
  },
  {
    slug: "mushrooms",
    name: "Mushrooms",
    alsoKnownAs: ["Button mushrooms", "Cremini", "Portobello"],
    category: "vegetables",
    summary: "Wipe or rinse; check the gills of open-cap varieties.",
    cleaningGuidance:
      "Wipe or rinse briefly. For open-cap varieties such as portobello, look at the gills underneath and discard any that are wet, dark and collapsing. Commercially grown mushrooms are raised in controlled conditions and are rarely a concern.",
    siteRiskLevel: 4,
    rulings: [
      {
        authority: "metropolitan-produce-council",
        level: 4,
        guidance: "Rinse or wipe; check gills of open-cap varieties.",
        citation: "MRPC Produce Guide, 14th ed., §8.14",
      },
      {
        authority: "northern-vaad",
        level: 4,
        guidance: "Rinse only for cultivated supply.",
        citation: "Northern Vaad Produce Guide, p. 30",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Rabbis
// ---------------------------------------------------------------------------

export const SEED_RABBIS: SeedRabbi[] = [
  {
    slug: "rabbi-shmuel-brandt",
    name: "Rabbi Shmuel Brandt",
    community: "Congregation Ohel Yaakov",
    region: "North America",
    description: "Follows the Metropolitan Rabbinical Produce Council guide across the board.",
    defaultAuthority: "metropolitan-produce-council",
    overrides: [],
  },
  {
    slug: "rabbi-dovid-mizrachi",
    name: "Rabbi Dovid Mizrachi",
    community: "Sephardic Center of the Heights",
    region: "North America",
    description:
      "Follows the Institute for Produce Inspection, reflecting the community's reliance on Israeli-grown produce.",
    defaultAuthority: "institute-produce-inspection",
    overrides: [
      {
        produce: "romaine-lettuce",
        authority: "rav-yechezkel-adler",
        note: "For locally grown romaine specifically, defers to Rav Adler.",
      },
      {
        produce: "strawberries",
        authority: "metropolitan-produce-council",
        note: "Follows the MRPC on North American strawberry supply.",
      },
    ],
  },
  {
    slug: "rabbi-eliyahu-stern",
    name: "Rabbi Eliyahu Stern",
    community: "Beis Medrash of the North Side",
    region: "North America",
    description: "Follows the rulings of Rav Yechezkel Adler.",
    defaultAuthority: "rav-yechezkel-adler",
    overrides: [
      {
        produce: "fresh-dill",
        authority: "metropolitan-produce-council",
        note: "Does not rely on the lenient position for fresh dill.",
      },
    ],
  },
  {
    slug: "rabbi-menachem-roth",
    name: "Rabbi Menachem Roth",
    community: "United Synagogue, Northern District",
    region: "United Kingdom",
    description: "Follows Northern Vaad HaKashrus guidance for the British supply.",
    defaultAuthority: "northern-vaad",
    overrides: [],
  },
  {
    slug: "rabbi-yosef-kahn",
    name: "Rabbi Yosef Kahn",
    community: "Kehilas Bnei Torah",
    region: "International",
    description: "Rules from Sefer Bedikas HaMazon as the community's standard reference.",
    defaultAuthority: "sefer-bedikas-hamazon",
    overrides: [
      {
        produce: "broccoli",
        authority: "institute-produce-inspection",
        note: "Holds that fresh broccoli heads should not be used at all.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export const SEED_ALERTS: SeedAlert[] = [
  {
    slug: "thrips-surge-local-romaine",
    title: "Thrips surge in local romaine — check twice this month",
    summary: "Field-grown romaine from local growers is running far heavier than usual. Wash and inspect twice.",
    body:
      "Inspections this month have found thrips loads in locally grown romaine roughly three times the level recorded at the same point last year. The warm, dry spell through the growing period is the likely cause.\n\n**What to do**\n\nIf you check romaine at home, run the full wash-and-inspect twice rather than once, and expect to find something. If you are not confident, switch to supervised pre-checked lettuce for the rest of the season.\n\nGreenhouse-grown and hydroponic romaine is not affected and is running normally.\n\nThis notice will be reviewed at the end of the month.",
    severity: "urgent",
    region: "North America",
    publishedOffsetDays: -6,
    expiresOffsetDays: 24,
    produce: ["romaine-lettuce", "iceberg-lettuce"],
  },
  {
    slug: "strawberry-season-opening",
    title: "Local strawberry season is open",
    summary: "Peak-season local strawberries carry more than the imported winter supply. Hull and rinse individually.",
    body:
      "Local strawberries have started arriving. Peak-season fruit consistently runs higher than the imported winter supply, and the difference is large enough to be worth noting.\n\n**What to do**\n\nHull each berry, taking a thin slice of flesh with the hull, then soak and rinse the berries individually while rubbing the surface. Do not skip the hulling step before soaking — soaking with the hull on traps what you are trying to remove.",
    severity: "advisory",
    region: "North America",
    publishedOffsetDays: -19,
    expiresOffsetDays: 70,
    produce: ["strawberries"],
  },
  {
    slug: "dried-goods-storage-reminder",
    title: "Warm-weather reminder: check stored dried goods",
    summary: "Storage pests multiply quickly in summer. Go through opened bags of rice, flour and dried fruit.",
    body:
      "Storage pests breed fastest in warm weather, and an opened bag that was clean in March may not be clean in August.\n\n**What to do**\n\nGo through opened packets of rice, flour, dried fruit and nuts. Spread a sample thinly on a light-coloured tray and look across it for movement, for small beetles, and for grains held together by fine webbing. Anything showing webbing is discarded, along with anything stored touching it.\n\nMoving dried goods to sealed containers in a cool cupboard prevents most of this.",
    severity: "info",
    region: "International",
    publishedOffsetDays: -33,
    expiresOffsetDays: 45,
    produce: ["rice", "dried-figs", "dates"],
  },
  {
    slug: "cauliflower-supply-note-winter",
    title: "Winter cauliflower supply running clean",
    summary: "This winter's cauliflower is testing unusually clean, but the checking requirement has not changed.",
    body:
      "Laboratory sampling of the current winter cauliflower supply has come back cleaner than the seasonal average.\n\nThis does not change what is required. A clean batch average does not tell you about the head in your kitchen, and the checking requirement for fresh cauliflower stands unchanged. The note is recorded here because people ask, and because a rumour that 'cauliflower is fine this year' has been circulating.",
    severity: "info",
    region: "North America",
    publishedOffsetDays: -95,
    expiresOffsetDays: -12,
    produce: ["cauliflower", "broccoli"],
  },
  {
    slug: "aphids-uk-iceberg",
    title: "Aphids found deep in UK iceberg lettuce",
    summary: "Northern Vaad has raised iceberg lettuce to expert checking for the British supply.",
    body:
      "Northern Vaad HaKashrus has raised iceberg lettuce from home checking to expert checking for the British supply, following inspections that found aphids well past the outer leaves and into the head.\n\n**What to do**\n\nIn the UK, treat iceberg as you would romaine: separate the leaves and inspect each one, or use supervised pre-checked product. Elsewhere the existing guidance is unchanged.",
    severity: "advisory",
    region: "United Kingdom",
    publishedOffsetDays: -41,
    expiresOffsetDays: -3,
    produce: ["iceberg-lettuce"],
  },
];
