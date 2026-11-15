import './globals.css';
import { SITE, siteUrl } from '@/lib/site';
import { COUNTRIES } from '@/lib/countries';
import { fontClasses } from '@/lib/fonts';

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE.name, template: '%s' },
  description: SITE.description,
  applicationName: SITE.name,
  icons: { icon: '/icon.svg' },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function Layout({ children }) {
  return (
    <html lang={COUNTRIES[SITE.rootCountry].lang} className={fontClasses}>
      <body>{children}</body>
    </html>
  );
}
