import { AppShell } from "@mantine/core";
import React from "react";
import { Navbar } from "./Navbar";
interface LayoutProps {
  children: JSX.Element;
}
const LayoutApp = ({ children }: LayoutProps) => {
  return (
    <AppShell
      header={
        <Navbar
          links={[
            { label: "Home", link: "/" },
            { label: "Upload", link: "/upload" },
            { label: "Profile", link: "/profile" },
          ]}
        />
      }
    >
      {children}
    </AppShell>
  );
};

export default LayoutApp;
