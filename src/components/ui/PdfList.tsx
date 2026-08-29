import { Box, Button, Image, Text } from "@chakra-ui/react";
import { LuDownload, LuTrash2 } from "react-icons/lu";
import { usePdfContext } from "@/components/hooks/usePdfContext";

//생성된 pdf 목록을 보여주는 컴포넌트
export default function PdfList() {

    //pdf 목록, pdf 삭제, pdf 다운로드, pdf 병합, 로딩 상태를 가져옴
    const { generatedPdfs, deletePdf, downloadPdf, mergePdfs, isLoading } = usePdfContext();

    return (
        <Box width="90%">
            <Box
                flexDirection="column"
                m={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
            >
                <Box
                    border="1px solid lightgray"
                    backgroundColor="white"
                    justifyContent="center"
                    alignItems="flex-start"
                    width="80%"
                    height="250px"
                    flexDirection="row"
                    display="flex"
                    overflowX="auto"
                    p="15px"
                    gap="15px">

                    {/* pdf 목록을 순회하며 pdf를 보여줌 */}
                    {generatedPdfs.map((pdf) => (
                        <Box key={pdf.id} border="3px solid lightgray" borderRadius={15} width="150px" flexShrink={0} p="5px">
                            <Image src={pdf.previewUrl} width="100%" height="200px" objectFit="contain" />
                            <Text>{pdf.name}</Text>
                            <Button onClick={() => downloadPdf(pdf.id)} size="sm"><LuDownload /></Button>
                            <Button onClick={() => deletePdf(pdf.id)} size="sm"><LuTrash2 /></Button>
                        </Box>
                    ))}
                </Box>

                {/* pdf 병합 버튼 */}
                <Button onClick={mergePdfs} disabled={generatedPdfs.length < 2 || isLoading}>
                    Merge and download
                </Button>
            </Box>
        </Box>
    );
}