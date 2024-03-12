import { AppShell } from "@mantine/core";

import { Navbar } from "./Navbar";

interface LayoutProps {
  children: JSX.Element;
}

const LayoutApp = ({ children }: LayoutProps) => {
  return (
    <AppShell
      styles={{
        main: {
          paddingTop: 0,
          paddingRight: 0,
          paddingLeft: 0,
          paddingBottom: 0,
          minHeight: 0,
        },
      }}
      header={
        <Navbar
          links={[
            { label: "Home", link: "/" },
            { label: "Upload", link: "/upload" },
          ]}
        />
      }
    >
      {children}
    </AppShell>
  );
};

export default LayoutApp;
