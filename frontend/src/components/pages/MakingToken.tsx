import { Stack } from "@chakra-ui/react";
import { useState } from "react";
import FileUploadComponent from "@/components/ui/file-upload";
import type { ImageData } from "@/components/utils/fileToImage";

export default function MakingToken() {
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  return (
    <Stack justifyContent="center" alignItems="center" gap={4} mb={4}>
      <FileUploadComponent
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        uploadedImages={uploadedImages}
        setUploadedImages={setUploadedImages}
      />
    </Stack>
  );
}