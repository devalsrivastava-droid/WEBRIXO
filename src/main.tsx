import { Toaster } from "@/components/ui/sonner";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter, Route, Routes, useLocation } from "react-router";

// When opened from a local file (the downloadable preview), there is no server
// to serve clean URLs, so keep routing in memory and let #anchors scroll natively.
const Router = window.location.protocol === "file:" ? MemoryRouter : BrowserRouter;
import "./index.css";
import { useWipeNavigation } from "./components/home/motion";

// Lazy load route components for better code splitting
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Home = lazy(() => import("./pages/Home.tsx"));
const AccountPage = lazy(() => import("./pages/Account.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const DemoBrew = lazy(() => import("./pages/demos/DemoBrew.tsx"));
const DemoPulse = lazy(() => import("./pages/demos/DemoPulse.tsx"));
const DemoSaffron = lazy(() => import("./pages/demos/DemoSaffron.tsx"));
const DemoTaskly = lazy(() => import("./pages/demos/DemoTaskly.tsx"));
const PrivacyPage = lazy(() => import("./pages/Privacy.tsx"));
const TermsPage = lazy(() => import("./pages/Terms.tsx"));
const ThankYouPage = lazy(() => import("./pages/ThankYou.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return <div style={{ minHeight: "100vh", background: "#000" }} aria-hidden="true" />;
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



/** Plays the curtain wipe on internal link clicks, app-wide. */
function WipeNav() { useWipeNavigation(true); return null; }

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <Router>
          <RouteSyncer />
          <WipeNav />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/" />}
              />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/demos/brew" element={<DemoBrew />} />
              <Route path="/demos/pulse" element={<DemoPulse />} />
              <Route path="/demos/saffron" element={<DemoSaffron />} />
              <Route path="/demos/taskly" element={<DemoTaskly />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
