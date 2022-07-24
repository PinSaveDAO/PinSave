import {
  Grid,
  Paper,
  Title,
  TextInput,
  SimpleGrid,
  Textarea,
} from "@mantine/core";
import React from "react";

const UploadForm = () => {
  return (
    <Paper withBorder shadow="xl" p="xl" radius="lg">
      <Title>Upload a new Post</Title>
      <TextInput required label="Title" placeholder="Post Title" />
      <Textarea
        required
        label="Description"
        placeholder="Describe your post here"
      />
    </Paper>
  );
};

export default UploadForm;
