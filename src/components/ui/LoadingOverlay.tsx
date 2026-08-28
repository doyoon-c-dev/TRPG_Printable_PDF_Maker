import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { usePdfContext } from "../hooks/usePdfContext";

export function LoadingOverlay() {
    
    const { isLoading, loadingMessage } = usePdfContext();

    if (!isLoading) {
        return null;
    }

    return (
        <Box
            position="fixed"
            inset={0}
            zIndex={9999}
            bg="blackAlpha.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <VStack
                bg="white"
                padding={6}
                borderRadius="md"
                gap={4}
            >
                <Spinner size="xl" />

                <Text>
                    {loadingMessage}
                </Text>
            </VStack>
        </Box>
    );
}