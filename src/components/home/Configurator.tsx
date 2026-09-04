import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { backendConfigured } from "@/lib/backend";
import { convert, CURRENCIES, format, type CurrencyCode } from "@/lib/region";
import { Checkout } from "./Checkout";
import { Fade, Words, Magnetic, useInView } from "./motion";

const ease = [0.16, 1, 0.3, 1] as const;
const Arrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

/**
 * Tell us what you need, in your own words.
 *
 * A checklist makes people choose from our vocabulary. Most business owners
 * don't think in "pages" and "add-ons" — they think "I need people to book a
 * table". So this reads what they wrote, works out what it implies, and prices
 * that. Whatever it picks up is shown back to them and can be corrected, so it
 * is never a black box guessing at their money.
 */

const BASE_INR = 18000;
const PAGE_INR = 9000;
const DEPOSIT_SHARE = 0.3;

type Signal = { id: string; label: string; inr: number; perPage?: boolean; why: string };

const SIGNALS: { s: Signal; test: RegExp }[] = [
  { s: { id: "booking", label: "Bookings or reservations", inr: 14000, why: "you mentioned booking" }, test: /\b(book(ing|ings)?|reserv\w*|appointment|table|slot|schedul\w*|timetable|class(es)?)\b/i },
  { s: { id: "shop", label: "Simple online ordering", inr: 22000, why: "you mentioned selling" }, test: /\b(shop|sell|selling|order(s|ing)?|checkout|cart|product(s)?|ecommerce|e-commerce|store|payment(s)?|deliver(y|ies))\b/i },
  { s: { id: "menu", label: "Menu or price list", inr: 6000, why: "you mentioned a menu" }, test: /\b(menu|dishes|price list|pricing page|tariff|catalogue|catalog)\b/i },
  { s: { id: "gallery", label: "Photo gallery", inr: 5000, why: "you mentioned photos" }, test: /\b(gallery|galleries|photos?|portfolio|images?|pictures?|look ?book)\b/i },
  { s: { id: "blog", label: "Blog or updates", inr: 9000, why: "you mentioned writing posts" }, test: /\b(blog|news|articles?|posts?|updates?|journal|recipes?)\b/i },
  { s: { id: "copy", label: "Copywriting", inr: 4000, perPage: true, why: "you mentioned needing the words" }, test: /\b(copy|copywriting|words|writing|content|text|describe us|say what)\b/i },
  { s: { id: "brand", label: "Brand basics", inr: 16000, why: "you mentioned starting from nothing" }, test: /\b(logo|brand(ing)?|identity|colou?rs|from scratch|starting (out|fresh|from nothing)|new business|just started)\b/i },
  { s: { id: "migrate", label: "Move your old site", inr: 8000, why: "you mentioned an existing site" }, test: /\b(old site|existing site|current site|wordpress|wix|squarespace|godaddy|redesign|rebuild|migrat\w*|move (it|our|my) site)\b/i },
  { s: { id: "seo", label: "Search setup", inr: 6000, why: "you mentioned being found" }, test: /\b(seo|search|google|found|ranking|traffic|visible|discover\w*|near me)\b/i },
  { s: { id: "multi", label: "Second language", inr: 12000, why: "you mentioned another language" }, test: /\b(hindi|marathi|bilingual|two languages|multi-?lingual|translat\w*|regional language)\b/i },
];

/** Words people use for pages, so "home, about and a contact page" counts as three. */
const PAGE_WORDS = /\b(home ?page|home|about|contact|services?|menu|team|teachers?|staff|trainers?|pricing|prices?|rates?|gallery|photos?|faq|testimonials?|reviews?|location|visit|hours|classes|timetable|treatments|rooms|shop|blog|story)\b/gi;
const WRITTEN = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 } as const;

function readBrief(text: string) {
  const t = text.trim();
  if (t.length < 12) return null;

  // Explicit counts win: "about 5 pages", "six pages".
  let pages = 0;
  const digit = t.match(/\b(\d{1,2})\s*(?:-|\s)?\s*pages?\b/i);
  if (digit) pages = Number(digit[1]);
  if (!pages) {
    const word = t.match(new RegExp(`\\b(${Object.keys(WRITTEN).join("|")})\\s+pages?\\b`, "i"));
    if (word) pages = WRITTEN[word[1].toLowerCase() as keyof typeof WRITTEN];
  }
  // Otherwise count the page names they actually listed.
  if (!pages) {
    const named = new Set((t.match(PAGE_WORDS) ?? []).map(w => w.toLowerCase()));
    pages = named.size;
  }
  pages = Math.min(14, Math.max(1, pages || 4));

  const found = SIGNALS.filter(({ test }) => test.test(t)).map(({ s }) => s);
  const urgent = /\b(urgent|asap|this week|next week|quickly|soon|deadline|launch(ing)? (in|on)|opening)\b/i.test(t);

  // A brief asking for several distinct things is never a two-page site, even
  // if they only happened to name two pages out loud.
  if (!digit && found.length >= 2) pages = Math.max(pages, 4);

  return { pages, found, urgent, guessedPages: !digit };
}

