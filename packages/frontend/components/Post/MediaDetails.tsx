import type { IndividualPost } from "@/services/upload";
import { Paper, Text, Title, Button } from "@mantine/core";
import React, { useEffect, useState } from "react";

interface IMyProps {
  post: IndividualPost;
}

const MediaDetails: React.FC<IMyProps> = ({ post }) => {
  const postNumber = Number(post.id);
  const [totalSupply, setTotalSupply] = useState(null);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const response = await fetch("/api/totalSupply");
        const data = await response.json();
        setTotalSupply(data.totalSupply);
      } catch (error) {
        console.error("Error fetching media details: ", error);
      }
    };
    fetchMediaDetails();
  }, [post.id]);
  return (
    <Paper shadow="sm" p="md" withBorder>
      <Title mb="1.4rem">{post.name}</Title>
      <Paper
        shadow="xs"
        withBorder
        px="xs"
        sx={{ backgroundColor: "#82c7fc1d" }}
      >
        <Text my={2}>{post.description}</Text>
      </Paper>
      <p style={{ fontSize: "small", color: "#0000008d" }}>
        Owned by:{" "}
        <a
          style={{ color: "#198b6eb9" }}
          href={`https://minascan.io/berkeley/account/${post.owner}`}
        >
          {post.owner.substring(
            post.owner.indexOf(":0x") + 1,
            post.owner.indexOf(":0x") + 8
          ) +
            "..." +
            post.owner.substring(35)}
        </a>
      </p>
      {totalSupply && postNumber >= totalSupply ? (
        <Text>Minted</Text>
      ) : (
        <Button
          onClick={async () => console.log("") /* await mintNftFromMap() */}
        >
          Mint
        </Button>
      )}
    </Paper>
  );
};

export default MediaDetails;
