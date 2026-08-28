import { Box, Text } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box
      h="60px"
      bg="gray.100"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Text>© 2026</Text>
    </Box>
  );
}