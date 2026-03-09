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

export function CatabolicQuizPage() {
  const navigate = useNavigate();
  const survey = useMemo(() => getSurveyById("catabolic_crisis_screen_v1"), []);
  const { appUserId, isReady } = useCurrentAppUser();

  const startSubmission = useMutation(api.submissions.startSubmission);
  const saveResponse = useMutation(api.submissions.saveResponse);
  const completeSubmission = useMutation(api.submissions.completeSubmission);
  const scoreCatabolicCrisis = useMutation(api.results.scoreCatabolicCrisis);

  const [answers, setAnswers] = useState<QuestionAnswerMap>({});
  const [error, setError] = useState<string>("");
  const [submissionId, setSubmissionId] = useState<Id<"surveySubmissions"> | null>(
    null
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isReady || submissionId) {
      return;
    }

    let cancelled = false;

    async function initializeSubmission() {
      try {
        const result = await startSubmission({
          surveySlug: "catabolic-crisis-screen-v1",
          userId: appUserId ?? undefined,
          entrySource: "secure_app",
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
          appVersion: "v1"
        });

        if (!cancelled) {
          setSubmissionId(result.submissionId);
          setIsInitializing(false);
        }
      } catch (initError) {
        if (!cancelled) {
          setError("Could not start your assessment. Please refresh and try again.");
          setIsInitializing(false);
        }
      }
    }

    void initializeSubmission();

    return () => {
      cancelled = true;
    };
  }, [appUserId, isReady, startSubmission, submissionId]);

  function setAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function submit() {
    if (!submissionId) {
      setError("Submission not ready yet. Please wait a moment and try again.");
      return;
    }

    const missingRequired = survey.questions.some(
      (question) => question.required && !answers[question.id]
    );

    if (missingRequired) {
      setError("Please answer all required questions before continuing.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      for (const question of survey.questions) {
        const selectedOptionId = answers[question.id];
        const selectedOption = question.options.find(
          (option) => option.id === selectedOptionId
        );

        await saveResponse({
          submissionId,
          questionId: question.id,
          selectedOptionId,
          selectedValue: selectedOptionId,
          selectedLabel: selectedOption?.label,
          score: question.scored ? selectedOption?.score : undefined
        });
      }

      await completeSubmission({ submissionId });
      const catabolicResult = await scoreCatabolicCrisis({ submissionId });

      sessionStorage.setItem(
        CAT_RESULT_KEY,
        JSON.stringify({ submissionId, result: catabolicResult })
      );

      navigate("/assessment/functional-scorecard");
    } catch (submitError) {
      setError("Could not save your answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">Step 1 of 2</p>
        <h1>{survey.title}</h1>
        <p>{survey.description}</p>
      </section>

      {survey.questions.map((question) => (
        <SurveyQuestionCard
          key={question.id}
          question={question}
          selectedOptionId={answers[question.id]}
          onSelect={(optionId) => setAnswer(question.id, optionId)}
        />
      ))}

      {error ? <p className="errorText">{error}</p> : null}

      <section className="card">
        <div className="ctaRow">
          <Link className="button buttonSecondary" to="/">
            Cancel
          </Link>
          <button
            className="button"
            disabled={isInitializing || isSubmitting}
            onClick={submit}
            type="button"
          >
            {isSubmitting
              ? "Saving..."
              : isInitializing
                ? "Preparing..."
                : "Continue to Functional Scorecard"}
          </button>
        </div>
      </section>
    </main>
  );
}

