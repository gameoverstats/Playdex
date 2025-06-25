"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, Compass, BookOpen, Newspaper, Users, Clock, Folder } from "lucide-react";
import Link from "next/link";

// Define your sidebar sections and example icons
const sections = [
  {
    title: "Main",
    items: [
      { label: "Home", icon: <Home />, href: "/home-page" },
      { label: "Tracker", icon: <Compass />, href: "/tracker" },
      { label: "Guide", icon: <BookOpen />, href: "/guide" },
    ],
  },
  {
    title: "Game News",
    items: [
      { label: "Latest Updates", icon: <Newspaper />, href: "#" },
      { label: "Patch Notes", icon: <Newspaper />, href: "#" },
    ],
  },
  {
    title: "Game Guides",
    items: [
      { label: "Leveling Guide", icon: <BookOpen />, href: "#" },
      { label: "Boss Guide", icon: <BookOpen />, href: "#" },
    ],
  },
  {
    title: "Connect People",
    items: [
      { label: "Forums", icon: <Users />, href: "#" },
      { label: "Discord", icon: <Users />, href: "#" },
    ],
  },
  {
    title: "Recent",
    items: [
      { label: "Recent Posts", icon: <Clock />, href: "#" },
      { label: "Recent Guides", icon: <Clock />, href: "#" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Mods", icon: <Folder />, href: "#" },
      { label: "Tools", icon: <Folder />, href: "#" },
    ],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`h-full bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Toggle button */}
      <div className="p-2 flex justify-end">
        <button onClick={() => setIsOpen(!isOpen)} className="p-1">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section, i) => (
          <div key={i} className="px-2 py-2">
            {isOpen && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">{section.title}</h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, j) => (
                <li key={j}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-700 transition text-sm"
                  >
                    <span className="text-white">{item.icon}</span>
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
