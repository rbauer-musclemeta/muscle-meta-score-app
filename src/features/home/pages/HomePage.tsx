import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export function HomePage() {
  return (
    <main className="container">
      <section className="card">
        <div className="rowSpace">
          <p className="eyebrow">Muscle-Meta V1</p>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
        <h1>Assessment App</h1>
        <p>
          Start with the Catabolic Crisis Screen, continue through the full Functional
          Decline Scorecard, then review your personalized results.
        </p>
        <div className="ctaRow">
          <SignedIn>
            <Link className="button" to="/assessment/catabolic-crisis">
              Start Assessment
            </Link>
            <Link className="button buttonSecondary" to="/dashboard">
              View Dashboard
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="button" type="button">
                Sign In to Start
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </section>
    </main>
  );
}

