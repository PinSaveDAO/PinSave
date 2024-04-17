import "@/styles/globals.css";

import type { NextComponentType } from "next";
import type AppProps from "next/app";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";

import LayoutApp from "@/components/Layout";
import { AddressProvider } from "context";

type NextAppProps<P = any> = AppProps & {
  pageProps: P;
  Component: NextComponentType & {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  };
} & Omit<AppProps<P>, "pageProps">;

function MyApp({ Component, pageProps }: NextAppProps) {
  const queryClient: QueryClient = new QueryClient();
  return (
    <MantineProvider
      theme={{
        colorScheme: "light",
        primaryColor: "green",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>
          <AddressProvider>
            <LayoutApp>
              <Component {...pageProps} />
            </LayoutApp>
          </AddressProvider>
        </NotificationsProvider>
      </QueryClientProvider>
      <Analytics />
    </MantineProvider>
  );
}

export default MyApp;
