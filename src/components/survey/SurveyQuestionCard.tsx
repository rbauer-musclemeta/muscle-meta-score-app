import type { SurveyQuestion } from "@/types/survey";

interface SurveyQuestionCardProps {
  question: SurveyQuestion;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

export function SurveyQuestionCard({
  question,
  selectedOptionId,
  onSelect
}: SurveyQuestionCardProps) {
  return (
    <section className="card">
      <p className="eyebrow">Question {question.order}</p>
      <h3>{question.prompt}</h3>
      <div className="optionList">
        {question.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          return (
            <label key={option.id} className={`option ${isSelected ? "selected" : ""}`}>
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(option.id)}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

