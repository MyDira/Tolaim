import type { RiskLevel } from "@/lib/risk";

/**
 * Cleaning methods.
 *
 * Hardcoded on purpose. These change rarely, they need to be reviewed as a set
 * rather than one at a time, and they carry a knowledge hierarchy that a
 * database row would not express well: some methods assume you have already
 * learned others.
 *
 * The hierarchy is advisory. Prerequisites are shown, ordering is obvious, and
 * a reader arriving at an advanced method is told what it builds on — but
 * nothing is locked. People arrive from a produce page mid-task and should not
 * hit a wall.
 */

export type MethodTier = "foundation" | "core" | "advanced";

export interface MethodStep {
  title: string;
  body: string;
  /** Optional diagram key, rendered by MethodIllustration. */
  figure?: FigureKey;
  caption?: string;
}

export type FigureKey = "insects" | "basin" | "lightbox" | "mesh" | "leaf" | "floret";

export interface CleaningMethod {
  slug: string;
  title: string;
  /** One line, shown under the title and in the index. */
  standfirst: string;
  tier: MethodTier;
  /** Slugs of methods this one assumes you already know. */
  prerequisites: string[];
  minutes: string;
  needs: string[];
  figure: FigureKey;
  steps: MethodStep[];
  /** Common mistakes. Printed with the method. */
  watchFor: string[];
  /** Which risk levels this method is the usual answer for. */
  servesLevels: RiskLevel[];
}

export const TIERS: { key: MethodTier; label: string; blurb: string }[] = [
  {
    key: "foundation",
    label: "Start here",
    blurb: "Two short pages that everything else assumes. Read them once and the rest makes sense.",
  },
  {
    key: "core",
    label: "The working methods",
    blurb: "What you will actually do at the sink. Each builds on the one before it.",
  },
  {
    key: "advanced",
    label: "Harder cases",
    blurb: "Dense heads, tight leaves and items where the method has to be learned in person first.",
  },
];

