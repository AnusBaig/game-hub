import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  Checkbox,
} from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const AgeVerification = ({ isOpen, onAccept, onDecline }: Props) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleAccept = () => {
    if (confirmed) {
      // Store acceptance in localStorage (for session persistence)
      localStorage.setItem('ageVerified', 'true');
      localStorage.setItem('ageVerifiedDate', new Date().toISOString());
      onAccept();
    }
  };

  const handleDecline = () => {
    localStorage.removeItem('ageVerified');
    localStorage.removeItem('ageVerifiedDate');
    onDecline();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDecline}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
      size="lg"
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader fontSize="2xl" fontWeight="bold">
          Age Verification Required
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertDescription>
                This content may contain adult themes, mature content, and/or
                explicit material. You must be 18 years or older to proceed.
              </AlertDescription>
            </Alert>

            <Text fontSize="md" color="gray.300">
              By proceeding, you confirm that:
            </Text>

            <VStack align="stretch" pl={4} spacing={2}>
              <Text fontSize="sm" color="gray.400">
                • You are at least 18 years of age or the age of majority in your jurisdiction
              </Text>
              <Text fontSize="sm" color="gray.400">
                • It is legal to view adult content in your location
              </Text>
              <Text fontSize="sm" color="gray.400">
                • You understand this content may contain explicit material
              </Text>
              <Text fontSize="sm" color="gray.400">
                • You agree to our Terms of Service and Privacy Policy
              </Text>
            </VStack>

            <Box borderTop="1px solid" borderColor="gray.600" pt={4}>
              <Checkbox
                isChecked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                colorScheme="red"
              >
                <Text fontSize="sm" fontWeight="semibold">
                  I confirm that I am 18 years or older and agree to the above terms
                </Text>
              </Checkbox>
            </Box>

            <Text fontSize="xs" color="gray.500" fontStyle="italic">
              Note: This verification will be stored in your browser for this session.
              You may need to verify again in future sessions for security purposes.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            colorScheme="red"
            onClick={handleAccept}
            isDisabled={!confirmed}
            flex={1}
          >
            Yes, I am 18 or Older
          </Button>
          <Button
            variant="outline"
            onClick={handleDecline}
            flex={1}
          >
            No, Take Me Back
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AgeVerification;
