import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export type QuestionType = {
  label: string;
  key: string;
  type: "radio" | "select" | "checkbox";
  options: string[];
};

interface GameStepperProps {
  questions: QuestionType[];
  onSubmit: (data: any) => void;
}

export const GameStepper: React.FC<GameStepperProps> = ({ questions, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const handleNext = () => {
    if (questions[step].key === "developmentAreas" && (!formData["developmentAreas"]?.length)) {
      toast({ title: "Please select at least one area to improve." });
      return;
    }
    setStep((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (option: string) => {
    setFormData((prev) => {
      const current = prev.developmentAreas || [];
      return {
        ...prev,
        developmentAreas: current.includes(option)
          ? current.filter((item: string) => item !== option)
          : [...current, option],
      };
    });
  };

  const isLastStep = step === questions.length - 1;
  const question = questions[step];

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-3xl font-bold text-blue-300 mb-6">Step {step + 1} of {questions.length}</h2>
      <p className="text-xl font-semibold text-white mb-4">{question.label}</p>

      <div className="space-y-3">
        {question.type === "radio" && question.options.map((opt) => (
          <label key={opt} className="flex items-center space-x-3">
            <input
              type="radio"
              name={question.key}
              value={opt}
              checked={formData[question.key] === opt}
              onChange={() => handleChange(question.key, opt)}
              className="form-radio text-blue-600"
            />
            <span className="text-gray-300">{opt}</span>
          </label>
        ))}

        {question.type === "checkbox" && question.options.map((opt) => (
          <label key={opt} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData["developmentAreas"]?.includes(opt)}
              onChange={() => handleCheckbox(opt)}
              className="form-checkbox text-blue-600"
            />
            <span className="text-gray-300">{opt}</span>
          </label>
        ))}

        {question.type === "select" && (
          <select
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
            value={formData[question.key] || ""}
            onChange={(e) => handleChange(question.key, e.target.value)}
          >
            <option value="">Select an option</option>
            {question.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        {!isLastStep ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button onClick={() => onSubmit(formData)}>
            Generate Plan
          </Button>
        )}
      </div>
    </div>
  );
};
