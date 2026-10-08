import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">✈️ SkyWings Airways</h1>
          <div className="space-x-6">
            <Link href="/search" className="text-gray-700 hover:text-blue-600 font-medium">
              Search Flights
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center text-white">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Fly the World with SkyWings
        </h2>
        <p className="text-xl md:text-2xl mb-10 opacity-90">
          Book flights to 50+ destinations worldwide
        </p>
        <Link
          href="/search"
          className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
        >
          Search Flights →
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '🛡️', title: 'Safe Travel', desc: 'IATA certified airline with global safety standards' },
          { icon: '💰', title: 'Best Prices', desc: 'AI-powered dynamic pricing for the best deals' },
          { icon: '🌍', title: '24/7 Support', desc: 'AI chatbot in 10+ languages, always available' },
        ].map((f) => (
          <div key={f.title} className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
