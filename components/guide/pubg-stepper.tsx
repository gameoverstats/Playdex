import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const questions = [
  {
    label: "How often do you play?",
    key: "playFrequency",
    type: "radio",
    options: ["Daily", "Few times a week", "Weekends only", "Occasionally"],
  },
  {
    label: "What device do you play on?",
    key: "device",
    type: "radio",
    options: ["PC", "Console", "Mobile"],
  },
  {
    label: "Do you play solo or with a squad?",
    key: "playMode",
    type: "radio",
    options: ["Solo", "Duo", "Squad"],
  },
  {
    label: "What is your current rank?",
    key: "currentRank",
    type: "select",
    options: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Crown", "Ace", "Conqueror"],
  },
  {
    label: "What is your desired rank?",
    key: "desiredRank",
    type: "select",
    options: ["Silver", "Gold", "Platinum", "Diamond", "Crown", "Ace", "Conqueror"],
  },
  {
    label: "What areas do you want to improve?",
    key: "developmentAreas",
    type: "checkbox",
    options: ["Aim", "Rotations", "Close Combat", "Sniping", "Game Sense", "Teamwork"],
  },
  {
    label: "Do you prefer passive or aggressive playstyle?",
    key: "playStyle",
    type: "radio",
    options: ["Passive", "Balanced", "Aggressive"],
  },
  {
    label: "How many hours can you train per week?",
    key: "weeklyHours",
    type: "select",
    options: ["<5", "5-10", "10-20", ">20"],
  },
  {
    label: "Do you want solo or team-focused plans?",
    key: "focusType",
    type: "radio",
    options: ["Solo", "Team"],
  },
  {
    label: "Do you want daily reminders?",
    key: "reminders",
    type: "radio",
    options: ["Yes", "No"],
  },
];

interface PUBGStepperProps {
  onSubmit: (data: Record<string, any>) => void;
}

export const PUBGStepper: React.FC<PUBGStepperProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const question = questions[step];
  const isLastStep = step === questions.length - 1;

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (value: string) => {
    setFormData((prev) => {
      const current = prev.developmentAreas || [];
      return {
        ...prev,
        developmentAreas: current.includes(value)
          ? current.filter((item: string) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleNext = () => {
    if (question.type === "checkbox" && (!formData[question.key] || formData[question.key].length === 0)) {
      toast({ title: "Please select at least one area to improve." });
      return;
    }
    if (question.type !== "checkbox" && !formData[question.key]) {
      toast({ title: "Please select or fill this step." });
      return;
    }
    setStep((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-3xl font-bold text-blue-300 mb-6">
        Step {step + 1} of {questions.length}
      </h2>
      <p className="text-xl font-semibold text-white mb-4">{question.label}</p>

      <div className="space-y-3">
        {question.type === "radio" &&
          question.options.map((option) => (
            <label key={option} className="flex items-center space-x-3">
              <input
                type="radio"
                name={question.key}
                value={option}
                checked={formData[question.key] === option}
                onChange={() => handleChange(question.key, option)}
                className="form-radio text-blue-500"
              />
              <span className="text-gray-300">{option}</span>
            </label>
          ))}

        {question.type === "checkbox" &&
          question.options.map((option) => (
            <label key={option} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData[question.key]?.includes(option) || false}
                onChange={() => handleCheckbox(option)}
                className="form-checkbox text-blue-500"
              />
              <span className="text-gray-300">{option}</span>
            </label>
          ))}

        {question.type === "select" && (
          <select
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600"
            value={formData[question.key] || ""}
            onChange={(e) => handleChange(question.key, e.target.value)}
          >
            <option value="">Select an option</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        {!isLastStep ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Generate Plan</Button>
        )}
      </div>
    </div>
  );
};
