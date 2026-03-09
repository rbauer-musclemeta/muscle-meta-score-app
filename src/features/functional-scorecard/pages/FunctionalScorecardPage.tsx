import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { SurveyQuestionCard } from "@/components/survey/SurveyQuestionCard";
import { getSurveyById } from "@/content/surveys/surveySchema";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { QuestionAnswerMap } from "@/types/shared";

const CAT_RESULT_KEY = "muscle_meta_catabolic_result";

export function FunctionalScorecardPage() {
  const navigate = useNavigate();
  const survey = useMemo(
    () => getSurveyById("functional_decline_muscle_risk_scorecard_v1"),
    []
  );
  const { appUserId, isReady } = useCurrentAppUser();

  const startSubmission = useMutation(api.submissions.startSubmission);
  const saveResponse = useMutation(api.submissions.saveResponse);
  const completeSubmission = useMutation(api.submissions.completeSubmission);
  const scoreFunctionalScorecard = useMutation(api.results.scoreFunctionalScorecard);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswerMap>({});
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<Id<"surveySubmissions"> | null>(
    null
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = survey.questions[step];
  const isLastStep = step === survey.questions.length - 1;

  useEffect(() => {
    if (!isReady || submissionId) {
      return;
    }

    let cancelled = false;

    async function initializeSubmission() {
      try {
        const result = await startSubmission({
          surveySlug: "functional-decline-muscle-risk-scorecard-v1",
          userId: appUserId ?? undefined,
          entrySource: "secure_app",
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
          appVersion: "v1"
        });

        if (!cancelled) {
          setSubmissionId(result.submissionId);
          setIsInitializing(false);
        }
      } catch {
        if (!cancelled) {
          setError("Could not start your scorecard. Please refresh and try again.");
          setIsInitializing(false);
        }
      }
    }

    void initializeSubmission();

    return () => {
      cancelled = true;
    };
  }, [appUserId, isReady, startSubmission, submissionId]);

  function setAnswer(optionId: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  }

  async function saveCurrentQuestionResponse() {
    if (!submissionId) {
      throw new Error("Submission not initialized.");
    }

    const selectedOptionId = answers[currentQuestion.id];
    const selectedOption = currentQuestion.options.find(
      (option) => option.id === selectedOptionId
    );

    await saveResponse({
      submissionId,
      questionId: currentQuestion.id,
      selectedOptionId,
      selectedValue: selectedOptionId,
      selectedLabel: selectedOption?.label,
      score: currentQuestion.scored ? selectedOption?.score : undefined
    });
  }

  async function next() {
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      setError("Please answer this question before continuing.");
      return;
    }

    if (!submissionId) {
      setError("Submission not ready yet. Please wait and try again.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await saveCurrentQuestionResponse();

      if (!isLastStep) {
        setStep((value) => value + 1);
        return;
      }

      const catabolicRaw = sessionStorage.getItem(CAT_RESULT_KEY);
      if (!catabolicRaw) {
        setError("Catabolic step is missing. Please restart the assessment.");
        return;
      }

      await completeSubmission({ submissionId });
      await scoreFunctionalScorecard({ submissionId });

      navigate(`/results/${submissionId}`);
    } catch {
      setError("Could not save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">Step 2 of 2</p>
        <h1>{survey.title}</h1>
        <p>{survey.description}</p>
        <p>
          Question {step + 1} of {survey.questions.length}
        </p>
      </section>

      <SurveyQuestionCard
        question={currentQuestion}
        selectedOptionId={answers[currentQuestion.id]}
        onSelect={setAnswer}
      />

      {error ? <p className="errorText">{error}</p> : null}

      <section className="card">
        <div className="ctaRow">
          {step === 0 ? (
            <Link className="button buttonSecondary" to="/assessment/catabolic-crisis">
              Back
            </Link>
          ) : (
            <button
              className="button buttonSecondary"
              type="button"
              disabled={isSaving}
              onClick={() => setStep((value) => value - 1)}
            >
              Previous
            </button>
          )}

          <button
            className="button"
            type="button"
            disabled={isSaving || isInitializing}
            onClick={next}
          >
            {isSaving
              ? "Saving..."
              : isInitializing
                ? "Preparing..."
                : isLastStep
                  ? "Finish Assessment"
                  : "Next Question"}
          </button>
        </div>
      </section>
    </main>
  );
}

