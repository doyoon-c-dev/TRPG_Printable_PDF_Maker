import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { usePdfContext } from "@/components/hooks/usePdfContext";

//로딩 오버레이
//로딩 중일 때 화면을 가림
export function LoadingOverlay() {

    const { isLoading, loadingMessage } = usePdfContext();

    //로딩 중이 아니면 null 반환
    if (!isLoading) return null;

    //로딩 중일 때 화면을 가림
    return (
        <Box
            position="fixed"
            inset={0}
            zIndex={9999}
            bg="blackAlpha.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            role="status"
            aria-live="polite"
            aria-label="로딩 중"
        >
            <VStack
                bg="white"
                padding={6}
                borderRadius="md"
                gap={4}
            >
                <Spinner size="xl" aria-hidden="true" />

                <Text>
                    {loadingMessage}
                </Text>
            </VStack>
        </Box>
    );
}