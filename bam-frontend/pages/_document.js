import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />
          <meta property="og:site_name" content="BAMfers" />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content="en" />
          <meta property="og:url" content="https://bamfers.club" />
          {/* <meta name="theme-color" content="#47F066" /> */}
          <meta property="og:image:width" content="400" />
          <meta property="og:image:height" content="153" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:image" content="/images/icon310.png" />
          <meta
            property="description"
            content="3,333 Bored Azuki mfers. inspired by Azuki, Bored Ape Yacht Club, mfers. No official discord, No roadmap, No drama, Just mfers."
          />
          <meta
            property="og:description"
            content="3,333 Bored Azuki mfers. inspired by Azuki, Bored Ape Yacht Club, mfers. No official discord, No roadmap, No drama, Just mfers."
          />
          <meta property="og:title" content="BAMfers" />
          <meta name="twitter:image" content="/images/icon310.png" />
          <meta name="twitter:title" content="BAMfers" />
          <meta
            property="twitter:description"
            content="3,333 Bored Azuki mfers. inspired by Azuki, Bored Ape Yacht Club, mfers. No official discord, No roadmap, No drama, Just mfers."
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin={'true'}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
