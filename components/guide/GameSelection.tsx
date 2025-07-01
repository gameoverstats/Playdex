"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Select from "react-select";

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

const genreTabs = [
  "FPS",
  "RPG",
  "MOBA",
  "MMO",
  "Gacha",
  "Strategy",
  "Battle Royale",
];

const genreOptions = genreTabs.map((genre) => ({
  label: genre,
  value: genre,
}));

export const GameSelection: React.FC<GameSelectionProps> = ({
  games,
  onGameSelect,
}) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null); // For buttons
  const [selectedGenres, setSelectedGenres] = useState<
    { label: string; value: string }[]
  >([]); // For dropdown

  const filteredGames = useMemo(() => {
    const query = search.toLowerCase();

    return games.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(query);

      const matchesDropdownGenre =
        selectedGenres.length === 0 ||
        selectedGenres.some((genre) =>
          g.category?.toLowerCase().includes(genre.value.toLowerCase())
        );

      const matchesTabGenre =
        !activeTab || g.category?.toLowerCase().includes(activeTab.toLowerCase());

      return matchesSearch && matchesDropdownGenre && matchesTabGenre;
    });
  }, [search, selectedGenres, activeTab, games]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      {/* —— Trending Genres Heading —— */}
      <h2 className="text-3xl font-bold">Trending Genres</h2>

      {/* —— Genre Buttons —— */}
      <div className="flex flex-wrap gap-3">
        <button
          className={`px-4 py-1 rounded-full text-sm transition ${
            activeTab === null
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
          onClick={() => setActiveTab(null)}
        >
          All
        </button>
        {genreTabs.map((genre) => (
          <button
            key={genre}
            className={`px-4 py-1 rounded-full text-sm transition ${
              activeTab === genre
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
            onClick={() =>
              setActiveTab((prev) => (prev === genre ? null : genre))
            }
          >
            {genre}
          </button>
        ))}
      </div>

      {/* —— Guide Section —— */}
      <div className="space-y-2">
        <div className="text-xl font-semibold mb-1">Guides</div>

        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-[60%] bg-gray-800 text-white placeholder-gray-400 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div className="w-full md:w-72 text-black">
            <Select
              isMulti
              options={genreOptions}
              value={selectedGenres}
              onChange={(options) =>
                setSelectedGenres(options as typeof selectedGenres)
              }
              placeholder="Filter by Genre"
              className="text-sm"
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* —— Game Grid —— */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((g) => (
            <div
              key={g.id}
              onClick={() => onGameSelect(g.id)}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl transition"
            >
              <div className="relative h-32">
                <Image
                  src={g.icon}
                  alt={g.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-md text-white p-2 text-center truncate">
                  {g.name}
                </div>
              </div>
              {g.category && (
                <div className="p-2">
                  <p className="text-xs text-gray-400">{g.category}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            {search || selectedGenres.length || activeTab
              ? "No games match your filters."
              : "No trending games available."}
          </div>
        )}
      </div>
    </div>
  );
};
