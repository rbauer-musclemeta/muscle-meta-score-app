import { Link, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { ResultSummaryCard } from "@/components/results/ResultSummaryCard";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

const CAT_RESULT_KEY = "muscle_meta_catabolic_result";

export function ResultPage() {
  const { submissionId } = useParams();
  const { appUserId } = useCurrentAppUser();

  const result = useQuery(
    api.results.getResultBySubmissionId,
    submissionId
      ? {
          submissionId: submissionId as Id<"surveySubmissions">,
          userId: appUserId ?? undefined
        }
      : "skip"
  );

  const catabolicSnapshotRaw = sessionStorage.getItem(CAT_RESULT_KEY);
  const catabolicSnapshot = catabolicSnapshotRaw
    ? (JSON.parse(catabolicSnapshotRaw) as {
        result: {
          riskLabel: string;
          totalScore: number;
          recommendedCta: { primary: string; secondary: string };
        };
      })
    : null;

  if (!submissionId) {
    return (
      <main className="container">
        <section className="card">
          <h1>Missing submission id</h1>
        </section>
      </main>
    );
  }

  if (result === undefined) {
    return (
      <main className="container">
        <section className="card">
          <p>Loading result...</p>
        </section>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="container">
        <section className="card">
          <h1>Result not found</h1>
          <p>Start a new assessment to generate results.</p>
          <Link className="button" to="/assessment/catabolic-crisis">
            Start Assessment
          </Link>
        </section>
      </main>
    );
  }

  const functional = result.payload as {
    totalLabel: string;
    totalScore: number;
    weakestPillar: string;
    topFocusAreas: string[];
    recommendedCta: { primary: string; secondary: string };
  };

  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">Results</p>
        <h1>Your Muscle-Meta Summary</h1>
        <p>Stored result from Convex.</p>
      </section>

      {catabolicSnapshot ? (
        <ResultSummaryCard
          title={catabolicSnapshot.result.riskLabel}
          subtitle={`Catabolic score: ${catabolicSnapshot.result.totalScore}`}
          primaryCtaKey={catabolicSnapshot.result.recommendedCta.primary}
          secondaryCtaKey={catabolicSnapshot.result.recommendedCta.secondary}
        />
      ) : null}

      <ResultSummaryCard
        title={functional.totalLabel}
        subtitle={`Functional score: ${functional.totalScore} | Weakest pillar: ${functional.weakestPillar}`}
        primaryCtaKey={functional.recommendedCta.primary}
        secondaryCtaKey={functional.recommendedCta.secondary}
      />

      <section className="card">
        <h3>Priority Focus Areas</h3>
        <p>{functional.topFocusAreas?.join(", ") || "No focus areas available."}</p>
      </section>

      <section className="card">
        <div className="ctaRow">
          <Link className="button" to="/dashboard">
            Go to Dashboard
          </Link>
          <Link className="button buttonSecondary" to="/assessment/catabolic-crisis">
            Reassess
          </Link>
        </div>
      </section>
    </main>
  );
}

