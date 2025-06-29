"use client";

import { useState } from "react";
import { GameSelection } from "@/components/guide/GameSelection";
import { GameCard } from "@/components/guide/GameCard";
import { GameGuide } from "@/components/guide/game-guide";

// dummy plan data
import { pubgQuestions } from "@/lib/questions/pubg";
import { valoQuestions } from "@/lib/questions/valo";
import { codmQuestions } from "@/lib/questions/codm";
import { freefireQuestions } from "@/lib/questions/freefire";
import { apexQuestions } from "@/lib/questions/apex";

export const allGames = [
  {
    id: "PUBG",
    name: "PUBG: Battlegrounds",
    icon: "/images/pubg.jpg",
    questions: pubgQuestions,
    preMade: [
      { title: "Beginner Blitz", difficulty: "Easy", days: 3, description: "Fast-track your first wins." },
      { title: "Rank Rider", difficulty: "Medium", days: 7, description: "Climb from Bronze to Gold." },
      { title: "Conqueror Quest", difficulty: "Hard", days: 14, description: "Master every skill." },
    ],
  },
  {
    id: "Valorant",
    name: "Valorant",
    icon: "/images/valorant.jpg",
    questions: valoQuestions,
    preMade: [
      { title: "Aim Academy", difficulty: "Easy", days: 5, description: "Sharpen your aim." },
      { title: "Spike Strategist", difficulty: "Medium", days: 10, description: "Tactical mastery." },
      { title: "Rank Radiance", difficulty: "Hard", days: 21, description: "Ascend to Immortal." },
    ],
  },
  {
    id: "CODM",
    name: "Call of Duty Mobile",
    icon: "/images/codm.jpg",
    questions: codmQuestions,
    preMade: [],
  },
  {
    id: "FreeFire",
    name: "Free Fire",
    icon: "/images/freefire.jpg",
    questions: freefireQuestions,
    preMade: [],
  },
  {
    id: "Apex",
    name: "Apex Legends",
    icon: "/images/apex.jpg",
    questions: apexQuestions,
    preMade: [],
  },
];

export default function GuidePage() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [pickedPlan, setPickedPlan] = useState<number | null>(null);

  const selectedGame = allGames.find((g) => g.id === selectedGameId);

  if (!selectedGame) {
    return (
      <GameSelection
        games={allGames}
        onGameSelect={(id) => setSelectedGameId(id)}
      />
    );
  }

  const onGeneratePlan = async (formData: any) => {
    const { currentRank, desiredRank, developmentAreas } = formData;
    return {
      title: `${selectedGame.name} Weekly Plan`,
      subtitle: `Improve from ${currentRank} focusing on ${developmentAreas.join(", ")}`,
      tasks: Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        focusArea: developmentAreas[i % developmentAreas.length],
        tasksList: [
          { text: `Practice ${developmentAreas[i % developmentAreas.length]}`, completed: false },
          { text: "Play 2 matches", completed: false },
        ],
      })),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="flex items-center mb-8 space-x-6">
        <img src={selectedGame.icon} alt={selectedGame.name} className="h-20 w-20 rounded-lg shadow-lg" />
        <h1 className="text-4xl font-extrabold text-white">{selectedGame.name} Guides</h1>
      </div>

      {!pickedPlan ? (
        <>
          <h2 className="text-2xl text-gray-200 mb-4">Pick a Pre-Made Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {selectedGame.preMade.map((plan, idx) => (
              <GameCard
                key={idx}
                title={plan.title}
                description={plan.description}
                difficulty={plan.difficulty as any}
                days={plan.days}
                iconUrl={selectedGame.icon}
                onSelect={() => setPickedPlan(idx)}
              />
            ))}
          </div>
          <div className="text-center">
            <button
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              onClick={() => setPickedPlan(-1)}
            >
              Customize Your Own Plan
            </button>
          </div>
        </>
      ) : (
        <GameGuide
          gameName={selectedGame.name}
          questions={selectedGame.questions}
          onGeneratePlan={onGeneratePlan}
        />
      )}
    </div>
  );
}
