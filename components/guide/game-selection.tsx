import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface GameSelectionProps {
  onGameSelect: (gameId: string) => void;
}

export const GameSelection: React.FC<GameSelectionProps> = ({ onGameSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('games').select('id, name').order('name');
      if (error) setError(error.message);
      else setGames((data as { id: string; name: string }[]) || []);
      setLoading(false);
    };
    fetchGames();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 font-inter p-4">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 text-center max-w-md w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-400 mb-4">
          Improvement Guides
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Follow structured plans to rank up and improve your gameplay.
        </p>
        <div className="relative inline-block text-left">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
          >
            {loading ? 'Loading...' : 'Available Guides'}
          </button>
          {showDropdown && (
            <div className="origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {error && <div className="text-red-400 px-4 py-2">{error}</div>}
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      onGameSelect(game.id);
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-600 hover:text-white rounded-md"
                    role="menuitem"
                  >
                    {game.name}
                  </button>
                ))}
                {games.length === 0 && !loading && !error && (
                  <div className="px-4 py-2 text-gray-400">No games found</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-12 bg-gray-700 rounded-xl p-8 flex flex-col items-center justify-center border border-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-blue-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-xl text-gray-300">Select a Guide</p>
          <p className="text-sm text-gray-400 mt-2">
            Choose a guide from the sidebar to start your improvement journey
          </p>
        </div>
      </div>
    </div>
  );
}; 