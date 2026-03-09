import { SignIn } from "@clerk/clerk-react";

export function SignInPage() {
  return (
    <main className="container">
      <section className="card" style={{ justifyItems: "center" }}>
        <h1>Sign In</h1>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-in" />
      </section>
    </main>
  );
}

