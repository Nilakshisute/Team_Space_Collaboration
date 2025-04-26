// Components/workspace/RenameDocumentModal.jsx
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@chakra-ui/react";

const RenameDocumentModal = ({ 
  isOpen, 
  onClose, 
  documentName, 
  setDocumentName, 
  handleRename 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleRename(documentName); // Fixed: Pass the document name to handleRename
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Rename Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Document Name</FormLabel>
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
                autoFocus
                maxLength={50}
              />
              <FormHelperText>
                {documentName ? `${50 - documentName.length} characters remaining` : ""}
              </FormHelperText>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="teal" 
              type="submit"
              isDisabled={!documentName.trim()}
            >
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default RenameDocumentModal;