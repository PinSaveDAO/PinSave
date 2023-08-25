import { Button } from "@mantine/core";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function LoginButton() {
  const { connect, connectors } = useConnect();

  const onClick = async () => {
    connect({ connector: connectors[0] });
  };

  return (
    <Button
      radius="md"
      leftIcon={
        <Image
          src="/UnstoppableDomains.png"
          width={30}
          height={30}
          alt="Picture of the author"
        />
      }
      sx={() => ({
        backgroundColor: "#0D67FE",
        "&:hover": {
          backgroundColor: "#0546B7",
        },
      })}
      onClick={onClick}
    >
      Login with Unstoppable
    </Button>
  );
}

function LogoutButton() {
  const { disconnect } = useDisconnect();

  const onClick = async () => {
    disconnect();
  };

  return (
    <Button
      radius="md"
      leftIcon={
        <Image
          src="/UnstoppableDomains.png"
          width={30}
          height={30}
          alt="Picture of the author"
        />
      }
      sx={() => ({
        backgroundColor: "#0D67FE",
        "&:hover": {
          backgroundColor: "#0546B7",
        },
      })}
      onClick={onClick}
    >
      Logout
    </Button>
  );
}

export function UauthButton() {
  const { address } = useAccount();
  if (address) {
    return <LogoutButton />;
  }
  return <LoginButton />;
}
