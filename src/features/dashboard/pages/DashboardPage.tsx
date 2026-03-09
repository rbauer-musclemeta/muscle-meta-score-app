import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { UserButton } from "@clerk/clerk-react";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { api } from "@convex/_generated/api";

export function DashboardPage() {
  const { appUserId, isReady } = useCurrentAppUser();

  const results = useQuery(
    api.results.getLatestResultsForUser,
    appUserId ? { userId: appUserId } : "skip"
  );

  return (
    <main className="container">
      <section className="card">
        <div className="rowSpace">
          <h1>Dashboard</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
        <p>Saved, user-linked results from Convex.</p>
        <div className="ctaRow">
          <Link className="button" to="/assessment/catabolic-crisis">
            Start New Assessment
          </Link>
          <Link className="button buttonSecondary" to="/">
            Back Home
          </Link>
        </div>
      </section>

      {!isReady || results === undefined ? (
        <section className="card">
          <p>Loading results...</p>
        </section>
      ) : results.length === 0 ? (
        <section className="card">
          <p>No completed assessments yet.</p>
        </section>
      ) : (
        results.map((entry: any) => (
          <section className="card" key={entry._id}>
            <p className="eyebrow">{new Date(entry.createdAt).toLocaleString()}</p>
            <h3>{entry.summaryTitle}</h3>
            <p>{entry.summaryBody}</p>
            <p>
              Score: {entry.totalScore} | Band: {entry.riskBandLabel}
            </p>
            <Link className="button" to={`/results/${entry.submissionId}`}>
              Open Result
            </Link>
          </section>
        ))
      )}
    </main>
  );
}


