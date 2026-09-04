/**
 * Local fallback for the AI builder.
 *
 * When no model key is configured — the offline preview, or a deployment before
 * ANTHROPIC_API_KEY is set — the builder still has to produce something usable,
 * or the whole "build it yourself" path is a dead button. This reads the brief
 * for the same signals the quote builder uses and assembles a sensible plan
 * from templates.
 *
 * It is honestly labelled in the UI as the offline generator, never passed off
 * as the model's work.
 */

export type PlanItem = { title: string; body: string; meta?: string };
export type PlanSection = { kind: "features" | "list" | "hours" | "steps" | "quote" | "contact"; title: string; items: PlanItem[] };
export type SitePlan = {
  name: string;
  tagline: string;
  about: string;
  palette: "warm" | "fresh" | "deep" | "cool" | "mono";
  nav: string[];
  cta: string;
  sections: PlanSection[];
  footnote: string;
};

type Kind = "cafe" | "gym" | "restaurant" | "salon" | "clinic" | "shop" | "software" | "studio" | "generic";

const RULES: [Kind, RegExp][] = [
  ["cafe", /\b(caf[eé]|coffee|roaster|bakery|espresso|tea ?room|patisserie)\b/i],
  ["gym", /\b(gym|fitness|yoga|pilates|crossfit|studio class|training|workout|martial arts|dance)\b/i],
  ["restaurant", /\b(restaurant|dine|dining|kitchen|bistro|eatery|food|chef|cuisine|thali|bar)\b/i],
  ["salon", /\b(salon|barber|hair|spa|beauty|nails|grooming)\b/i],
  ["clinic", /\b(clinic|dental|dentist|doctor|physio|therapy|therapist|medical|wellness centre|vet)\b/i],
  ["shop", /\b(shop|store|boutique|retail|sell|products|handmade|crafts)\b/i],
  ["software", /\b(app|software|saas|platform|product|startup|tool|dashboard|api)\b/i],
  ["studio", /\b(studio|agency|photograph|design|architect|consult|freelance|practice)\b/i],
];

const PALETTE: Record<Kind, SitePlan["palette"]> = {
  cafe: "warm", gym: "fresh", restaurant: "deep", salon: "warm",
  clinic: "cool", shop: "warm", software: "cool", studio: "mono", generic: "mono",
};

