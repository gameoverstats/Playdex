"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, Calendar, Clock, Trophy, Target, ArrowRight } from "lucide-react"
import type { NewsArticle, Guide, Game } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

interface NewsArticleWithGame extends NewsArticle {
  game?: Game
}

interface GuideWithGame extends Guide {
  game?: Game
}

export default function HomePage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticleWithGame[]>([])
  const [esportsArticles, setEsportsArticles] = useState<NewsArticleWithGame[]>([])
  const [recentGuides, setRecentGuides] = useState<GuideWithGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest news articles
        const { data: newsData, error: newsError } = await supabase
          .from('news_articles')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(6)

        if (newsError) {
          console.error('Error fetching news:', newsError)
        } else if (newsData) {
          setNewsArticles(newsData as unknown as NewsArticleWithGame[])
        }

        // Fetch esports articles
        const { data: esportsData, error: esportsError } = await supabase
          .from('news_articles')
          .select('*')
          .eq('genre', 'esports')
          .order('published_at', { ascending: false })
          .limit(4)

        if (esportsError) {
          console.error('Error fetching esports:', esportsError)
        } else if (esportsData) {
          setEsportsArticles(esportsData as unknown as NewsArticleWithGame[])
        }

        // Fetch recent guides
        const { data: guidesData, error: guidesError } = await supabase
          .from('guides')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)

        if (guidesError) {
          console.error('Error fetching guides:', guidesError)
        } else if (guidesData) {
          // Fetch games data separately and combine
          const guideIds = guidesData.map(guide => guide.game_id)
          const { data: gamesData } = await supabase
            .from('games')
            .select('id, name, genre, icon_url')
            .in('id', guideIds)

          const gamesMap = new Map()
          if (gamesData) {
            gamesData.forEach(game => gamesMap.set(game.id, game))
          }

          const transformedGuides = guidesData.map(guide => ({
            ...guide,
            game: gamesMap.get(guide.game_id)
          })) as GuideWithGame[]
          
          setRecentGuides(transformedGuides)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500'
      case 'intermediate':
        return 'bg-yellow-500'
      case 'advanced':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const NewsCard = ({ article }: { article: NewsArticleWithGame }) => (
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
  )

  const GuideCard = ({ guide }: { guide: GuideWithGame }) => (
    <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg line-clamp-2 hover:text-purple-400 transition-colors">
              {guide.title}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2 line-clamp-2">
              {guide.description}
            </CardDescription>
          </div>
          {guide.game?.icon_url && (
            <div className="ml-4 flex-shrink-0">
              <Image
                src={guide.game.icon_url}
                alt={guide.game.name}
                width={60}
                height={60}
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
              <Clock className="h-4 w-4 mr-1" />
              {guide.estimated_days} days
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              {guide.game?.name || 'Unknown Game'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              className={`${getDifficultyColor(guide.difficulty_level)} text-white`}
            >
              {guide.difficulty_level}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const LoadingSkeleton = () => (
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
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-12">
            {/* Latest News Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Latest News</h2>
                <Skeleton className="h-8 w-20" />
              </div>
              <LoadingSkeleton />
            </section>

            {/* Esports Highlights Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Esports Highlights</h2>
                <Skeleton className="h-8 w-20" />
              </div>
              <LoadingSkeleton />
            </section>

            {/* Recent Guides Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recently Posted Guides</h2>
                <Skeleton className="h-8 w-20" />
              </div>
              <LoadingSkeleton />
            </section>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to <span className="text-purple-400">GameTracker</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your ultimate destination for gaming news, esports highlights, and improvement guides
            </p>
          </div>
        </section>

        <div className="space-y-12">
          {/* Latest News Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-purple-400" />
                Latest News
              </h2>
              <Link href="/news">
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          {/* Esports Highlights Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Target className="h-6 w-6 mr-2 text-purple-400" />
                Esports Highlights
              </h2>
              <Link href="/news?genre=esports">
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {esportsArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          {/* Recent Guides Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Target className="h-6 w-6 mr-2 text-purple-400" />
                Recently Posted Guides
              </h2>
              <Link href="/guide">
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 