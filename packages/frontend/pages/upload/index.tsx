import type { NextPage } from "next";

import { PageSEO } from "@/components/SEO";
import UploadForm from "@/components/UploadForm";

const Upload: NextPage = () => {
  return (
    <div>
      <PageSEO
        title="Pin Save Upload Page"
        description="Upload New Post on Pin Save decentralized Pinterest"
      />
      <UploadForm />
    </div>
  );
};

export default Upload;