function titleCase(s: string) {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

/** Pulls a plausible business name: a quoted name, "called X", or the place. */
function guessName(brief: string, kind: Kind): string {
  const quoted = brief.match(/["“']([A-Z][\w& '-]{2,30})["”']/);
  if (quoted) return quoted[1];
  const called = brief.match(/\b(?:called|named)\s+([A-Z][\w& '-]{2,30})/);
  if (called) return called[1].trim();
  const place = brief.match(/\bin\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
  const defaults: Record<Kind, string> = {
    cafe: "The Corner Roastery", gym: "Groundwork", restaurant: "The Long Table",
    salon: "Parlour", clinic: "Meridian Care", shop: "The Small Shop",
    software: "Nimbus", studio: "Practice", generic: "Your Business",
  };
  return place ? `${defaults[kind].split(" ")[0]} ${place[1]}` : defaults[kind];
}

const COPY: Record<Kind, { tagline: string; about: string; cta: string; nav: string[]; sections: PlanSection[] }> = {
  cafe: {
    tagline: "Good coffee, made slowly, on your corner.",
    about: "We roast in small batches and sell it before it sits around. The room has eleven seats and afternoon sun.",
    cta: "See the menu",
    nav: ["Menu", "Beans", "Visit"],
    sections: [
      { kind: "list", title: "On the bar", items: [
        { title: "Espresso", body: "Double shot, house blend", meta: "₹180" },
        { title: "Flat white", body: "Velvety, not too hot", meta: "₹240" },
        { title: "Pour over", body: "Rotating single origin", meta: "₹280" },
        { title: "Cold brew", body: "Steeped overnight", meta: "₹260" },
      ] },
      { kind: "hours", title: "When we're open", items: [
        { title: "Monday", body: "Closed" },
        { title: "Tuesday to Friday", body: "7:00 — 18:00" },
        { title: "Weekends", body: "8:00 — 19:00" },
      ] },
      { kind: "contact", title: "Come and sit down", items: [
        { title: "Find us", body: "Tell people where you are and how to get in touch." },
      ] },
    ],
  },
  gym: {
    tagline: "Train properly, without the contract.",
    about: "Small classes, real coaching, and nobody watching you in the mirror. Cancel any month you like.",
    cta: "Book a class",
    nav: ["Classes", "Pricing", "Coaches"],
    sections: [
      { kind: "list", title: "This week", items: [
        { title: "Sunrise conditioning", body: "45 minutes, all levels", meta: "6:00" },
        { title: "Strength", body: "Barbell basics, coached", meta: "18:30" },
        { title: "Mobility", body: "Slow, useful, unglamorous", meta: "20:00" },
      ] },
      { kind: "features", title: "How it works", items: [
        { title: "First class free", body: "Turn up, borrow a mat, see if you like it." },
        { title: "No contract", body: "Pay monthly, pause whenever you need to." },
        { title: "Small groups", body: "Twelve people maximum, so you get corrected." },
      ] },
      { kind: "contact", title: "Start this week", items: [{ title: "Get in touch", body: "Say hello and we'll book you in." }] },
    ],
  },
  restaurant: {
    tagline: "A short menu, cooked properly, every evening.",
    about: "The menu changes when the market does. We keep it small so everything on it is worth ordering.",
    cta: "Book a table",
    nav: ["Menu", "Reserve", "The room"],
    sections: [
      { kind: "list", title: "This season", items: [
        { title: "To start", body: "Something sharp to wake the palate" },
        { title: "The middle", body: "Two plates, one from the fire" },
        { title: "To finish", body: "Sweet, small, not heavy" },
      ] },
      { kind: "hours", title: "Dinner", items: [
        { title: "Tuesday to Sunday", body: "From 18:30" },
        { title: "Monday", body: "Closed" },
      ] },
      { kind: "contact", title: "Reserve a table", items: [{ title: "Bookings", body: "Tables open thirty days ahead." }] },
    ],
  },
  salon: {
    tagline: "A proper cut, without the hard sell.",
    about: "We book enough time to do it well and talk you out of anything that won't suit you.",
    cta: "Book an appointment",
    nav: ["Services", "Prices", "Visit"],
    sections: [
      { kind: "list", title: "What we do", items: [
        { title: "Cut and finish", body: "Consultation, wash, cut", meta: "₹900" },
        { title: "Colour", body: "Half or full head", meta: "from ₹2,400" },
        { title: "Beard trim", body: "Shape and hot towel", meta: "₹450" },
      ] },
      { kind: "features", title: "Good to know", items: [
        { title: "Walk-ins welcome", body: "If we're free, we'll take you." },
        { title: "No upselling", body: "We won't sell you products you don't need." },
      ] },
      { kind: "contact", title: "Book in", items: [{ title: "Get in touch", body: "Call, message, or use the form." }] },
    ],
  },
  clinic: {
    tagline: "Careful, unhurried care, close to home.",
    about: "Appointments run to time and you see the same person each visit. Nothing is done without explaining it first.",
    cta: "Book an appointment",
    nav: ["Treatments", "Team", "Visit"],
    sections: [
      { kind: "list", title: "What we treat", items: [
        { title: "First consultation", body: "Forty minutes, no rush", meta: "₹800" },
        { title: "Follow-up", body: "Twenty-five minutes", meta: "₹500" },
        { title: "Emergency slot", body: "Held daily for urgent cases" },
      ] },
      { kind: "features", title: "How we work", items: [
        { title: "On time", body: "We book realistically, so you're seen when you're told." },
        { title: "Clear pricing", body: "You know the cost before anything begins." },
      ] },
      { kind: "contact", title: "Get in touch", items: [{ title: "Appointments", body: "Call or use the form and we'll ring back." }] },
    ],
  },
  shop: {
    tagline: "A small shop with a short, good list.",
    about: "We stock what we'd use ourselves and can tell you where each thing came from.",
    cta: "See what's in",
    nav: ["Shop", "About", "Visit"],
    sections: [
      { kind: "features", title: "What we stock", items: [
        { title: "Made nearby", body: "Most of it comes from within a day's drive." },
        { title: "Small runs", body: "When it's gone it's usually gone." },
        { title: "Try before you buy", body: "Come in and handle it." },
      ] },
      { kind: "hours", title: "Opening", items: [
        { title: "Weekdays", body: "10:00 — 19:00" },
        { title: "Sunday", body: "11:00 — 17:00" },
      ] },
      { kind: "contact", title: "Ask us anything", items: [{ title: "Get in touch", body: "We answer messages ourselves." }] },
    ],
  },
  software: {
    tagline: "One job, done properly, out of your way.",
    about: "It does the thing you came for and then leaves you alone. No workspace to set up, no onboarding to sit through.",
    cta: "Start free",
    nav: ["Product", "Pricing", "Docs"],
    sections: [
      { kind: "features", title: "What it does", items: [
        { title: "Fast to start", body: "Working in under a minute, no card." },
        { title: "Works offline", body: "Syncs when you're back on a connection." },
        { title: "Yours to leave", body: "Export everything whenever you like." },
      ] },
      { kind: "steps", title: "How it works", items: [
        { title: "Sign up", body: "Email and a password, that's it." },
        { title: "Bring your data", body: "Import or start clean." },
        { title: "Get on with it", body: "We stay out of the way." },
      ] },
      { kind: "contact", title: "Try it", items: [{ title: "Start free", body: "One project free forever." }] },
    ],
  },
  studio: {
    tagline: "Considered work, done by the person you hired.",
    about: "Small practice, few projects at a time, and you deal with whoever is doing the work.",
    cta: "Start a project",
    nav: ["Work", "Process", "Contact"],
    sections: [
      { kind: "steps", title: "How we work", items: [
        { title: "Talk", body: "Twenty minutes to work out if we fit." },
        { title: "Make", body: "You see real work, early and often." },
        { title: "Hand over", body: "Everything is yours at the end." },
      ] },
      { kind: "features", title: "What you get", items: [
        { title: "One point of contact", body: "No account manager in between." },
        { title: "Fixed quote", body: "Agreed before anything starts." },
      ] },
      { kind: "contact", title: "Get in touch", items: [{ title: "Say hello", body: "Tell us what you're trying to do." }] },
    ],
  },
  generic: {
    tagline: "Say what you do, in one clear line.",
    about: "This is where you tell people who you are and why they should care, in two sentences without buzzwords.",
    cta: "Get in touch",
    nav: ["About", "What we do", "Contact"],
    sections: [
      { kind: "features", title: "What we do", items: [
        { title: "The main thing", body: "The one thing you want to be known for." },
        { title: "The second thing", body: "Useful, but not the headline." },
        { title: "The reassurance", body: "Whatever makes people trust you." },
      ] },
      { kind: "contact", title: "Get in touch", items: [{ title: "Say hello", body: "Tell people the fastest way to reach you." }] },
    ],
  },
};

export function detectKind(brief: string): Kind {
  for (const [kind, test] of RULES) if (test.test(brief)) return kind;
  return "generic";
}

export function generateLocally(brief: string): SitePlan {
  const kind = detectKind(brief);
  const base = COPY[kind];
  const name = guessName(brief, kind);
  const place = brief.match(/\bin\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/)?.[1];

  const sections = base.sections.map(s => ({ ...s, items: s.items.map(i => ({ ...i })) }));
  if (place) {
    const contact = sections.find(s => s.kind === "contact");
    if (contact) contact.items[0].body = `${contact.items[0].body} We're in ${place}.`;
  }

  return {
    name: titleCase(name),
    tagline: base.tagline,
    about: base.about,
    palette: PALETTE[kind],
    nav: base.nav,
    cta: base.cta,
    sections,
    footnote: "A first version. Edit anything that isn't right.",
  };
}
