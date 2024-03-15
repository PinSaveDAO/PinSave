import "@/styles/globals.css";
import type { NextComponentType } from "next";
import type AppProps from "next/app";
import NextHead from "next/head";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import LayoutApp from "@/components/Layout";
import { AddressProvider } from "context";

type NextAppProps<P = any> = AppProps & {
  pageProps: P;
  Component: NextComponentType & {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  };
} & Omit<AppProps<P>, "pageProps">;

function MyApp({ Component, pageProps }: NextAppProps) {
  const queryClient = new QueryClient();

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
          <AddressProvider>
            <LayoutApp>
              <Component {...pageProps} />
            </LayoutApp>
          </AddressProvider>
        </NotificationsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default MyApp;
