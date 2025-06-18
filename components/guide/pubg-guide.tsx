import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PUBGGuideProps {
  onBack: () => void;
}

export const PUBGGuide: React.FC<PUBGGuideProps> = ({ onBack }) => {
  const [stage, setStage] = useState('tips');
  const [playFrequency, setPlayFrequency] = useState('');
  const [currentRank, setCurrentRank] = useState('');
  const [desiredRank, setDesiredRank] = useState('');
  const [developmentAreas, setDevelopmentAreas] = useState<string[]>([]);
  const [device, setDevice] = useState('');
  const [playMode, setPlayMode] = useState('');
  const [weeklyPlanner, setWeeklyPlanner] = useState<any>(null);
  const [isGeneratingPlanner, setIsGeneratingPlanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  // Calculate total and completed tasks for progress bar
  const totalTasks = weeklyPlanner?.tasks.reduce((sum: number, day: any) => sum + day.tasksList.length, 0) || 0;
  const completedTasks = weeklyPlanner?.tasks.reduce((sum: number, day: any) =>
    sum + day.tasksList.filter((task: any) => task.completed).length, 0
  ) || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleDevelopmentAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setDevelopmentAreas((prev) => [...prev, value]);
    } else {
      setDevelopmentAreas((prev) => prev.filter((area) => area !== value));
    }
  };

  const handleTaskCompletion = (dayIndex: number, taskIndex: number) => {
    setWeeklyPlanner((prevPlanner: any) => {
      const newPlanner = { ...prevPlanner };
      newPlanner.tasks[dayIndex].tasksList[taskIndex].completed = !newPlanner.tasks[dayIndex].tasksList[taskIndex].completed;
      return newPlanner;
    });
  };

  const handleDayCompletion = (dayIndex: number) => {
    setWeeklyPlanner((prevPlanner: any) => {
      const newPlanner = { ...prevPlanner };
      const allTasksCompleted = newPlanner.tasks[dayIndex].tasksList.every((task: any) => task.completed);
      newPlanner.tasks[dayIndex].tasksList.forEach((task: any) => task.completed = !allTasksCompleted);
      return newPlanner;
    });
  };

  const generateWeeklyPlanner = async () => {
    setIsGeneratingPlanner(true);
    setErrorMessage('');

    try {
      // This is a mock planner generation - in production, you'd call your API
      const mockPlanner = {
        title: "Your Personalized PUBG Training Plan",
        subtitle: `From ${currentRank} to ${desiredRank} - Focused on ${developmentAreas.join(', ')}`,
        tasks: Array.from({ length: 7 }, (_, i) => ({
          day: `Day ${i + 1}`,
          focusArea: developmentAreas[i % developmentAreas.length],
          tasksList: [
            {
              text: `Practice ${developmentAreas[i % developmentAreas.length]} for 30 minutes`,
              completed: false
            },
            {
              text: "Play 2 matches focusing on today's skills",
              completed: false
            }
          ]
        }))
      };

      setWeeklyPlanner(mockPlanner);
      setStage('planner');
      
      toast({
        title: "Success!",
        description: "Your personalized training plan is ready.",
      });
    } catch (error: any) {
      setErrorMessage('Failed to generate planner. Please try again.');
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPlanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-inter p-4 sm:p-6 md:p-8 flex flex-col items-center">
      {/* Header Section */}
      <header className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6 mb-8 text-center relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out text-sm"
        >
          &larr; Back to Games
        </button>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-400 mb-2">
          PUBG: Battlegrounds Guide
        </h1>
        <p className="text-lg sm:text-xl text-gray-300">
          Your ultimate resource for dominating the battlegrounds!
        </p>
      </header>

      {stage === 'tips' && (
        <>
          {/* General Tips Section */}
          <section className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-3xl font-bold text-blue-300 mb-4">Essential Tips for Victory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-2">Early Game Strategy</h3>
                <ul className="list-disc list-inside text-gray-300">
                  <li>Choose your drop carefully based on desired loot and enemy density.</li>
                  <li>Prioritize securing a good weapon and some healing items immediately.</li>
                  <li>Avoid unnecessary early fights unless you have a clear advantage.</li>
                </ul>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-2">Mid Game Rotations</h3>
                <ul className="list-disc list-inside text-gray-300">
                  <li>Keep an eye on the blue zone and plan your rotations early.</li>
                  <li>Use vehicles for faster and safer rotations, but be mindful of their noise.</li>
                  <li>Position yourself to have cover and good visibility of incoming enemies.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6 flex justify-center">
            <button
              onClick={() => setStage('questions')}
              className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
            >
              Get Your Personalized Planner
            </button>
          </section>
        </>
      )}

      {stage === 'questions' && (
        <section className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-blue-300 mb-6">Tell Us About Your Playstyle</h2>

          {/* Questionnaire form fields */}
          <div className="space-y-6">
            {/* Play Frequency */}
            <div>
              <label className="block text-xl font-semibold text-white mb-3">How often do you play?</label>
              <div className="flex flex-wrap gap-4">
                {['Daily', 'Few times a week', 'Weekends only', 'Occasionally'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-blue-500"
                      name="playFrequency"
                      value={option}
                      checked={playFrequency === option}
                      onChange={(e) => setPlayFrequency(e.target.value)}
                    />
                    <span className="ml-2 text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Current Rank */}
            <div>
              <label className="block text-xl font-semibold text-white mb-3">Current Rank</label>
              <select
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentRank}
                onChange={(e) => setCurrentRank(e.target.value)}
              >
                <option value="">Select Rank</option>
                {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'].map((rank) => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>

            {/* Development Areas */}
            <div>
              <label className="block text-xl font-semibold text-white mb-3">Areas to Improve (Select all that apply)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Aim', 'Rotations', 'Close Combat', 'Sniping', 'Game Sense', 'Teamwork'].map((area) => (
                  <label key={area} className="inline-flex items-center bg-gray-700 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-600 transition duration-200">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500 rounded"
                      value={area}
                      checked={developmentAreas.includes(area)}
                      onChange={handleDevelopmentAreaChange}
                    />
                    <span className="ml-3 text-gray-300">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-800 text-red-200 rounded-lg text-center">
                {errorMessage}
              </div>
            )}

            <button
              onClick={generateWeeklyPlanner}
              className="w-full px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
              disabled={isGeneratingPlanner || !playFrequency || !currentRank || developmentAreas.length === 0}
            >
              {isGeneratingPlanner ? 'Generating...' : '✨ Generate My Weekly Planner'}
            </button>
          </div>
        </section>
      )}

      {stage === 'planner' && weeklyPlanner && (
        <section className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-blue-300 mb-2 text-center">{weeklyPlanner.title}</h2>
          <p className="text-lg text-gray-300 mb-4 text-center">{weeklyPlanner.subtitle}</p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-400 mt-1">{completedTasks}/{totalTasks} Tasks Done</p>
          </div>

          {/* Weekly Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weeklyPlanner.tasks.map((dayPlan: any, dayIndex: number) => (
              <div key={dayIndex} className="bg-gray-700 rounded-lg p-5 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-2">{dayPlan.day}</h3>
                <p className="text-blue-300 font-medium mb-3">Focus: {dayPlan.focusArea}</p>
                <ul className="space-y-2">
                  {dayPlan.tasksList.map((task: any, taskIndex: number) => (
                    <li key={taskIndex} className="flex items-start">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-green-500 rounded mr-3 mt-1"
                        checked={task.completed}
                        onChange={() => handleTaskCompletion(dayIndex, taskIndex)}
                      />
                      <span className={`text-gray-300 ${task.completed ? 'line-through opacity-70' : ''}`}>
                        {task.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleDayCompletion(dayIndex)}
                  className="mt-4 w-full py-2 rounded-lg text-white font-semibold transition duration-300 ease-in-out bg-green-600 hover:bg-green-700"
                >
                  {dayPlan.tasksList.every((task: any) => task.completed) ? 'Completed!' : 'Mark All Done'}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={() => setStage('questions')}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
            >
              Regenerate Planner
            </button>
          </div>
        </section>
      )}
    </div>
  );
}; 