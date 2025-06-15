export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to Gaming Tracker!</h1>
      <p className="mb-4">You have successfully signed up. Start tracking your games now!</p>
      <a href="/tracker" className="text-purple-700 underline">Go to Tracker</a>
    </div>
  )
} 