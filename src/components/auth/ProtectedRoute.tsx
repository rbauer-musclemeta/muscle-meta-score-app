import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  children: ReactElement;
}

const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!hasClerk) {
    // TODO: Remove this bypass once all environments include Clerk.
    return children;
  }

  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <main className="container">
        <section className="card">
          <p>Loading authentication...</p>
        </section>
      </main>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

