// Components/workspace/DocumentsTab.jsx (updated)
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useDisclosure,
  useToast,
  Spinner,
  Progress,
  Badge,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const DocumentsTab = ({ workspaceId }) => {
  const [documents, setDocuments] = useState([]);
  const [editableDocuments, setEditableDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [creating, setCreating] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: handleUploadClose,
  } = useDisclosure();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const { userData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Custom onClose handler for upload modal to reset form
  const onUploadClose = () => {
    setSelectedFile(null);
    setDocumentName("");
    setFileError("");
    setUploadProgress(0);
    handleUploadClose();
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Fetch uploaded documents
        const uploadedDocsQuery = query(
          collection(db, "documents"),
          where("workspaceId", "==", workspaceId),
          where("type", "==", "upload")
        );

        const uploadedDocsSnapshot = await getDocs(uploadedDocsQuery);
        const uploadedDocs = [];

        uploadedDocsSnapshot.forEach((doc) => {
          uploadedDocs.push({ id: doc.id, ...doc.data() });
        });

        setDocuments(uploadedDocs);

        // Fetch editable documents
        const editableDocsQuery = query(
          collection(db, "documents"),
          where("workspaceId", "==", workspaceId),
          where("type", "==", "editable")
        );

        const editableDocsSnapshot = await getDocs(editableDocsQuery);
        const editableDocs = [];

        editableDocsSnapshot.forEach((doc) => {
          editableDocs.push({ id: doc.id, ...doc.data() });
        });

        setEditableDocuments(editableDocs);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error fetching documents",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchDocuments();
    }
  }, [workspaceId, toast]);

  const validateFile = (file) => {
    // File size validation (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      return "File size exceeds 20MB limit";
    }

    // Add additional file type validation if needed
    // const allowedTypes = ['application/pdf', 'image/jpeg', ...];
    // if (!allowedTypes.includes(file.type)) {
    //   return "File type not supported";
    // }

    return null;
  };

  const handleFileChange = (e) => {
    setFileError("");
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);

      if (error) {
        setFileError(error);
        setSelectedFile(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setSelectedFile(file);
        // If no document name is set, use the file name as default
        if (!documentName) {
          setDocumentName(file.name);
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a storage reference
      const storageRef = ref(
        storage,
        `documents/${workspaceId}/${Date.now()}_${selectedFile.name}`
      );

      // Create an upload task with progress monitoring
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      // Monitor upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          throw error;
        }
      );

      // Wait for upload completion
      await uploadTask;

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Add document reference to Firestore
      const docRef = await addDoc(collection(db, "documents"), {
        name: documentName || selectedFile.name,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        uploadedBy: userData.uid,
        uploaderName: `${userData.firstName} ${userData.lastName}`,
        workspaceId,
        url: downloadURL,
        type: "upload",
        createdAt: serverTimestamp(),
      });

      // Add new document to local state
      setDocuments((prevDocs) => [
        ...prevDocs,
        {
          id: docRef.id,
          name: documentName || selectedFile.name,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          uploadedBy: userData.uid,
          uploaderName: `${userData.firstName} ${userData.lastName}`,
          workspaceId,
          url: downloadURL,
          type: "upload",
          createdAt: { seconds: Date.now() / 1000 }, // Add a temporary timestamp for immediate display
        },
      ]);

      toast({
        title: "Document uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      onUploadClose();
    } catch (error) {
      console.error("Upload error details:", error);
      toast({
        title: "Error uploading document",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocName || newDocName.trim() === "") {
      toast({
        title: "Document name required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCreating(true);

    try {
      // Add new editable document to Firestore
      const docRef = await addDoc(collection(db, "documents"), {
        name: newDocName.trim(),
        content: "",
        createdBy: userData.uid,
        creatorName: `${userData.firstName} ${userData.lastName}`,
        workspaceId,
        type: "editable",
        createdAt: serverTimestamp(),
        lastEditedAt: serverTimestamp(),
        lastEditedBy: userData.uid,
      });

      toast({
        title: "Document created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Navigate to the document editor
      navigate(`/workspace/${workspaceId}/document/${docRef.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
      toast({
        title: "Error creating document",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  const openDocument = (document) => {
    if (document.type === "upload") {
      window.open(document.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/workspace/${workspaceId}/document/${document.id}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" p={10} height="50vh">
        <Spinner size="xl" thickness="4px" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex
        justifyContent="space-between"
        mb={6}
        alignItems="center"
        flexWrap="wrap"
      >
        <Heading size="md">Documents</Heading>
        <Flex mt={{ base: 2, md: 0 }}>
          <Button colorScheme="teal" onClick={onCreateOpen} mr={3}>
            Create Document
          </Button>
          <Button colorScheme="blue" onClick={onUploadOpen}>
            Upload File
          </Button>
        </Flex>
      </Flex>

      <Tabs variant="soft-rounded" colorScheme="teal" isLazy>
        <TabList mb={4}>
          <Tab>Editable Documents</Tab>
          <Tab>Uploaded Files</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {editableDocuments.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {editableDocuments.map((doc) => (
                  <Box
                    key={doc.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                    onClick={() => openDocument(doc)}
                    shadow="sm"
                  >
                    <Text fontWeight="bold" isTruncated>
                      {doc.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Created by: {doc.creatorName}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {doc.createdAt &&
                        new Date(
                          doc.createdAt.seconds * 1000
                        ).toLocaleDateString()}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Box textAlign="center" p={10} bg="gray.50" borderRadius="lg">
                <Text>No editable documents created yet.</Text>
                <Button colorScheme="teal" mt={4} onClick={onCreateOpen}>
                  Create Your First Document
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel>
            {documents.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {documents.map((doc) => (
                  <Box
                    key={doc.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                    onClick={() => openDocument(doc)}
                    shadow="sm"
                  >
                    <Text fontWeight="bold" isTruncated>
                      {doc.name}
                    </Text>
                    <Flex mt={1} mb={1}>
                      <Badge colorScheme="blue">
                        {doc.fileType.split("/")[1]?.toUpperCase() ||
                          doc.fileType}
                      </Badge>
                      <Text fontSize="xs" ml={2} color="gray.500">
                        {doc.fileSize && formatFileSize(doc.fileSize)}
                      </Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.500">
                      Uploaded by: {doc.uploaderName}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {doc.createdAt &&
                        new Date(
                          doc.createdAt.seconds * 1000
                        ).toLocaleDateString()}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Box textAlign="center" p={10} bg="gray.50" borderRadius="lg">
                <Text>No files uploaded yet.</Text>
                <Button colorScheme="blue" mt={4} onClick={onUploadOpen}>
                  Upload Your First File
                </Button>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Upload Document Modal */}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Document Name (Optional)</FormLabel>
              <Input
                placeholder="Enter document name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                If left blank, the file name will be used
              </Text>
            </FormControl>
            <FormControl isInvalid={!!fileError}>
              <FormLabel>Select File</FormLabel>
              <Input
                type="file"
                onChange={handleFileChange}
                p={1}
                ref={fileInputRef}
              />
              {fileError && (
                <Alert status="error" mt={2} size="sm">
                  <AlertIcon />
                  {fileError}
                </Alert>
              )}
              {selectedFile && !fileError && (
                <Box mt={2}>
                  <Text fontSize="sm" color="green.500">
                    File selected: {selectedFile.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Size: {formatFileSize(selectedFile.size)}
                  </Text>
                </Box>
              )}
            </FormControl>

            {uploading && (
              <Box mt={4}>
                <Text fontSize="sm" mb={1}>
                  Upload Progress: {Math.round(uploadProgress)}%
                </Text>
                <Progress value={uploadProgress} size="sm" colorScheme="teal" />
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onUploadClose}
              isDisabled={uploading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleUpload}
              isLoading={uploading}
              loadingText="Uploading..."
              isDisabled={!selectedFile || !!fileError}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Document Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Document Name</FormLabel>
              <Input
                placeholder="Enter document name"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onCreateClose}
              isDisabled={creating}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleCreateDocument}
              isLoading={creating}
              isDisabled={!newDocName.trim()}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DocumentsTab;
