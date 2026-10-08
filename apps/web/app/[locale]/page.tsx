import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function Home() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600">
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">✈️ SkyWings Airways</h1>
          <div className="space-x-6">
            <Link href="/search" className="text-gray-700 hover:text-blue-600 font-medium">
              {t('nav.search')}
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 py-24 text-center text-white">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">{t('home.title')}</h2>
        <p className="text-xl md:text-2xl mb-10 opacity-90">{t('home.subtitle')}</p>
        <Link
          href="/search"
          className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
        >
          {t('home.cta')} →
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">{t('home.feature1Title')}</h3>
          <p className="text-gray-600">{t('home.feature1Desc')}</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">{t('home.feature2Title')}</h3>
          <p className="text-gray-600">{t('home.feature2Desc')}</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">{t('home.feature3Title')}</h3>
          <p className="text-gray-600">{t('home.feature3Desc')}</p>
        </div>
      </section>
    </main>
  );
}
