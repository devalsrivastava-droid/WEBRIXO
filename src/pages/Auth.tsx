import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/hooks/use-page-meta";
import { backendConfigured, backendMessage } from "@/lib/backend";
import { Mark } from "@/components/home/Chrome";
import { PROJECTS } from "@/components/home/data";
import ProjectFrame from "@/components/home/ProjectFrame";
import "@/styles/home.css";

const ease = [0.16, 1, 0.3, 1] as const;

function resolveRedirect(returnTo: string | null, fallback = "/") {
  return returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : fallback;
}

export default function Auth({ redirectAfterAuth }: { redirectAfterAuth?: string } = {}) {
  usePageMeta({ title: "Sign in — WEBRIXO", description: "Sign in to WEBRIXO with a one-time code to manage your projects and requests.", path: "/auth" });
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = resolveRedirect(params.get("returnTo"), redirectAfterAuth);

  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"" | "submit" | "guest">("");
  const [error, setError] = useState("");


  useEffect(() => { if (!authLoading && isAuthenticated) navigate(redirect, { replace: true }); }, [authLoading, isAuthenticated, navigate, redirect]);

  async function submitCredentials(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Passwords need at least 8 characters.");
      return;
    }
    setBusy("submit");
    try {
      const fd = new FormData();
      fd.set("email", email.trim().toLowerCase());
      fd.set("password", password);
      fd.set("flow", mode);
      await signIn("password", fd);
      navigate(redirect, { replace: true });
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      // Convex returns one generic error for both cases on sign-in, on purpose:
      // saying "no such account" would let anyone test which emails exist.
      if (mode === "signIn") {
        setError(/InvalidAccountId|InvalidSecret|Invalid/i.test(detail)
          ? "That email and password don't match. Check both, or create an account."
          : detail || "We couldn't sign you in. Try again in a moment.");
      } else {
        setError(/already|exists|taken/i.test(detail)
          ? "There's already an account with that email. Switch to signing in."
          : detail || "We couldn't create the account. Try again in a moment.");
      }
    } finally { setBusy(""); }
  }

  async function guest() {
    setError(""); setBusy("guest");
    try {
      await signIn("anonymous");
      navigate(redirect, { replace: true });
    } catch (err) {
      // Show what actually failed — "try again in a moment" sends people in
      // circles when the real problem is that anonymous sign-in is switched off.
      const detail = err instanceof Error && err.message ? err.message : "";
      setError(detail
        ? `Guest sign-in failed: ${detail}`
        : "Guest sign-in didn't go through. If this keeps happening, email hello@webrixo.com and we'll sort it out.");
    } finally { setBusy(""); }
  }

  const strip = [...PROJECTS, ...PROJECTS];

  return (
    <div className="wx wx-auth">
      <header className="wx-auth__bar">
        <Link to="/" className="wx-brand" aria-label="WEBRIXO home"><Mark /><span>WEBRIXO</span></Link>
        <Link to="/" className="wx-btn wx-btn--ghost wx-btn--sm">Back to site</Link>
      </header>

      <main className="wx-auth__grid" id="main">
        <section className="wx-auth__panel" aria-labelledby="auth-title">
          {!backendConfigured && (
            <div className="wx-notice" role="status">
              <b>Preview mode</b>
              <span>{backendMessage} Sign-in below still works so you can walk through the flow — it just runs in this browser and forgets everything when you close the tab.</span>
            </div>
          )}
          <motion.form onSubmit={submitCredentials} className="wx-auth__form"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>

            <h1 id="auth-title" className="wx-h2">{mode === "signIn" ? "Welcome back." : "Create your account."}</h1>
            <p className="wx-body">
              {mode === "signIn"
                ? "Sign in to see your projects, payments and requests."
                : "One email, one password. No verification email to wait for."}
            </p>

            <div className="wx-field">
              <label htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" name="email" autoComplete="email" required autoFocus
                value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourbusiness.com" />
            </div>

            <div className="wx-field">
              <label htmlFor="auth-password">Password</label>
              <div className="wx-pw">
                <input id="auth-password" type={showPassword ? "text" : "password"} name="password" required
                  autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                  minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "signIn" ? "Your password" : "At least 8 characters"} />
                <button type="button" className="wx-pw__toggle" onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <p className="wx-form__status is-error" role="alert">{error}</p>}

            <button type="submit" className="wx-btn wx-btn--copper" disabled={!!busy}>
              {busy === "submit" ? (mode === "signIn" ? "Signing you in" : "Creating your account") : (mode === "signIn" ? "Sign in" : "Create account")}
            </button>

            <p className="wx-small">
              {mode === "signIn" ? "No account yet? " : "Already have one? "}
              <button type="button" className="wx-link" onClick={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(""); }}>
                {mode === "signIn" ? "Create one" : "Sign in instead"}
              </button>
            </p>

            <div className="wx-auth__or"><span>or</span></div>

            <button type="button" className="wx-btn wx-btn--ghost" onClick={guest} disabled={!!busy}>
              {busy === "guest" ? "Signing you in" : "Continue as a guest"}
            </button>
            <p className="wx-small">Guests can browse and send requests. Add an email and password later to keep them.</p>
          </motion.form>
          <p className="wx-small wx-auth__legal">By signing in you agree to our <Link to="/terms" className="wx-link">terms</Link> and <Link to="/privacy" className="wx-link">privacy policy</Link>.</p>
        </section>

        <aside className="wx-auth__visual" aria-hidden="true">
          <div className="wx-auth__glow" />
          <div className="wx-auth__col">
            <div className="wx-auth__track">
              {strip.map((p, i) => <div key={`${p.slug}-${i}`} className="wx-auth__cell"><ProjectFrame project={p} /></div>)}
            </div>
          </div>
          <div className="wx-auth__col wx-auth__col--rev">
            <div className="wx-auth__track">
              {strip.slice().reverse().map((p, i) => <div key={`${p.slug}-r${i}`} className="wx-auth__cell"><ProjectFrame project={p} /></div>)}
            </div>
          </div>
          <p className="wx-auth__caption"><span>Four live demos, two people, one inbox that gets answered.</span></p>
        </aside>
      </main>
    </div>
  );
}
