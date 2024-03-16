import type { NextPage } from "next";

import { PageSEO } from "@/components/SEO";
import UploadForm from "@/components/UploadForm";

const Upload: NextPage = () => {
  return (
    <div>
      <PageSEO
        title="Pin Save Upload Page"
        description="Upload New Post on Pin Save - decentralized Pinterest. A platform for decentralized content aggregation and image sharing"
      />
      <UploadForm />
    </div>
  );
};

export default Upload;
