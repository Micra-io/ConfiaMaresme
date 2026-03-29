export const TRADE_CATEGORIES = [
  { value: 'electrician', label: 'Electricista', icon: 'Zap' },
  { value: 'plumber', label: 'Fontanero', icon: 'Droplets' },
  { value: 'carpenter', label: 'Carpintero', icon: 'Hammer' },
  { value: 'painter', label: 'Pintor', icon: 'Paintbrush' },
  { value: 'general_handyman', label: 'Manitas', icon: 'Wrench' },
  { value: 'locksmith', label: 'Cerrajero', icon: 'KeyRound' },
  { value: 'gardener', label: 'Jardinero', icon: 'TreePine' },
  { value: 'cleaner', label: 'Limpieza', icon: 'Sparkles' },
  { value: 'mason', label: 'Albañil', icon: 'BrickWall' },
  { value: 'roofer', label: 'Tejador', icon: 'Home' },
  { value: 'hvac', label: 'Climatización', icon: 'Wind' },
  { value: 'sport_trainer', label: 'Entrenador', icon: 'Dumbbell' },
  { value: 'catering', label: 'Catering', icon: 'UtensilsCrossed' },
  { value: 'other', label: 'Otro', icon: 'MoreHorizontal' },
] as const;

export type TradeCategory = typeof TRADE_CATEGORIES[number]['value'];

export const getCategoryLabel = (value: string) => 
  TRADE_CATEGORIES.find(c => c.value === value)?.label ?? value;

export const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'ca', label: 'Català' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ar', label: 'العربية' },
  { value: 'zh', label: '中文' },
  { value: 'pt', label: 'Português' },
  { value: 'it', label: 'Italiano' },
  { value: 'ro', label: 'Română' },
  { value: 'uk', label: 'Українська' },
] as const;
