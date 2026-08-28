
import  FileUploadComponent  from "@/components/ui/file-upload";  //dropzone, 파일업로드 버튼, 업로드된 이미지 리스트
import { Stack, Box } from "@chakra-ui/react";
import { MapButtons } from "../ui/mapButtons";                    //canvasSettings를 변경하는 Input 컴포넌트들
import { CanvasEditor } from "../ui/canvas/CanvasEditor";         //viewport와 viewport에 그려지는 Image, Guide, Grid 캔버스
import PdfList from "../ui/PdfList";                              //생성된 pdf 미리보기, 제거, 개별 다운로드, 병합 다운로드
import { LoadingOverlay } from "../ui/LoadingOverlay";            //pdf 생성 중 혹은 다운로드 중 overlay
import { MapCustomButtons } from "../ui/MapCustomButtons";        //gridSize 마우스 입력 버튼
import { useCanvasContext } from "../hooks/useCanvasContext";

export default function MakingMap() {

  const { isResizingGrid } = useCanvasContext();
  
  return (
    <>
      <Stack justifyContent="center" gap={4} mb={4}>
          <FileUploadComponent />
          <Box flexDirection="row" display="flex" alignItems="center" justifyContent="center" gap={20} mr={1}>
            <MapButtons />
            <CanvasEditor/>
            <MapCustomButtons />  
          </Box>
          <PdfList/>
          <LoadingOverlay/>
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