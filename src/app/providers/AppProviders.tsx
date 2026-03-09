import type { ReactNode } from "react";
import { useMemo } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

interface AppProvidersProps {
  children: ReactNode;
}

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export function AppProviders({ children }: AppProvidersProps) {
  const convexClient = useMemo(() => {
    if (!convexUrl) {
      return null;
    }
    return new ConvexReactClient(convexUrl);
  }, []);

  if (!convexUrl || !clerkPublishableKey || !convexClient) {
    return (
      <main className="container">
        <section className="card">
          <h1>Missing Environment Variables</h1>
          <p>
            Add `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY` to run the
            authenticated app.
          </p>
        </section>
      </main>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