export const CLEANING_METHODS: CleaningMethod[] = [
  // -------------------------------------------------------------------------
  {
    slug: "know-the-insects",
    title: "Know what you are looking for",
    standfirst:
      "Three or four insects account for nearly everything you will find. Learning their size and colour is most of the skill.",
    tier: "foundation",
    prerequisites: [],
    minutes: "5 minutes to read",
    needs: ["Good light", "Patience the first few times"],
    figure: "insects",
    steps: [
      {
        title: "Thrips",
        body: "Slender, one to two millimetres long, and the colour of the leaf they are sitting on — pale yellow to light brown. They lie flat along a vein or in the white rib of a leaf and they do not move much. This is the one people miss, because it looks like part of the plant.",
        figure: "insects",
        caption: "Thrips at roughly life size against a leaf vein",
      },
      {
        title: "Aphids",
        body: "Rounder and slightly larger, one to three millimetres, green or black, often in clusters rather than alone. They gather where a leaf meets a stem and at the base of a floret. A cluster is easier to see than a single thrip, which is why aphids are the insect most people find first.",
      },
      {
        title: "Leaf miners",
        body: "You do not see the insect. You see its trail — a pale, winding line inside the leaf, as if someone drew on it with a fine pen. The larva is inside the leaf, between its two surfaces, so no amount of washing reaches it. A leaf with trails is discarded, not cleaned.",
      },
      {
        title: "Storage pests",
        body: "In dried goods: small beetles and moth larvae, plus fine webbing that holds grains or dried fruit together in clumps. The webbing is easier to spot than the insect and means the same thing.",
      },
      {
        title: "Calibrate your eye once",
        body: "Take a bunch of parsley you are not planning to use, wash it hard in soapy water, and pour the water through a white cloth. Look at what is on the cloth. Almost everyone is surprised the first time, and it recalibrates what you consider 'clean' for good.",
      },
    ],
    watchFor: [
      "Assuming a clean-looking leaf is clean. Thrips are the colour of the leaf and lie still.",
      "Confusing soil specks with insects. Soil rinses off; insects have legs and a definite outline.",
      "Treating leaf miner trails as damage to cut around. The insect is inside the leaf — the leaf goes.",
    ],
    servesLevels: [1, 2, 3],
  },

  // -------------------------------------------------------------------------
  {
    slug: "rinse-and-look",
    title: "Rinse and look",
    standfirst: "The baseline. Everything else on this site is a longer version of these two steps.",
    tier: "foundation",
    prerequisites: [],
    minutes: "1 minute per item",
    needs: ["Running water", "A colander", "A light-coloured surface"],
    figure: "basin",
    steps: [
      {
        title: "Rinse under running water",
        body: "Running water, not a standing bowl — you want what comes off to leave rather than settle back on the item. Turn the item over so every surface passes under the stream. For anything with a groove, a fold or a stem scar, aim the water into it and rub with your thumb.",
        figure: "basin",
        caption: "Rinse under a running stream, not in standing water",
      },
      {
        title: "Look at it in good light",
        body: "Put it on a light-coloured surface — a white plate or a pale board — and actually look. Ten seconds. You are checking for anything moving, anything that is a different colour from the item, and any hole, split or soft patch.",
      },
      {
        title: "Discard damage rather than cleaning it",
        body: "A split berry, a punctured apple, a soft patch on a pepper: cut it away or discard the item. Damaged flesh is where things get in, and cleaning the outside does nothing about what is already inside.",
      },
    ],
    watchFor: [
      "Rinsing in a filled bowl. Whatever comes off is still in the water and lands back on the item.",
      "Rinsing over a dark sink, where nothing that comes off is visible.",
      "Calling this an inspection. This is a rinse — for items at level 3 or above it is the beginning, not the end.",
    ],
    servesLevels: [4, 5],
  },

  // -------------------------------------------------------------------------
  {
    slug: "wash-and-agitate",
    title: "Wash and agitate",
    standfirst: "A soapy soak with real movement. This is what dislodges what a rinse leaves behind.",
    tier: "core",
    prerequisites: ["rinse-and-look"],
    minutes: "10 minutes for a bunch",
    needs: [
      "A large bowl or a clean sink",
      "Cold water",
      "A small amount of plain dish soap or vegetable wash",
      "A colander",
    ],
    figure: "basin",
    steps: [
      {
        title: "Take the item apart first",
        body: "Separate leaves from the head, sprigs from the bunch, florets from the stalk. Nothing gets cleaned while it is still held together — the water does not reach where the insects are, which is exactly where the plant is tightest.",
      },
      {
        title: "Make the water slippery, not foamy",
        body: "Cold water with a few drops of plain dish soap, or a vegetable wash used as directed. The soap is there to break the surface tension so insects let go; you are not trying to make suds. Too much soap makes the rinse-off longer without cleaning better.",
        figure: "basin",
        caption: "A few drops is enough — the water should feel slippery, not look foamy",
      },
      {
        title: "Soak, then agitate hard",
        body: "Two to three minutes in the water, then move it. Swirl with your hand, lift the leaves and drop them back, push them under. Agitation is the active ingredient — a still soak does very little. Do this for a good thirty seconds.",
      },
      {
        title: "Lift the produce out, do not pour it out",
        body: "Lift the leaves out of the water and into the colander. If you tip the bowl through the colander, everything you just dislodged pours over the produce on its way down.",
      },
      {
        title: "Rinse and repeat if the water was dirty",
        body: "Rinse the produce under running water. Then look at the water you poured away. If it was visibly dirty, do the whole thing again with fresh water. Two or three rounds on herbs is normal, not excessive.",
      },
    ],
    watchFor: [
      "Washing an intact head of lettuce or a tied bunch. Take it apart first or the wash is decorative.",
      "Soaking without agitating. The movement is what does the work.",
      "Pouring the bowl through the colander, which puts everything back on the produce.",
    ],
    servesLevels: [2, 3],
  },

  // -------------------------------------------------------------------------
  {
    slug: "filter-the-wash-water",
    title: "Filter the wash water",
    standfirst:
      "For items you cannot see into, the wash water is the evidence. Pour it through a cloth and read what it caught.",
    tier: "core",
    prerequisites: ["wash-and-agitate"],
    minutes: "5 minutes on top of the wash",
    needs: [
      "A white cloth, a coffee filter, or a fine mesh strainer",
      "A second clean bowl",
      "Good light over the sink",
    ],
    figure: "mesh",
    steps: [
      {
        title: "Set up before you wash",
        body: "Line a strainer with a white cloth or a paper coffee filter and set it over a second bowl. White matters — you are about to look for pale insects a millimetre across, and you will not see them on stainless mesh.",
        figure: "mesh",
        caption: "A white cloth in the strainer, over a second bowl",
      },
      {
        title: "Pour the used wash water through it",
        body: "After the soak and agitation, lift the produce out, then pour the water slowly through the lined strainer. Pour all of it, including the last inch at the bottom of the bowl, which is where the heaviest material has settled.",
      },
      {
        title: "Read the cloth",
        body: "Take the cloth to a window or a strong lamp and look across it. Soil is formless and rinses to a smear. Insects hold their outline: legs, a body, a definite edge. Tilt the cloth so the light rakes across it rather than shining straight through.",
      },
      {
        title: "Decide on the batch",
        body: "A clean cloth after two consecutive washes is the result you are looking for. If insects keep appearing after three rounds, the batch is not getting clean and it goes — that is a legitimate outcome and it is why this method is trusted.",
      },
    ],
    watchFor: [
      "Using a metal strainer alone. A one-millimetre insect on steel mesh is invisible.",
      "Pouring off only the top of the bowl and tipping the rest away.",
      "Treating one clean cloth as the finish. It is two consecutive clean rounds.",
    ],
    servesLevels: [1, 2],
  },

  // -------------------------------------------------------------------------
  {
    slug: "light-box-inspection",
    title: "Light-box inspection",
    standfirst: "Light from beneath turns a leaf translucent and makes what is on it and in it stand out.",
    tier: "core",
    prerequisites: ["know-the-insects", "rinse-and-look"],
    minutes: "15–30 minutes for a head of lettuce",
    needs: [
      "A light box, or a tablet showing a plain white screen",
      "A clean tea towel",
      "Somewhere to put checked and rejected leaves",
    ],
    figure: "lightbox",
    steps: [
      {
        title: "Make a light box if you do not have one",
        body: "A tablet or phone showing a blank white screen at full brightness, laid flat and covered with a sheet of clear plastic or cling film, works well. A window in daylight works too, holding the leaf up against it. What you need is light coming through the leaf, not light falling on it.",
        figure: "lightbox",
        caption: "Light passing through the leaf, not falling on it",
      },
      {
        title: "Wash first, inspect second",
        body: "Inspection comes after the wash, never instead of it. Washing removes most of what is there; inspection finds what the wash did not.",
      },
      {
        title: "Lay one leaf flat and look through it",
        body: "One leaf at a time, flattened out. Look through the leaf, not at it. Insects on either surface appear as opaque specks with a definite outline; leaf miner trails appear as pale winding channels within the leaf itself.",
      },
      {
        title: "Follow the ribs and the edges",
        body: "Work along the thick white rib first, then out along the veins, then round the edge. That is the order in which things hide. On romaine the rib is where thrips lodge, and it is also the part people skim past because it looks clean.",
      },
      {
        title: "Turn the leaf over",
        body: "Both sides. On most leaves the underside is the busier one, and a leaf checked on one side only has been half checked.",
      },
    ],
    watchFor: [
      "Lighting from above. It is the light passing through the leaf that reveals things.",
      "Checking a stack of leaves at once. One leaf, flat, at a time.",
      "Stopping at the first clean leaf. Infestation is uneven; a clean leaf says nothing about the next one.",
    ],
    servesLevels: [2, 3],
  },

  // -------------------------------------------------------------------------
  {
    slug: "leaf-by-leaf",
    title: "Leaf-by-leaf checking",
    standfirst:
      "The full procedure for leafy greens: take apart, wash, agitate, rinse, and inspect every leaf on both sides.",
    tier: "advanced",
    prerequisites: ["wash-and-agitate", "light-box-inspection"],
    minutes: "30–45 minutes for a head",
    needs: [
      "Everything from the wash and the light box",
      "Two trays — one for checked, one for rejected",
      "Uninterrupted time",
    ],
    figure: "leaf",
    steps: [
      {
        title: "Set up so you never mix checked with unchecked",
        body: "Two trays, physically apart, and a fixed direction of travel: unchecked on the left, light box in the middle, checked on the right. Almost every failure of this method is a leaf that got put back in the wrong pile.",
        figure: "leaf",
        caption: "Unchecked, inspection, checked — one direction, no crossing back",
      },
      {
        title: "Take the head completely apart",
        body: "Every leaf separated down to the core. Cut the base off and let the leaves fall away. Anything still attached has not been checked, however clean the outside looks.",
      },
      {
        title: "Wash and agitate the whole batch",
        body: "Follow the wash method in full: soapy cold water, two to three minutes, hard agitation, lift out, rinse under running water. Repeat if the water came away dirty.",
      },
      {
        title: "Inspect every leaf, both sides",
        body: "One leaf at a time on the light box. Rib, veins, edge, then turn it over and repeat. A leaf you are unsure about goes in the rejected tray — the whole point of having two trays is that you never have to decide under pressure.",
      },
      {
        title: "Know when to stop and reject the batch",
        body: "If you are finding insects on most leaves after a full wash, the head is not going to come clean. Stop. Rejecting a head is a normal outcome and it costs less than the alternative.",
      },
    ],
    watchFor: [
      "Working while distracted. This method fails through attention, not technique.",
      "Letting a checked leaf touch an unchecked one.",
      "Doing three heads in a row. Accuracy falls off; do one, take a break.",
    ],
    servesLevels: [2],
  },

  // -------------------------------------------------------------------------
  {
    slug: "dense-heads-and-florets",
    title: "Dense heads and florets",
    standfirst:
      "Broccoli, cauliflower and anything else you cannot see into. The wash water is the check, because inspection is not possible.",
    tier: "advanced",
    prerequisites: ["filter-the-wash-water", "light-box-inspection"],
    minutes: "30 minutes plus soaking",
    needs: [
      "A sharp knife",
      "Warm water and vegetable wash",
      "A white cloth or coffee filter and a strainer",
      "Strong light",
    ],
    figure: "floret",
    steps: [
      {
        title: "Understand what makes these different",
        body: "A head of cauliflower cannot be inspected. The florets close over the interior and no light or line of sight reaches inside. So the check moves: instead of looking at the vegetable, you drive whatever is inside it out into water and look at the water. If you are not confident doing that, supervised frozen product is checked before freezing and is the ordinary answer for a home kitchen.",
        figure: "floret",
        caption: "The interior of a floret head cannot be seen into — the check moves to the water",
      },
      {
        title: "Cut into small florets",
        body: "Smaller than feels necessary — two or three centimetres. You are cutting in order to open the interior to the water, not to portion the vegetable. Cut down through the stem so each floret falls open.",
      },
      {
        title: "Soak in warm water, not cold",
        body: "Warm water with vegetable wash, for a good ten to fifteen minutes. Warm matters here: it makes insects release their hold and leave, which cold water does not do reliably in a dense head.",
      },
      {
        title: "Agitate, lift out, and filter the water",
        body: "Agitate hard for thirty seconds. Lift the florets out. Pour the water through a white cloth in a strainer, all of it including the bottom of the bowl. Read the cloth under strong light.",
      },
      {
        title: "Repeat until two rounds come back clean",
        body: "Fresh water each time. Two consecutive clean cloths is the finish. If the third round is still producing insects, discard the head.",
      },
      {
        title: "Artichokes are not in this category",
        body: "Globe artichokes are tighter again, and the bracts overlap so closely that neither water nor light gets between them. Most authorities do not accept any home method for fresh whole artichokes — check the item page rather than adapting this method to them.",
      },
    ],
    watchFor: [
      "Cold water. In a dense head it does not persuade anything to leave.",
      "Florets cut too large, leaving the interior sealed.",
      "One clean cloth. It is two consecutive rounds, with fresh water each time.",
    ],
    servesLevels: [1, 2],
  },
];

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getMethod(slug: string): CleaningMethod | undefined {
  return CLEANING_METHODS.find((m) => m.slug === slug);
}

export function methodsByTier(tier: MethodTier): CleaningMethod[] {
  return CLEANING_METHODS.filter((m) => m.tier === tier);
}

/** Methods that list `slug` as a prerequisite — "what this unlocks". */
export function methodsBuildingOn(slug: string): CleaningMethod[] {
  return CLEANING_METHODS.filter((m) => m.prerequisites.includes(slug));
}

/**
 * The method to point at from a produce page. Category first, because the
 * shape of the vegetable decides the technique more than the level does.
 */
export function suggestedMethodFor(level: RiskLevel | null, categorySlug: string | null): CleaningMethod | undefined {
  if (level === null) return undefined;

  if (level >= 4) return getMethod("rinse-and-look");

  switch (categorySlug) {
    case "cruciferous":
      return getMethod("dense-heads-and-florets");
    case "leafy-greens":
      return getMethod("leaf-by-leaf");
    case "herbs":
      return getMethod("filter-the-wash-water");
    default:
      return level <= 2 ? getMethod("light-box-inspection") : getMethod("wash-and-agitate");
  }
}
