import { Box, Flex, HStack, Text, Link } from "@chakra-ui/react";
import { Coffee } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <Box
      as="footer"
      width="100%"
      borderTop="1px solid"
      borderColor="gray.200"
      py={6}
      mt={12}
    >
      <Flex
        maxW="1000px"
        mx="auto"
        px={6}
        justify="space-between"
        align="center"
        gap={6}
        flexWrap="wrap"
      >
        {/* Project Info */}
        <Box>
          <Text
            fontSize="sm"
            fontWeight="600"
            color="gray.700"
          >
            TRPG Printable PDF Maker
          </Text>

          <Text
            fontSize="xs"
            color="gray.500"
            mt={1}
          >
            Easily convert map images into print-ready files.
          </Text>
        </Box>

        {/* Links */}
        <HStack gap={4}>
          <Link
            href="https://github.com/doyoon-c-dev/TRPG_Printable_PDF_Maker_Prod/issues"
            target="_blank"
            rel="noopener noreferrer"
            fontSize="sm"
            color="gray.600"
            _hover={{ color: "gray.900" }}
          >
            Feedback
          </Link>

          <Link
            href="https://github.com/doyoon-c-dev"
            target="_blank"
            rel="noopener noreferrer"
            fontSize="sm"
            color="gray.600"
            _hover={{ color: "gray.900" }}
          >
            <HStack gap={1}>
              <FaGithub size={15} />
              <Text>GitHub</Text>
            </HStack>
          </Link>

          <Link
            href="https://buymeacoffee.com/dydy49"
            target="_blank"
            rel="noopener noreferrer"
            fontSize="sm"
            color="gray.600"
            _hover={{ color: "gray.900" }}
          >
            <HStack gap={1}>
              <Coffee size={15} />
              <Text>Buy me a coffee</Text>
            </HStack>
          </Link>
        </HStack>
      </Flex>

      {/* Copyright */}
      <Text
        textAlign="center"
        fontSize="xs"
        color="gray.400"
        mt={6}
      >
        © 2026 TRPG Printable PDF Maker. Built with React.
      </Text>
    </Box>
  );
}
