import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO_DATA: Record<string, { title: string; description: string; lang: string }> = {
  es: {
    title: 'ConfiaMaresme — Profesionales de confianza en el Maresme',
    description: 'Encuentra electricistas, fontaneros, carpinteros y más profesionales verificados por tu comunidad local en el Maresme y Barcelona.',
    lang: 'es',
  },
  ca: {
    title: 'ConfiaMaresme — Professionals de confiança al Maresme',
    description: "Troba electricistes, lampistes, fusters i més professionals verificats per la teva comunitat local al Maresme i Barcelona.",
    lang: 'ca',
  },
  en: {
    title: 'ConfiaMaresme — Trusted professionals in Maresme',
    description: 'Find electricians, plumbers, carpenters and more professionals verified by your local community in Maresme and Barcelona.',
    lang: 'en',
  },
  ru: {
    title: 'ConfiaMaresme — Надёжные специалисты в Маресме',
    description: 'Найдите электриков, сантехников, плотников и других специалистов, проверенных местным сообществом Маресме и Барселоны.',
    lang: 'ru',
  },
};

const SITE_URL = 'https://confiamaresme.com';

const SEOHead = () => {
  const { i18n } = useTranslation();
  const seo = SEO_DATA[i18n.language] || SEO_DATA.es;

  return (
    <Helmet>
      <html lang={seo.lang} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <link rel="canonical" href={SITE_URL} />
      {Object.entries(SEO_DATA).map(([code, data]) => (
        <link key={code} rel="alternate" hrefLang={data.lang} href={`${SITE_URL}?lang=${code}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
    </Helmet>
  );
};

export default SEOHead;
