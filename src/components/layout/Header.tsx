import { Box, Heading } from "@chakra-ui/react";

export default function Header() {
  return (
    <Box
      h="70px"
      bg="blue.500"
      color="white"
      display="flex"
      alignItems="center"
      px={6}
    >
      <Heading size="md">Map Grid Maker</Heading>
    </Box>
  );
}