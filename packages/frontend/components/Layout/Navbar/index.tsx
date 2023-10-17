// import { UauthButton } from "@/components/auth/UAuthButton";
import {
  createStyles,
  Text,
  Header,
  Container,
  Group,
  Burger,
  Paper,
  Transition,
} from "@mantine/core";
import { useBooleanToggle } from "@mantine/hooks";
import { useMediaQuery } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
    zIndex: 1,
  },

  dropdown: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",

    [theme.fn.largerThan("md")]: {
      display: "none",
    },
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },

  links: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("md")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.lg,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
          : theme.colors[theme.primaryColor][0],
      color:
        theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7],
    },
  },
}));

interface NavbarProps {
  links: { link: string; label: string }[];
}

export function Navbar({ links }: NavbarProps) {
  const [opened, toggleOpened] = useBooleanToggle(false);
  const { classes, cx } = useStyles();
  const router = useRouter();
  const largeScreen = useMediaQuery("(min-width: 600px)");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const items = links.map((link) => (
    <Link key={link.label} href={link.link} passHref>
      <Text
        className={cx(classes.link, {
          [classes.linkActive]: router.asPath === link.link,
        })}
      >
        {link.label}
      </Text>
    </Link>
  ));

  return (
    <div>
      {isClient ? (
        <Header height={largeScreen ? 60 : 90} mb={10} className={classes.root}>
          <Container className={classes.header}>
            <Link href="/">
              <Image
                src={largeScreen ? "/PinSaveL.png" : "/Pin.png"}
                alt="Pin Save EVM"
                width={largeScreen ? 140 : 30}
                height={largeScreen ? 35 : 30}
                priority
              />
            </Link>
            <Group spacing={5} className={classes.links}>
              {items}
            </Group>
            <Group spacing={5}>
              <ConnectButton
                accountStatus={{
                  smallScreen: "avatar",
                  largeScreen: "full",
                }}
              />
              <Burger
                opened={opened}
                onClick={() => toggleOpened()}
                className={classes.burger}
                size="sm"
              />
            </Group>

            <Transition
              transition="pop-top-right"
              duration={200}
              mounted={opened}
            >
              {(styles) => (
                <Paper className={classes.dropdown} withBorder style={styles}>
                  {items}
                </Paper>
              )}
            </Transition>
          </Container>
        </Header>
      ) : null}
    </div>
  );
}
