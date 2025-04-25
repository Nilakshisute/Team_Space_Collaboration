// Components/workspace/DocumentsTab.jsx (updated)
import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";

const DocumentsTab = ({ workspaceId }) => {
  const [documents, setDocuments] = useState([]);
  const [editableDocuments, setEditableDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const { userData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

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
        toast({
          title: "Error fetching documents",
          description: error.message,
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [workspaceId, toast]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to Firebase Storage
      const storageRef = ref(
        storage,
        `documents/${workspaceId}/${selectedFile.name}`
      );
      await uploadBytes(storageRef, selectedFile);

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
      setDocuments([
        ...documents,
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
        },
      ]);

      toast({
        title: "Document uploaded successfully",
        status: "success",
        duration: 3000,
      });

      // Reset form and close modal
      setDocumentName("");
      setSelectedFile(null);
      onUploadClose();
    } catch (error) {
      toast({
        title: "Error uploading document",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocName) {
      toast({
        title: "Document name required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setCreating(true);

    try {
      // Add new editable document to Firestore
      const docRef = await addDoc(collection(db, "documents"), {
        name: newDocName,
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
      });

      // Navigate to the document editor
      navigate(`/workspace/${workspaceId}/document/${docRef.id}`);
    } catch (error) {
      toast({
        title: "Error creating document",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setCreating(false);
    }
  };

  const openDocument = (document) => {
    if (document.type === "upload") {
      window.open(document.url, "_blank");
    } else {
      navigate(`/workspace/${workspaceId}/document/${document.id}`);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" mb={6}>
        <Heading size="md">Documents</Heading>
        <Flex>
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
                  >
                    <Text fontWeight="bold" isTruncated>
                      {doc.name}
                    </Text>
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
            </FormControl>
            <FormControl>
              <FormLabel>Select File</FormLabel>
              <Input type="file" onChange={handleFileChange} p={1} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUploadClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleUpload}
              isLoading={uploading}
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
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleCreateDocument}
              isLoading={creating}
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