export default function Configurator({ code }: { code: CurrencyCode }) {
  const ref = useInView<HTMLDivElement>("-15% 0px");
  const submitInquiry = useMutation(api.inquiries.submit);

  const [brief, setBrief] = useState("");
  const [pages, setPages] = useState<number | null>(null);   // set only if the visitor overrides
  const [removed, setRemoved] = useState<string[]>([]);
  const [added, setAdded] = useState<Signal[]>([]);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [offer, setOffer] = useState("");

  const read = useMemo(() => readBrief(brief), [brief]);

  // A new brief starts a fresh reading.
  useEffect(() => { setRemoved([]); setAdded([]); setPages(null); }, [brief.length < 12]);

  const items = useMemo(() => {
    if (!read) return [];
    const base = read.found.filter(f => !removed.includes(f.id));
    const extra = added.filter(a => !base.some(b => b.id === a.id));
    return [...base, ...extra];
  }, [read, removed, added]);

  const pageCount = pages ?? read?.pages ?? 4;

  const { buildInr, depositInr, lines, weeks } = useMemo(() => {
    const rows = [{ label: `Design and build · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`, inr: BASE_INR + (pageCount - 1) * PAGE_INR }];
    for (const it of items) rows.push({ label: it.perPage ? `${it.label} · ${pageCount} pages` : it.label, inr: it.perPage ? it.inr * pageCount : it.inr });
    const total = rows.reduce((s, r) => s + r.inr, 0);
    const heavy = items.filter(i => ["booking", "shop", "brand", "multi"].includes(i.id)).length;
    const w = Math.min(9, Math.max(2, Math.ceil(pageCount / 3) + heavy));
    return { buildInr: total, depositInr: Math.round((total * DEPOSIT_SHARE) / 500) * 500, lines: rows, weeks: w };
  }, [items, pageCount]);

  const unused = SIGNALS.map(x => x.s).filter(s => !items.some(i => i.id === s.id));

  /**
   * What they're willing to pay.
   *
   * Deliberately NOT judged here. A generated verdict would be the site
   * accepting or refusing money on the studio's behalf, on a number it can't
   * see the context for — a slow month, an interesting brief, a client worth
   * having at a loss. The number is recorded, the visitor is told a person
   * will answer, and the decision stays with the owner.
   */
  const offerNum = Number(offer.replace(/[^\d.]/g, ""));
  const offerInr = offerNum > 0 ? offerNum / (CURRENCIES[code]?.rate ?? 1) : 0;

  const total = convert(buildInr, code);
  const deposit = convert(depositInr, code);

  async function sendBrief(e: FormEvent) {
    e.preventDefault();
    setError(""); setSending(true);
    try {
      const summary = `Brief from the quote builder\n\n${brief}\n\n— Read as: ${pageCount} pages` +
        (items.length ? `, plus ${items.map(i => i.label.toLowerCase()).join(", ")}` : "") +
        `\n— Indicative total: ${total.display} (${code})` +
        (offerNum
          ? `\n— THEY NAMED A PRICE: ${format(offerNum, code)} (estimate was ${total.display}, ` +
            `${Math.round((offerInr / buildInr) * 100)}% of it). Needs your decision.`
          : "");
      if (backendConfigured) {
        await submitInquiry({ name: email.split("@")[0] || "Website enquiry", email: email.trim(), message: summary, mode: "human", page: "/#build" });
      } else {
        await new Promise(r => setTimeout(r, 600));
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send that. Email hello@webrixo.com instead.");
    } finally { setSending(false); }
  }

  return (
    <div ref={ref} className="wx-conf">
      {/* Left: the brief */}
      <div className="wx-conf__controls">
        <div className="wx-conf__block">
          <label className="wx-h3" htmlFor="brief">Tell us what you need</label>
          <p className="wx-small">
            Plain words are fine. What the business is, what the site has to do, anything you already have.
            The estimate updates as you type.
          </p>
          <textarea
            id="brief"
            className="wx-brief"
            rows={7}
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder="We're a yoga studio in Thane opening in March. We need people to book classes online, a page about the teachers and one with prices. We have photos but no logo yet, and nothing written."
          />
          <div className="wx-brief__foot">
            <span className="wx-small">{brief.trim().length < 12 ? "Keep going — a sentence or two is enough." : `${brief.trim().split(/\s+/).length} words`}</span>
            {!brief && (
              <button className="wx-brief__try" onClick={() => setBrief("We run a small café in Bandra. We want people to find us on Google, see the menu, and know when we're open. We have an old site from 2016 that we hate, and nobody has written anything new.")}>
                Try an example
              </button>
            )}
          </div>
        </div>

        {/* What we read from it */}
        <AnimatePresence>
          {read && (
            <motion.div className="wx-conf__block" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease }}>
              <h3 className="wx-h3">Here's what we read from that</h3>
              <p className="wx-small">If we've got something wrong, take it off. If we missed something, add it.</p>

              <div className="wx-read">
                <div className="wx-read__pages">
                  <span className="wx-small">Pages</span>
                  <div className="wx-read__stepper">
                    <button onClick={() => setPages(Math.max(1, pageCount - 1))} aria-label="One page fewer">−</button>
                    <b className="wx-num">{pageCount}</b>
                    <button onClick={() => setPages(Math.min(14, pageCount + 1))} aria-label="One page more">+</button>
                  </div>
                  {read.guessedPages && pages === null && <span className="wx-small wx-read__guess">counted from what you listed</span>}
                </div>

                <div className="wx-read__chips">
                  {items.map(it => (
                    <motion.button key={it.id} className="wx-chip is-on" layout
                      initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                      onClick={() => { setRemoved(r => [...r, it.id]); setAdded(a => a.filter(x => x.id !== it.id)); }}>
                      {it.label}
                      <i aria-hidden="true">×</i>
                      <em>{it.why}</em>
                    </motion.button>
                  ))}
                  {items.length === 0 && <p className="wx-small">Nothing beyond the pages themselves — that's a clean, simple build.</p>}
                </div>

                {unused.length > 0 && (
                  <div className="wx-read__add">
                    <span className="wx-small">Missing something?</span>
                    <div className="wx-read__chips">
                      {unused.slice(0, 5).map(s => (
                        <button key={s.id} className="wx-chip" onClick={() => { setAdded(a => [...a, s]); setRemoved(r => r.filter(x => x !== s.id)); }}>
                          + {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {read.urgent && <p className="wx-read__flag">You mentioned a deadline — say the date in your message and we'll tell you straight away whether it's possible.</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: the quote */}
      <div className="wx-conf__quote">
        <div className="wx-conf__sticky">
          {!read ? (
            <div className="wx-conf__empty">
              <p className="wx-small">Your estimate</p>
              <div className="wx-conf__total wx-conf__total--idle">—</div>
              <p className="wx-small">Start describing the project and a real number appears here. No email needed to see it.</p>
            </div>
          ) : sent ? (
            <div className="wx-conf__empty">
              <p className="wx-small">Brief sent</p>
              <div className="wx-conf__total">Thanks.</div>
              <p className="wx-small">We've got your brief and the estimate you were shown. You'll hear back within one business day with a fixed quote.</p>
            </div>
          ) : (
            <>
              <p className="wx-small">Your estimate</p>
              <div className="wx-conf__total" key={total.display}>{total.display}</div>
              <p className="wx-small wx-conf__weeks">Roughly {weeks} {weeks === 1 ? "week" : "weeks"} from brief to launch.</p>
              <ul className="wx-conf__lines">
                {lines.map(l => (
                  <li key={l.label}><span>{l.label}</span><span className="wx-num">{convert(l.inr, code).display}</span></li>
                ))}
              </ul>
              <div className="wx-offer">
                <label className="wx-small" htmlFor="offer">What's your budget?</label>
                <div className="wx-offer__row">
                  <span>{CURRENCIES[code]?.symbol ?? ""}</span>
                  <input
                    id="offer" inputMode="numeric" value={offer}
                    onChange={e => setOffer(e.target.value)}
                    placeholder={String(Math.round(buildInr * (CURRENCIES[code]?.rate ?? 1)))}
                  />
                </div>
                <p className="wx-small">Name your own number. Nothing here decides whether it's accepted — a person reads it.</p>
                <AnimatePresence>
                  {offerNum > 0 && (
                    <motion.div className="wx-offer__verdict"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }}>
                      <b>Noted — {format(offerNum, code)}.</b>
                      <span>
                        Send the brief and the owner reads it against what you've described, then replies within one
                        business day: yes, or a smaller scope that fits. If it's well under, you'll be told plainly
                        rather than quietly having the work padded.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form className="wx-conf__foot" onSubmit={sendBrief}>
                <div className="wx-field">
                  <label htmlFor="brief-email">Send this brief to us</label>
                  <input id="brief-email" type="email" required placeholder="you@yourbusiness.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                {error && <p className="wx-form__status is-error" role="alert">{error}</p>}
                <button type="submit" className="wx-btn wx-btn--copper" disabled={sending}>
                  {sending ? "Sending" : offerNum > 0 ? "Send this for approval" : "Get a fixed quote"} <Arrow />
                </button>
                {offerNum > 0 ? (
                  <p className="wx-small">
                    Nothing is charged now. Once your number is agreed you'll get a payment link for the deposit.
                  </p>
                ) : (
                  <button type="button" className="wx-conf__pay" onClick={() => setOpen(true)}>
                    Or book it now with a {deposit.display} deposit
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>

      <Fade as="p" className="wx-small wx-conf__note" delay={120}>
        This estimate is read from your own words, so treat it as a starting point rather than a contract. Send the
        brief and you get a fixed quote from a person — and if the job turns out bigger than this, we say so before
        starting rather than invoicing you for it later.
      </Fade>

      <AnimatePresence>
        {open && (
          <Checkout
            plan="custom"
            planName={`your ${pageCount}-page build`}
            baseInr={buildInr}
            depositInr={depositInr}
            code={code}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
