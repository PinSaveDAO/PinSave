import Document, {
  Html,
  Main,
  NextScript,
  DocumentContext,
  Head,
} from "next/document";
import { Analytics } from "@vercel/analytics/react";

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
          <link rel="icon" href="/pin.svg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        <Analytics />
      </Html>
    );
  }
}

export default MyDocument;
