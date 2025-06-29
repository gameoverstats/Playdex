"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";

export interface GameInfo {
  id: string;
  name: string;
  icon: string;
  category?: string;
}

interface GameSelectionProps {
  games: GameInfo[];
  onGameSelect: (gameId: string) => void;
}

export const GameSelection: React.FC<GameSelectionProps> = ({ games, onGameSelect }) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return games.filter((g) =>
      g.name.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q)
    );
  }, [search, games]);

  const featured = games.slice(0, 6); // fixed featured, not filtered

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      {/* ——— 1️⃣ Featured Games ——— */}
      <h2 className="text-2xl font-bold">Featured Games</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {featured.map((g) => (
          <div key={g.id} className="flex-shrink-0 w-40">
            <div
              onClick={() => onGameSelect(g.id)}
              className="relative h-24 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition"
            >
              <Image src={g.icon} alt={g.name} fill className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-sm text-white p-1 text-center truncate">
                {g.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ——— 2️⃣ Search ——— */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* ——— 3️⃣ Grid ——— */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filtered.length > 0 ? (
          filtered.map((g) => (
            <div
              key={g.id}
              onClick={() => onGameSelect(g.id)}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl transition"
            >
              <div className="relative h-32">
                <Image src={g.icon} alt={g.name} fill className="object-cover" />
              </div>
              <div className="p-2">
                <h3 className="font-semibold text-white truncate">{g.name}</h3>
                {g.category && <p className="text-xs text-gray-400">{g.category}</p>}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            {search ? "No games match your search." : "No more games to show."}
          </div>
        )}
      </div>
    </div>
  );
};
