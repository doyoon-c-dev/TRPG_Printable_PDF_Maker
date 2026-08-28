import { Box, Button, Image, Text } from "@chakra-ui/react";
import { LuDownload, LuTrash2 } from "react-icons/lu";
import { usePdfContext } from "../hooks/usePdfContext";

export default function PdfList() {
    const { generatedPdfs, deletePdf, downloadPdf, mergePdfs, isLoading } = usePdfContext();

    return (
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
                display="flex" 
                overflowX="auto"
                width="80%"
                height="auto" 
                p="15px" 
                gap="15px" 
                mt="15px">
                {generatedPdfs.map((pdf) => (
                    <Box key={pdf.id} border="3px solid lightgray" borderRadius={15} width="150px" flexShrink={0} p="5px">
                        <Image src={pdf.previewUrl} width="100%" height="200px" objectFit="contain" />
                        <Text>{pdf.name}</Text>
                        <Button onClick={() => downloadPdf(pdf.id)} size="sm"><LuDownload /></Button>
                        <Button onClick={() => deletePdf(pdf.id)} size="sm"><LuTrash2 /></Button>
                    </Box>
                ))}
            </Box>
            <Button onClick={mergePdfs} disabled={generatedPdfs.length < 2 || isLoading}>
                Merge and download
            </Button>
        </Box>
    );
}