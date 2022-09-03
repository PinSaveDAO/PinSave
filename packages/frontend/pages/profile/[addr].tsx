import { Text, Title, Box } from "@mantine/core";

const ProfilePage = ({ user }: { user: any }) => {
  return (
    <Box
      sx={(theme) => ({
        display: "block",
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color:
          theme.colorScheme === "dark"
            ? theme.colors.blue[4]
            : theme.colors.blue[7],
        textAlign: "center",
        padding: theme.spacing.xl,
        borderRadius: theme.radius.md,
        cursor: "pointer",

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[5]
              : theme.colors.gray[1],
        },
      })}
    >
      <Title align="center">{user.name}</Title>
      <Text
        component="span"
        align="center"
        variant="gradient"
        gradient={{ from: "indigo", to: "cyan", deg: 45 }}
        size="xl"
        weight={700}
        style={{ fontFamily: "Greycliff CF, sans-serif" }}
      >
        {user.description}
      </Text>
      <Title align="center" color="blue.5">
        [{user.tags}]
      </Title>
    </Box>
  );
};

export async function getServerSideProps(context: { params: { addr: any } }) {
  const { addr } = context.params;
  const user = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_ENDPOINT ?? "https://evm.pinsave.app/"
    }api/lukso/l14/${addr}`
  );
  const data = await user.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  if (data.ProfileData[1].name === "LSP3Profile") {
    const profile = data.ProfileData[1].value.LSP3Profile;
    return {
      props: { user: profile },
    };
  }

  return {
    props: { user: data },
  };
}

export default ProfilePage;
