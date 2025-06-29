"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GameCardProps {
  title: string;
  description: string;
  days: number;
  difficulty: "Easy" | "Medium" | "Hard";
  iconUrl: string;
  onSelect: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  days,
  difficulty,
  iconUrl,
  onSelect,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
      <div className="relative h-32 w-full">
        <Image
          src={iconUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-300 text-sm flex-1">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <Badge className="bg-blue-600 text-white">{difficulty}</Badge>
          <span className="text-gray-400 text-sm">{days} days</span>
        </div>
        <Button
          className="mt-4 w-full"
          onClick={onSelect}
        >
          Start Plan
        </Button>
      </div>
    </div>
  );
};
