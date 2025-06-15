import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ExternalLink, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import type { NewsArticle } from "@/lib/types"

async function getNews(): Promise<NewsArticle[]> {
  const supabase = await createServerClient()
  const { data: news } = await supabase
    .from("news_articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(6)

  return news || []
}

export default async function HomePage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  const news = await getNews()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Level Up Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Gaming</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Track your progress, follow guided improvement plans, and stay updated with the latest esports news. Your
            journey to becoming a better gamer starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/auth">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
            >
              <Link href="#news">Latest News</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Everything You Need to Improve
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Game Tracker</CardTitle>
                <CardDescription className="text-gray-300">
                  Track your rank, stats, and performance across all your favorite games
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Guided Plans</CardTitle>
                <CardDescription className="text-gray-300">
                  Follow daily tasks and weekly missions designed to help you rank up
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Esports News</CardTitle>
                <CardDescription className="text-gray-300">
                  Stay updated with the latest patches, tournaments, and gaming news
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Latest Gaming News</h2>
            <Button
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
            >
              View All
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <Card
                key={article.id}
                className="bg-black/50 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-colors"
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={article.image_url || "/placeholder.svg?height=200&width=400"}
                      alt={article.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {article.genre}
                    </Badge>
                    <span className="text-sm text-gray-400">{article.source}</span>
                  </div>
                  <CardTitle className="text-white mb-2 line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="text-gray-300 line-clamp-3">{article.summary}</CardDescription>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-400">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Recently"}
                    </span>
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-white">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
