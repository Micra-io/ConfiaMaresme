import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO_DATA: Record<string, { title: string; description: string; lang: string }> = {
  es: {
    title: 'ConfiaMaresme — Profesionales de confianza en Barcelona y Maresme',
    description: 'Directorio de electricistas, fontaneros, carpinteros y más profesionales verificados por tu comunidad local en el Maresme y Barcelona. Contacto directo y opiniones reales.',
    lang: 'es',
  },
  ca: {
    title: 'ConfiaMaresme — Professionals de confiança a Barcelona i Maresme',
    description: "Directori d'electricistes, lampistes, fusters i més professionals verificats per la teva comunitat local al Maresme i Barcelona. Contacte directe i opinions reals.",
    lang: 'ca',
  },
  en: {
    title: 'ConfiaMaresme — Trusted Tradesmen in Barcelona & Maresme',
    description: 'Find trusted electricians, plumbers, carpenters and more — all verified by your local community in Maresme and Barcelona. Direct contact and real reviews.',
    lang: 'en',
  },
  ru: {
    title: 'ConfiaMaresme — Надёжные мастера в Барселоне и Маресме',
    description: 'Каталог электриков, сантехников, плотников и других специалистов, проверенных местным сообществом Маресме и Барселоны. Прямой контакт и реальные отзывы.',
    lang: 'ru',
  },
};

const SITE_URL = 'https://confiamaresme.com';

const SEOHead = () => {
  const { i18n } = useTranslation();
  const seo = SEO_DATA[i18n.language] || SEO_DATA.es;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ConfiaMaresme',
    url: SITE_URL,
    description: seo.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <html lang={seo.lang} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content="ConfiaMaresme" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />

      <link rel="canonical" href={SITE_URL} />
      {Object.entries(SEO_DATA).map(([code, data]) => (
        <link key={code} rel="alternate" hrefLang={data.lang} href={`${SITE_URL}?lang=${code}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={SITE_URL} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default SEOHead;
