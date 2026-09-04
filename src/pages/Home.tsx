import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/hooks/use-page-meta";
import Onboarding from "@/components/Onboarding";
import "@/styles/home.css";

import { Preloader, Header } from "@/components/home/Chrome";
import Hero from "@/components/home/Hero";
import Showreel from "@/components/home/Showreel";
import AiBuild from "@/components/home/AiBuild";
import AiBuilder from "@/components/home/AiBuilder";
import { Interstitial } from "@/components/home/Sections";
import { Paths, Process, Manifesto, ScrollTrigger } from "@/components/home/Sections";
import { Faq, Contact, Footer, CookieBanner, type BuildMode } from "@/components/home/Closing";
import { Cursor, ScrollProgress, useSmoothScroll, useChromeOnLight, prefersReducedMotion, scrollToId } from "@/components/home/motion";
import { Marquee, Services, BeforeAfter, Checklist, Chapters } from "@/components/home/Extras";
import { Stats, Pricing, Proof, Team } from "@/components/home/Proof";
import { Matcher, Instagram } from "@/components/home/Engage";

const SESSION_KEY = "webrixo-intro-seen";

export default function Home() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [ready, setReady] = useState(() => {
    try { return prefersReducedMotion() || sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
  });
  const [mode, setMode] = useState<BuildMode>("human");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  usePageMeta({
    title: "WEBRIXO — Websites for small businesses, designed and built in weeks",
    description: "WEBRIXO is a one-person design and build studio. Fast, search-ready websites for cafés, gyms, restaurants and small software companies. Build with AI in minutes or with us in weeks.",
    path: "/",
    ogImage: "/og-image.png",
  });

  useSmoothScroll(ready);
  useChromeOnLight();

  useEffect(() => { if (isAuthenticated && user && !user.onboarded) setOnboardingOpen(true); }, [isAuthenticated, user]);

  // Lock scroll during the intro, then refresh ScrollTrigger once layout is final.
  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    if (ready) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
      const id = setTimeout(() => ScrollTrigger.refresh(), 150);
      return () => clearTimeout(id);
    }
    return () => { document.documentElement.style.overflow = ""; };
  }, [ready]);

  // Floating prompt once the visitor has scrolled past the work section.
  useEffect(() => {
    const onScroll = () => {
      const contact = document.getElementById("contact");
      const past = window.scrollY > window.innerHeight * 1.2;
      const nearContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.8 : false;
      setShowPrompt(past && !nearContact);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToContact = useCallback((m?: BuildMode) => {
    if (m) setMode(m);
    scrollToId("contact");
  }, []);

  const onDone = useCallback(() => setReady(true), []);

  return (
    <div className="wx">
      <AnimatePresence>{!ready && <Preloader key="loader" onDone={onDone} />}</AnimatePresence>
      <Cursor />
      <ScrollProgress />
      <Chapters />
      <Header onStart={() => goToContact()} isAuthenticated={isAuthenticated} onSignOut={() => signOut()} />

      <main id="main">
        <Hero ready={ready} onStart={() => goToContact()} />
        <Marquee />
        <Showreel />
        <Stats />
        <Services />
        <AiBuild onStart={() => goToContact("ai")} />
        <AiBuilder />
        <Paths onStart={goToContact} />
        <Process />
        <BeforeAfter />
        <Proof />
        <Matcher />
        <div className="wx-invert">
          <Pricing onStart={() => goToContact("human")} />
          <Checklist />
        </div>
        <Manifesto />
        <Team />
        <Faq />
        <Instagram />
        <Interstitial />
        <Contact mode={mode} onModeChange={setMode} />
      </main>

      <Footer />

      <AnimatePresence>
        {showPrompt && (
          <motion.div className="wx-sticky" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            <button className="wx-btn wx-btn--copper" onClick={() => goToContact()}>Start a project</button>
          </motion.div>
        )}
      </AnimatePresence>

      <CookieBanner />
      <Onboarding open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </div>
  );
}
