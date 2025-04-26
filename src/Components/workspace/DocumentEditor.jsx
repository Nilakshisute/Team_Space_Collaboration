// Components/workspace/DocumentEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  useToast,
  useDisclosure,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useAuth } from "../../context/AuthContext";

import DocumentEditorContent from "./DocumentEditorContent";
import RenameDocumentModal from "./RenameDocumetModel";
import { useDocumentData } from "./useDocumentData";

const DocumentEditor = () => {
  const { workspaceId, documentId } = useParams();
  const [content, setContent] = useState("");
  const [autoSaving, setAutoSaving] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const { userData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const autoSaveTimerRef = useRef(null);
  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();
  
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Using custom hook for document data management
  const {
    document,
    workspace,
    loading,
    saving,
    setSaving,
    collaborators,
    currentEditor,
    handleSave,
    handleRename,
    formatDate
  } = useDocumentData({
    documentId,
    workspaceId,
    content,
    documentName,
    userData,
    setContent,
    setDocumentName,
    setLastSaved,
    toast,
    navigate,
    onRenameClose
  });

  // Setup auto-save functionality
  useEffect(() => {
    if (!documentId || !userData || !document) return;
    
    // Clear previous timer if exists
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Setup new timer
    autoSaveTimerRef.current = setTimeout(() => {
      if (content !== document?.content) {
        handleAutoSave();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, document, documentId, userData]);

  // Handle auto-save
  const handleAutoSave = async () => {
    setAutoSaving(true);
    await handleSave(true);
    setAutoSaving(false);
  };

  // Handle export document as HTML
  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `${documentName || 'document'}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" thickness="4px" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p={{ base: 3, md: 5 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumb 
        spacing="8px" 
        separator={<ChevronRightIcon color="gray.500" />} 
        mb={4}
        fontSize="sm"
        display={{ base: 'none', md: 'flex' }}
      >
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/home')}>Workspaces</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate(`/workspace/${workspaceId}`)}>
            {workspace?.name || 'Workspace'}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink isTruncated maxW="200px">{documentName}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Mobile back button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate(`/workspace/${workspaceId}`)}
        display={{ base: 'block', md: 'none' }}
        mb={4}
        leftIcon={<ChevronRightIcon transform="rotate(180deg)" />}
      >
        Back to workspace
      </Button>

      {/* Document header */}
      <Flex 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        bg={bgColor}
        p={4}
        borderRadius="md"
        shadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
        direction={{ base: "column", md: "row" }}
        gap={{ base: 3, md: 0 }}
      >
        <Flex direction="column" mb={{ base: 2, md: 0 }}>
          <Heading 
            size={{ base: "sm", md: "md" }} 
            onClick={onRenameOpen} 
            cursor="pointer" 
            _hover={{ color: "teal.500" }}
            isTruncated
            maxW={{ base: "100%", md: "300px" }}
          >
            {documentName || "Untitled Document"}
            <Tooltip label="Click to rename" placement="top">
              <Text as="span" fontSize="xs" ml={2} color="gray.500">✏️</Text>
            </Tooltip>
          </Heading>
          <Flex align="center" mt={1}>
            <Text fontSize="xs" color="gray.500">
              {lastSaved ? 
                `Last saved ${formatDate(lastSaved)}` : 
                "Not saved yet"}
            </Text>
            {autoSaving && (
              <Badge ml={2} colorScheme="blue" variant="outline" size="sm">
                Auto-saving...
              </Badge>
            )}
          </Flex>
        </Flex>
        
        <Flex wrap={{ base: "wrap", md: "nowrap" }} justifyContent={{ base: "space-between", md: "flex-end" }} width={{ base: "100%", md: "auto" }}>
          <Button
            colorScheme="teal"
            onClick={() => handleSave(false)}
            isLoading={saving}
            mr={3}
            size="sm"
            flexGrow={{ base: 1, md: 0 }}
          >
            Save
          </Button>
          <Menu>
            <MenuButton as={Button} size="sm" variant="outline" mr={3} flexGrow={{ base: 1, md: 0 }}>
              Options
            </MenuButton>
            <MenuList>
              <MenuItem onClick={onRenameOpen}>Rename</MenuItem>
              <MenuItem onClick={() => window.print()}>Print</MenuItem>
              <MenuItem onClick={handleExport}>Export HTML</MenuItem>
            </MenuList>
          </Menu>
          <Button
            variant="outline"
            onClick={() => navigate(`/workspace/${workspaceId}`)}
            size="sm"
            display={{ base: "none", md: "block" }}
          >
            Back
          </Button>
        </Flex>
      </Flex>

      {/* Collaborators info */}
      {collaborators.length > 0 && (
        <Flex 
          mb={4} 
          fontSize="sm" 
          color="gray.600" 
          align="center"
          bg={bgColor}
          p={2}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          flexWrap="wrap"
          gap={2}
        >
          <Text fontSize="xs" mr={2}>Collaborators:</Text>
          {collaborators.map((collaborator) => (
            <Badge 
              key={collaborator.id} 
              colorScheme={collaborator.isCurrentUser ? "teal" : "gray"}
              variant={collaborator.isCurrentUser ? "solid" : "outline"}
            >
              {collaborator.name}
            </Badge>
          ))}
          {currentEditor && currentEditor !== userData.uid && (
            <Badge colorScheme="orange" ml={{ base: 0, md: "auto" }}>
              Someone is editing...
            </Badge>
          )}
        </Flex>
      )}

      {/* Document editor */}
      <DocumentEditorContent 
        content={content} 
        setContent={setContent} 
        bgColor={bgColor}
        borderColor={borderColor}
      />

      {/* Rename document modal */}
      <RenameDocumentModal 
        isOpen={isRenameOpen}
        onClose={onRenameClose}
        documentName={documentName}
        setDocumentName={setDocumentName}
        handleRename={handleRename}
      />
    </Box>
  );
};

export default DocumentEditor;