import { Dialog, Portal, CloseButton } from "@chakra-ui/react";

interface CustomDialogProps {
  title: string;
  isOpen: boolean;
  message: string;
  onClose: () => void;
  trigger: React.ReactNode;
}

export function CustomDialog({ title, isOpen, message, onClose, trigger }: CustomDialogProps) {
  return (
    <Dialog.Root
      size="md"
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      closeOnEscape={true}
      closeOnInteractOutside={true}
      aria-label={title}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <p>{message}</p>
            </Dialog.Body>

            <Dialog.CloseTrigger asChild>
              <CloseButton onClick={onClose} size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
