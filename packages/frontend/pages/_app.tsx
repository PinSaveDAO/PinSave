import "@/styles/globals.css";
import LayoutApp from "@/components/Layout";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NextHead from "next/head";
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
          <LayoutApp>
            <Component {...pageProps} />
          </LayoutApp>
        </NotificationsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default MyApp;
