import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-card py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p className="font-display text-lg font-semibold text-foreground">
          Confia<span className="text-secondary">Maresme</span>
        </p>
        <p className="mt-2">{t('footer.tagline')}</p>
        <p className="mt-4">© {new Date().getFullYear()} ConfiaMaresme. {t('footer.rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
