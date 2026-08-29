import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import FileUploadComponent from "@/components/ui/file-upload";
import type { ImageData } from "@/components/utils/fileToImage";

export default function MakingToken() {
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  return (
    <Stack justifyContent="center" alignItems="center" gap={4} mb={4}>
      <Box textAlign="center">
        <Heading as="h1">Making Tokens</Heading>
        <Text>토큰 이미지를 업로드해서 PDF 또는 이미지로 출력할 수 있습니다.</Text>
      </Box>

      <FileUploadComponent
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        uploadedImages={uploadedImages}
        setUploadedImages={setUploadedImages}
      />
    </Stack>
  );
}