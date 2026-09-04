export const SITE_URL = "https://webrixo.vercel.app";
export const CONTACT_EMAIL = "hello@webrixo.com";

export const NAV = [
  { label: "Work", href: "#work" },
  { label: "Build with AI", href: "#ai" },
  { label: "Two ways", href: "#paths" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export type Project = {
  slug: string;
  name: string;
  sector: string;
  summary: string;
  href: string;
  tags: string[];
  /** Colours for the CSS-drawn preview frame */
  frame: {
    bg: string;
    ink: string;
    accent: string;
    accentInk?: string;
    serif?: boolean;
    title: string;
    sub: string;
    nav: string[];
    cta: string;
  };
};

export const PROJECTS: Project[] = [
  {
    slug: "brew",
    name: "Brew & Co.",
    sector: "Coffee roaster",
    summary: "A slow, editorial site for a small-batch roaster. Menu, roasting notes and a corner-window story that makes you want to visit.",
    href: "/demos/brew",
    tags: ["Design", "Build", "Copy"],
    frame: {
      bg: "#f6efe4",
      ink: "#2a2118",
      accent: "#c8873f",
      serif: true,
      title: "Coffee, made slowly.",
      sub: "Small-batch roasts from a corner shop with afternoon sun.",
      nav: ["Menu", "Roasts", "Visit"],
      cta: "Order beans",
    },
  },
  {
    slug: "pulse",
    name: "PulseFit",
    sector: "Gym",
    summary: "A high-energy site with a live class timetable and a membership flow that gets people through the door.",
    href: "/demos/pulse",
    tags: ["Design", "Build", "Brand"],
    frame: {
      bg: "#0b1410",
      ink: "#eef7f0",
      accent: "#4ade80",
      accentInk: "#062012",
      title: "Train like you mean it.",
      sub: "Classes every hour. No contracts. Cancel anytime.",
      nav: ["Classes", "Membership", "Trainers"],
      cta: "Join today",
    },
  },
  {
    slug: "saffron",
    name: "Saffron",
    sector: "Restaurant",
    summary: "An elegant seasonal-menu site with reservations built in, so the phone rings less and the tables fill more.",
    href: "/demos/saffron",
    tags: ["Design", "Build", "Content"],
    frame: {
      bg: "#1a0f0c",
      ink: "#f5e9dc",
      accent: "#d9a441",
      accentInk: "#1a0f0c",
      serif: true,
      title: "A table for the season.",
      sub: "Modern Indian cooking, five courses, one long evening.",
      nav: ["Menu", "Reserve", "Events"],
      cta: "Book a table",
    },
  },
  {
    slug: "taskly",
    name: "Taskly",
    sector: "Software",
    summary: "A clean product page for a to-do app: one promise, three screens, and a sign-up form that converts.",
    href: "/demos/taskly",
    tags: ["Design", "Build", "Landing page"],
    frame: {
      bg: "#0f0f1a",
      ink: "#eeeef8",
      accent: "#6d6dff",
      title: "Your day, in order.",
      sub: "Capture tasks in a second. Plan them in a minute.",
      nav: ["Product", "Pricing", "Docs"],
      cta: "Start free",
    },
  },
];

export const PROCESS = [
  {
    title: "Brief",
    body: "A 20-minute call. We ask what the site has to do for your business, look at what you have, and tell you plainly what we'd build and how long it takes.",
  },
  {
    title: "Design",
    body: "You see real pages, not wireframes. We design on your content and your brand, then adjust with you until it feels like yours.",
  },
  {
    title: "Build",
    body: "Fast, accessible and search-ready from day one. Every page is tested on phones, tablets and slow connections before you see it.",
  },
  {
    title: "Launch",
    body: "We deploy, connect your domain and analytics, and hand over a site you can edit. We stay around for the first month after launch.",
  },
];

export const VALUES = [
  {
    title: "Fast to load, fast to ship",
    body: "Sites that open in under a second on a phone, and projects that launch in weeks rather than quarters.",
  },
  {
    title: "Built for search",
    body: "Clean structure, real headings, descriptive links and metadata that search engines can actually read.",
  },
  {
    title: "Plain language",
    body: "No jargon in our proposals, our emails or your website. If a visitor can't understand it, it doesn't ship.",
  },
];

export const FAQ = [
  {
    q: "What kinds of websites do you build?",
    a: "Marketing sites for small businesses: cafés, gyms, restaurants, studios, clinics and early-stage software products. Most projects are two to eight pages with a contact or booking flow. If you need a full web app, ask; we'll tell you honestly whether we're the right fit.",
  },
  {
    q: "What's the difference between building with AI and building with a human?",
    a: "Building with AI generates a first version of your site in minutes from a short description, which you can then edit and publish. Building with a human means we design and build the site with you from scratch, which takes longer and costs more, but gives you a site that's specific to your business and made to convert.",
  },
  {
    q: "How long does a custom project take?",
    a: "Most custom sites launch two to four weeks after the brief. The biggest variable is how quickly you can send us content and feedback, so we'll tell you exactly what we need from you on day one.",
  },
  {
    q: "Will I be able to edit the site myself?",
    a: "Yes. Every site we hand over can be edited without touching code. We'll walk you through it on the launch call and record it so you can rewatch.",
  },
  {
    q: "Do you handle hosting and the domain?",
    a: "We set both up for you and connect your domain at launch. Hosting is in your name, so you're never locked in to us.",
  },
  {
    q: "What happens after launch?",
    a: "We stay available for the first month to fix anything and make small adjustments. After that, you can keep us on a light monthly retainer or just email when you need something.",
  },
];
