import fileReaderStream from "filereader-stream";

export const dataStream = (fileToUpload) => {
  return fileReaderStream(fileToUpload);
};
