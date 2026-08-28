import { Box } from "@chakra-ui/react";
import { CanvasEditor } from "@/components/ui/canvas/CanvasEditor";

export const MapPreview = () => {

    const x = 800 ;
    const y = 800 ;

    return (
            <Box m={2} overflowY="auto" alignItems="center" justifyContent="center">
                <Box border="1px solid gray" w={x+2} h={y+2} bg="gray.100">
                    <CanvasEditor />
                </Box>
            </Box>
    );
}