import Document, {
  Html,
  Main,
  NextScript,
  DocumentContext,
  Head,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta
            name="description"
            content="Pin Save is a platform for decentralized content aggregation and image sharing where users have content ownership."
          />
          <link rel="icon" href="/favicon.svg" />
          <meta
            property="og:image"
            content="https://pinsave.app/TwitterIconWords.png"
          />
          <meta property="og:url" content="https://pinsave.app/" />
          <meta
            property="og:title"
            content="Pin Save - decentralized Pinterest"
          />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@pinsav3" />
          <meta name="twitter:creator" content="@pfedprog" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
