import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PUBGStepper } from '@/components/guide/pubg-stepper';

interface PUBGGuideProps {
  onBack: () => void;
}

export const PUBGGuide: React.FC<PUBGGuideProps> = ({ onBack }) => {
  const [stage, setStage] = useState<'tips' | 'questions' | 'planner'>('tips');
  const [weeklyPlanner, setWeeklyPlanner] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();

  const generateWeeklyPlanner = (data: any) => {
    setUserData(data);

    const planner = {
      title: "Your Personalized PUBG Training Plan",
      subtitle: `From ${data.currentRank} to ${data.desiredRank} - Focused on ${data.developmentAreas?.join(', ')}`,
      tasks: Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        focusArea: data.developmentAreas?.[i % data.developmentAreas.length],
        tasksList: [
          { text: `Practice ${data.developmentAreas?.[i % data.developmentAreas.length]} for 30 minutes`, completed: false },
          { text: "Play 2 matches focusing on today’s skill", completed: false }
        ]
      }))
    };

    setWeeklyPlanner(planner);
    setStage('planner');
    toast({ title: "Planner ready!", description: "Your training guide is generated." });
  };

  const handleTaskToggle = (dayIndex: number, taskIndex: number) => {
    setWeeklyPlanner((prev: any) => {
      const updated = { ...prev };
      updated.tasks[dayIndex].tasksList[taskIndex].completed = !updated.tasks[dayIndex].tasksList[taskIndex].completed;
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6 mb-8 text-center relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold text-blue-400">PUBG: Battlegrounds Guide</h1>
        <p className="text-lg text-gray-300">Level up your gameplay with personalized insights</p>
      </header>

      {stage === 'tips' && (
        <>
          <section className="w-full max-w-4xl bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-blue-300 mb-4">Early Game Tips</h2>
            <ul className="list-disc ml-6 text-gray-300 space-y-2">
              <li>Land smartly — avoid hot drops unless you're confident.</li>
              <li>Loot fast — gun, meds, and vest should be top priority.</li>
              <li>Listen — footsteps are your best intel.</li>
            </ul>
          </section>
          <button
            onClick={() => setStage('questions')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Start Personalized Plan
          </button>
        </>
      )}

      {stage === 'questions' && (
        <PUBGStepper onSubmit={generateWeeklyPlanner} />
      )}

      {stage === 'planner' && weeklyPlanner && (
        <section className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-blue-300 mb-2 text-center">{weeklyPlanner.title}</h2>
          <p className="text-lg text-gray-300 mb-4 text-center">{weeklyPlanner.subtitle}</p>

          {/* Weekly Plan UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weeklyPlanner.tasks.map((day: any, dayIndex: number) => (
              <div key={dayIndex} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{day.day}</h3>
                <p className="text-blue-300 mb-3">Focus: {day.focusArea}</p>
                <ul>
                  {day.tasksList.map((task: any, taskIndex: number) => (
                    <li key={taskIndex} className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleTaskToggle(dayIndex, taskIndex)}
                        className="form-checkbox text-green-500"
                      />
                      <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-300'}>
                        {task.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
