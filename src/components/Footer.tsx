const Footer = () => (
  <footer className="border-t bg-card py-8">
    <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
      <p className="font-display text-lg font-semibold text-foreground">
        Confia<span className="text-secondary">Maresme</span>
      </p>
      <p className="mt-2">Profesionales verificados por la comunidad del Maresme y Barcelona.</p>
      <p className="mt-4">© {new Date().getFullYear()} ConfiaMaresme. Todos los derechos reservados.</p>
    </div>
  </footer>
);

export default Footer;
