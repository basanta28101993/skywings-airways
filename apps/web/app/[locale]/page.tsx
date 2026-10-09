import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">✈️ SkyWings Airways</h1>
          <div className="flex items-center gap-4">
            <Link href="/search" className="text-gray-700 hover:text-blue-600 font-medium">
              {t('nav.search')}
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
              {t('nav.login')}
            </Link>
            <LanguageSwitcher />
            <Link
              href="/search"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {t('home.cta')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative bg-cover bg-center min-h-[600px] flex items-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-600/60"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center text-white w-full">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            {t('home.title')}
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-95 drop-shadow">
            {t('home.subtitle')}
          </p>

          {/* Booking Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('search.from')}
                </label>
                <input
                  defaultValue="DEL"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 font-semibold"
                  placeholder="DEL"
                />
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('search.to')}
                </label>
                <input
                  defaultValue="BOM"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 font-semibold"
                  placeholder="BOM"
                />
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('search.date')}
                </label>
                <input
                  type="date"
                  defaultValue="2026-12-01"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 font-semibold"
                />
              </div>
              <div className="flex items-end">
                <Link
                  href="/search"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-center shadow-lg"
                >
                  🔍 {t('home.cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="text-5xl mb-4">🛡️</div>
            <h4 className="font-bold text-xl mb-3 text-gray-800">{t('home.feature1Title')}</h4>
            <p className="text-gray-600 leading-relaxed">{t('home.feature1Desc')}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="text-5xl mb-4">💰</div>
            <h4 className="font-bold text-xl mb-3 text-gray-800">{t('home.feature2Title')}</h4>
            <p className="text-gray-600 leading-relaxed">{t('home.feature2Desc')}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="text-5xl mb-4">🌍</div>
            <h4 className="font-bold text-xl mb-3 text-gray-800">{t('home.feature3Title')}</h4>
            <p className="text-gray-600 leading-relaxed">{t('home.feature3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h4 className="text-2xl font-bold mb-4">✈️ SkyWings Airways</h4>
          <p className="text-gray-400 mb-6">{t('home.subtitle')}</p>
          <p className="text-gray-500 text-sm">© 2026 SkyWings Airways • Demo Project</p>
        </div>
      </footer>
    </main>
  );
}
