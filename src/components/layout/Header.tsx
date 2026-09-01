import { Box, Heading } from "@chakra-ui/react";

export default function Header() {
  return (
    <Box
      h="70px"
      bg="#2D3748"
      color="white"
      display="flex"
      alignItems="center"
      px={6}
    >
      <Heading size="md">TRPG Printable PDF Maker</Heading>
    </Box>
  );
}