import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { Map, CircleUserRound } from "lucide-react";

// 페이지 이동
const onClickCard = (cardNumber: number) => {
  switch (cardNumber) {
    case 1:
      window.location.href = "/making-map";
      break;
    case 2:
      window.location.href = "/making-token";
      break;
  }
};

const cardStyle = {
  as: "button" as const,
  borderWidth: "1px",
  borderColor: "gray.200",
  borderRadius: "xl",
  width: "320px",
  height: "320px",
  p: 8,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center" as const,
  backgroundColor: "white",
  transition: "all 0.2s ease",
  cursor: "pointer",

  _hover: {
    bg: "gray.50",
    borderColor: "gray.300",
    boxShadow: "lg",
    transform: "translateY(-4px)",
  },

  _focusVisible: {
    outline: "2px solid",
    outlineColor: "blue.500",
    outlineOffset: "3px",
  },
};

export default function Home() {
  return (
    <Box
      minH="calc(100vh - 80px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={6}
    >
      <HStack gap={8} flexWrap="wrap" justify="center">
        {/* Making Maps */}
        <Box
          {...cardStyle}
          onClick={() => onClickCard(1)}
        >
          <VStack gap={5}>
            <Map size={72} strokeWidth={1.5} />

            <Box>
              <Heading size="lg">
                Making Maps PDF
              </Heading>

              <Text
                mt={3}
                fontSize="md"
                color="gray.600"
                lineHeight="1.6"
              >
                Create and customize your maps
                into printable PDFs.
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Making Tokens */}
        <Box
          {...cardStyle}
          onClick={() => onClickCard(2)}
        >
          <VStack gap={5}>
            <CircleUserRound
              size={72}
              strokeWidth={1.5}
            />

            <Box>
              <Heading size="lg">
                Making Tokens PDF
              </Heading>

              <Text
                mt={3}
                fontSize="md"
                color="gray.600"
                lineHeight="1.6"
              >
                Create and customize your tokens
                into printable PDFs.
              </Text>
            </Box>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
}