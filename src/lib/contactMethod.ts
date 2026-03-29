export type ContactAction = {
  type: 'whatsapp' | 'call' | 'sms' | 'email' | 'unavailable';
  href: string | null;
  labelKey: string;
  iconName: 'MessageCircle' | 'Phone' | 'MessageSquare' | 'Mail' | 'Ban';
  colorClass: string;
  badgeColorClass: string;
};

interface TradesmanContact {
  whatsapp_reachable: string;
  contact_method: string;
  whatsapp_number: string | null;
  alternate_contact?: string | null;
}

function phoneHref(number: string | null, prefix: string): string | null {
  if (!number) return null;
  return `${prefix}${number.replace(/\D/g, '')}`;
}

export function getPrimaryContact(t: TradesmanContact): ContactAction {
  const { whatsapp_reachable, contact_method, whatsapp_number, alternate_contact } = t;

  // contact_method = 'none' → always unavailable
  if (contact_method === 'none') {
    return { type: 'unavailable', href: null, labelKey: 'contact.unavailable', iconName: 'Ban', colorClass: '', badgeColorClass: '' };
  }

  // email
  if (contact_method === 'email') {
    return {
      type: 'email',
      href: alternate_contact ? `mailto:${alternate_contact}` : null,
      labelKey: 'contact.email',
      iconName: 'Mail',
      colorClass: 'bg-[hsl(var(--contact-email))] text-[hsl(var(--contact-email-foreground))] hover:bg-[hsl(var(--contact-email))]/90',
      badgeColorClass: 'text-[hsl(var(--contact-email))]',
    };
  }

  // unreachable + phone_call
  if (whatsapp_reachable === 'unreachable' && contact_method === 'phone_call') {
    return {
      type: 'call',
      href: phoneHref(whatsapp_number, 'tel:+'),
      labelKey: 'contact.call',
      iconName: 'Phone',
      colorClass: 'bg-[hsl(var(--contact-call))] text-[hsl(var(--contact-call-foreground))] hover:bg-[hsl(var(--contact-call))]/90',
      badgeColorClass: 'text-[hsl(var(--contact-call))]',
    };
  }

  // unreachable + sms
  if (whatsapp_reachable === 'unreachable' && contact_method === 'sms') {
    return {
      type: 'sms',
      href: phoneHref(whatsapp_number, 'sms:+'),
      labelKey: 'contact.sms',
      iconName: 'MessageSquare',
      colorClass: 'bg-muted-foreground text-background hover:bg-muted-foreground/90',
      badgeColorClass: 'text-muted-foreground',
    };
  }

  // unreachable + no valid fallback
  if (whatsapp_reachable === 'unreachable' && !alternate_contact) {
    return { type: 'unavailable', href: null, labelKey: 'contact.unavailable', iconName: 'Ban', colorClass: '', badgeColorClass: '' };
  }

  // verified or unknown with whatsapp → show whatsapp
  return {
    type: 'whatsapp',
    href: whatsapp_number ? `https://wa.me/${whatsapp_number.replace(/\D/g, '')}` : null,
    labelKey: 'contact.whatsapp',
    iconName: 'MessageCircle',
    colorClass: 'bg-success text-success-foreground hover:bg-success/90',
    badgeColorClass: 'text-success',
  };
}

export function getSecondaryContact(t: TradesmanContact): ContactAction | null {
  const { whatsapp_reachable, contact_method, whatsapp_number } = t;

  // unknown + whatsapp → show call fallback
  if (whatsapp_reachable === 'unknown' && contact_method === 'whatsapp' && whatsapp_number) {
    return {
      type: 'call',
      href: phoneHref(whatsapp_number, 'tel:+'),
      labelKey: 'contact.callFallback',
      iconName: 'Phone',
      colorClass: 'bg-[hsl(var(--contact-call))] text-[hsl(var(--contact-call-foreground))] hover:bg-[hsl(var(--contact-call))]/90',
      badgeColorClass: 'text-[hsl(var(--contact-call))]',
    };
  }

  return null;
}

export function isContactUnavailable(t: TradesmanContact): boolean {
  return getPrimaryContact(t).type === 'unavailable';
}
