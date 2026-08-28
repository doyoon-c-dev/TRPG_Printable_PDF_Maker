import { Box, HStack, Heading, Text } from "@chakra-ui/react";

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

export default function Home() {
  return (
    <Box p={6}>
      <HStack gap={6} justifyContent="center">
        <Box
          as="button"
          onClick={() => onClickCard(1)}
          borderWidth="1px"
          borderRadius="md"
          p={4}
          w="240px"
          textAlign="left"
        >
          <Heading size="md">Making Maps</Heading>
          <Text mt={2} fontSize="sm">
            create and customize your maps to printable pdf.
          </Text>
        </Box>

        <Box
          as="button"
          onClick={() => onClickCard(2)}
          borderWidth="1px"
          borderRadius="md"
          p={4}
          w="240px"
          textAlign="left"
        >
          <Heading size="md">Making Tokens</Heading>
          <Text mt={2} fontSize="sm">
            create and customize your tokens for your games.
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}