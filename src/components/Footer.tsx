import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-card py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-xl font-semibold text-foreground">
              Confia<span className="text-secondary">Maresme</span>
            </p>
            <p className="mt-1 text-base text-muted-foreground">{t('footer.tagline')}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-base text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">{t('nav.directory')}</Link>
            <Link to="/auth" className="hover:text-foreground transition-colors">{t('nav.signIn')}</Link>
            <Link to="/claim" className="hover:text-foreground transition-colors">{t('claim.title')}</Link>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ConfiaMaresme. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
