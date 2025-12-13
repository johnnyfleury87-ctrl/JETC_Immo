import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/branding/jetc/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/branding/jetc/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/branding/jetc/logo.png" />
        <link rel="shortcut icon" href="/branding/jetc/logo.png" />
        
        {/* Meta tags */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="description" content="JETC IMMO - La plateforme collaborative pour la gestion immobilière" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
