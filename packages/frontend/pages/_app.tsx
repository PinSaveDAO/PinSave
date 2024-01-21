import "@/styles/globals.css";
import LayoutApp from "@/components/Layout";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NextHead from "next/head";
import { useMemo } from "react";
import type { NextComponentType } from "next";
import type AppProps from "next/app";

type NextAppProps<P = any> = AppProps & {
  pageProps: P;
  Component: NextComponentType & {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  };
} & Omit<AppProps<P>, "pageProps">;

function MyApp({ Component, pageProps }: NextAppProps) {
  const queryClient = new QueryClient();
  const livepeerClient = useMemo(() => {
    return createReactClient({
      provider: studioProvider({
        apiKey: process.env.NEXT_PUBLIC_LIVEPEER,
      }),
    });
  }, []);

  return (
    <MantineProvider
      theme={{
        colorScheme: "light",
        primaryColor: "green",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <NextHead>
          <title>Pin Save - decentralized Pinterest</title>
        </NextHead>
        <NotificationsProvider>
          <LivepeerConfig client={livepeerClient}>
            <LayoutApp>
              <Component {...pageProps} />
            </LayoutApp>
          </LivepeerConfig>
        </NotificationsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default MyApp;
