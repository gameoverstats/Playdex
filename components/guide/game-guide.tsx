import React, { useState } from "react";
import { GameStepper, QuestionType } from "./game-stepper";

interface GameGuideProps {
  gameName: string;
  questions: QuestionType[];
  onGeneratePlan: (data: any) => Promise<any>;
}

export const GameGuide: React.FC<GameGuideProps> = ({ gameName, questions, onGeneratePlan }) => {
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  const handleSubmit = async (formData: any) => {
    const plan = await onGeneratePlan(formData);
    setGeneratedPlan(plan);
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-4xl font-bold mb-6">🎮 {gameName} Guide</h1>

      {!generatedPlan ? (
        <GameStepper questions={questions} onSubmit={handleSubmit} />
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2">{generatedPlan.title}</h2>
            <p className="text-gray-300">{generatedPlan.subtitle}</p>
          </div>

          {generatedPlan.tasks.map((day: any) => (
            <div key={day.day} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{day.day}</h3>
              <p className="text-gray-400 mb-2">Focus: {day.focusArea}</p>
              <ul className="list-disc ml-6 text-gray-200">
                {day.tasksList.map((task: any, index: number) => (
                  <li key={index}>{task.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
