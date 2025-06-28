"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Calendar } from "lucide-react";
import type { NewsArticle } from "@/lib/types";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

const GENRES = [
  "all",
  "esports",
  "FPS",
  "MOBA",
  "Battle Royale",
  "Sports",
];

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const genreParam = searchParams.get("genre");
    if (genreParam && GENRES.includes(genreParam)) {
      setSelectedGenre(genreParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      let query = supabase.from("news_articles").select("*").order("published_at", { ascending: false });
      if (selectedGenre && selectedGenre !== "all") {
        query = query.eq("genre", selectedGenre);
      }
      const { data, error } = await query;
      if (!error && data) {
        setNews(data as unknown as NewsArticle[]);
      }
      setLoading(false);
    };
    fetchNews();
  }, [selectedGenre]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const NewsCard = ({ article }: { article: NewsArticle }) => (
    <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg line-clamp-2 hover:text-purple-400 transition-colors">
              {article.title}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2 line-clamp-3">
              {article.summary}
            </CardDescription>
          </div>
          {article.image_url && (
            <div className="ml-4 flex-shrink-0">
              <Image
                src={article.image_url}
                alt={article.title}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(article.published_at || article.created_at)}
            </div>
            {article.source && (
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                {article.source}
              </div>
            )}
          </div>
          {article.genre && (
            <Badge variant="secondary" className="bg-purple-600 text-white">
              {article.genre}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-zinc-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">All News</h1>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-150 ${selectedGenre === genre ? "bg-purple-600 text-white border-purple-600" : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-purple-700 hover:text-white"}`}
                onClick={() => {
                  setSelectedGenre(genre);
                  router.replace(`/news${genre !== "all" ? `?genre=${genre}` : ""}`);
                }}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-gray-400 text-center py-12">No news articles found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 