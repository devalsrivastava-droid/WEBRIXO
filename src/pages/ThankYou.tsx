import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Mark } from "@/components/home/Chrome";
import { PROJECTS } from "@/components/home/data";
import ProjectFrame from "@/components/home/ProjectFrame";
import { format, type CurrencyCode } from "@/lib/region";
import "@/styles/home.css";

const ease = [0.16, 1, 0.3, 1] as const;

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  studio: "Studio",
  care: "Care",
};

export default function ThankYou() {
  const [params] = useSearchParams();
  const orderId = params.get("order");
  const { isAuthenticated } = useAuth();

  usePageMeta({
    title: "Thanks — we've got it | WEBRIXO",
    description: "Your request is in. We reply within one business day.",
    path: "/thank-you",
  });

  const order = useQuery(api.orders.publicStatus, orderId ? { orderId } : "skip");
  const claim = useMutation(api.orders.claim);
  const [claimed, setClaimed] = useState(false);

  // If they're signed in, attach the order so it shows in their account.
  useEffect(() => {
    if (!orderId || !isAuthenticated || claimed) return;
    claim({ orderId }).then(() => setClaimed(true)).catch(() => { /* not critical */ });
  }, [orderId, isAuthenticated, claim, claimed]);

  // A card payment can take a few seconds to confirm, so keep looking.
  const [waited, setWaited] = useState(0);
  useEffect(() => {
    if (!orderId || order?.status === "paid") return;
    const t = setTimeout(() => setWaited(w => w + 1), 3000);
    return () => clearTimeout(t);
  }, [orderId, order?.status, waited]);

  const paid = order?.status === "paid";
  const pending = Boolean(orderId) && !paid;

  return (
    <div className="wx wx-thanks">
      <header className="wx-auth__bar">
        <Link to="/" className="wx-brand" aria-label="WEBRIXO home"><Mark /><span>WEBRIXO</span></Link>
        <Link to="/" className="wx-btn wx-btn--ghost wx-btn--sm">Back to site</Link>
      </header>

      <main className="wx-thanks__grid" id="main">
        <motion.section className="wx-thanks__panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
          <motion.span className="wx-thanks__mark" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1, ease }} aria-hidden="true">
            <Mark />
          </motion.span>

          <h1 className="wx-h2">{paid ? "Payment received." : orderId ? "Almost there." : "Request sent."}</h1>

          {paid && order && (
            <p className="wx-body">
              We've taken your {format(order.minorAmount / 100, order.currency as CurrencyCode)} deposit for {PLAN_NAMES[order.plan] ?? "your project"} and
              emailed the receipt. We'll be in touch within one business day to book the first call.
            </p>
          )}
          {pending && (
            <p className="wx-body">
              Your payment is still confirming with the bank. This usually takes a few seconds, and the receipt lands in your inbox either way.
              You can close this page safely — nothing is lost.
            </p>
          )}
          {!orderId && (
            <p className="wx-body">
              Thanks for writing. We read every message ourselves and reply within one business day, usually sooner.
            </p>
          )}

          <ol className="wx-thanks__next">
            <li><b>Today</b><span>We read your request and check we're the right fit.</span></li>
            <li><b>Within one business day</b><span>A reply from a person, with next steps and a fixed quote.</span></li>
            <li><b>The week after</b><span>A twenty-minute call, then design starts.</span></li>
          </ol>

          <div className="wx-thanks__actions">
            <Link to="/" className="wx-btn wx-btn--copper">Back to the site</Link>
            <Link to={PROJECTS[0].href} className="wx-btn wx-btn--ghost">Look at the demos</Link>
          </div>

          <p className="wx-small">
            Something wrong, or need an invoice instead? Email <a className="wx-link" href="mailto:hello@webrixo.com">hello@webrixo.com</a>.
          </p>
        </motion.section>

        <aside className="wx-thanks__visual" aria-hidden="true">
          <div className="wx-auth__glow" />
          <div className="wx-auth__col">
            <div className="wx-auth__track">
              {[...PROJECTS, ...PROJECTS].map((p, i) => (
                <div key={i} className="wx-auth__cell"><ProjectFrame project={p} /></div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
