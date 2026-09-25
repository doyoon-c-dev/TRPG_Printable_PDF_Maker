import { CustomDialog } from "@/components/ui/CustomDialog";
import { Box, Heading, Text, VStack, type BoxProps } from "@chakra-ui/react";
import { CircleUserRound } from "lucide-react";
import { useState } from "react";

export function MakingTokenDialog(cardStyle: BoxProps) {
  const [open, setOpen] = useState(false);

  const trigger = (
    <Box
      {...cardStyle}
      onClick={() => setOpen(true)}
      aria-label="Open Making Tokens PDF dialog"
    >
      <VStack gap={5}>
        <CircleUserRound size={72} strokeWidth={1.5} />

        <Box>
          <Heading size="lg">Making Tokens PDF</Heading>

          <Text mt={3} fontSize="md" color="gray.600" lineHeight="1.6">
            Create and customize your tokens into printable PDFs.
          </Text>
        </Box>
      </VStack>
    </Box>
  );

  return (
    <CustomDialog
      title="Coming Soon"
      isOpen={open}
      message="Making Tokens PDF is currently under development. We’re working on it and hope to make it available soon!"
      onClose={() => setOpen(false)}
      trigger={trigger}
    />
  );
}