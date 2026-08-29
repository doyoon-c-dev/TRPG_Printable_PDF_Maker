
import FileUploadComponent from "@/components/ui/file-upload";  //dropzone, 파일업로드 버튼, 업로드된 이미지 리스트
import { Stack, Box } from "@chakra-ui/react";
import { MapButtons } from "../ui/mapButtons";                    //canvasSettings를 변경하는 Input 컴포넌트들
import { CanvasEditor } from "../ui/canvas/CanvasEditor";         //viewport와 viewport에 그려지는 Image, Guide, Grid 캔버스
import PdfList from "../ui/PdfList";                              //생성된 pdf 미리보기, 제거, 개별 다운로드, 병합 다운로드
import { LoadingOverlay } from "../ui/LoadingOverlay";            //pdf 생성 중 혹은 다운로드 중 overlay
import { useCanvasContext } from "../hooks/useCanvasContext";
import { useImageContext } from "../hooks/useImageContext";

export default function MakingMap() {

  const { isResizingGrid } = useCanvasContext();
  const { selectedImage, setSelectedImage, uploadedImages, setUploadedImages } = useImageContext();

  return (
    <>
      <Stack justifyContent="center" alignItems="center" gap={4} mb={4}>
        <FileUploadComponent
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
        />
        <Box flexDirection="row" display="flex" alignItems="flex-start" justifyContent="center" gap={10} width="90%" flexWrap="wrap">
          <MapButtons />
          <Box border="1px solid gray" w={702} h={702} bg="gray.100">
            <CanvasEditor />
          </Box>
        </Box>
        <PdfList />
        <LoadingOverlay />
        {isResizingGrid && (
          <Box
            position="fixed"
            inset={0}
            zIndex={10000}
            bg="blackAlpha.500"
            pointerEvents="auto"
          />
        )}
      </Stack>
    </>

  );
}