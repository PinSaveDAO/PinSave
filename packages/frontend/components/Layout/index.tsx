import { Navbar } from "./Navbar";
import { AppShell } from "@mantine/core";
import React from "react";

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
            { label: "Mina", link: "/mina" },
          ]}
        />
      }
    >
      {children}
    </AppShell>
  );
};

export default LayoutApp;
