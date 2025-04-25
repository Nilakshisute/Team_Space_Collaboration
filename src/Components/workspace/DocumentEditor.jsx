// Components/workspace/DocumentEditor.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const DocumentEditor = () => {
  const { workspaceId, documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { userData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const docRef = doc(db, "documents", documentId);

        // Set up real-time listener for document changes
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const docData = snapshot.data();
            setDocument({ id: snapshot.id, ...docData });
            setContent(docData.content || "");
          } else {
            toast({
              title: "Document not found",
              status: "error",
              duration: 3000,
            });
            navigate(`/workspace/${workspaceId}`);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        toast({
          title: "Error fetching document",
          description: error.message,
          status: "error",
          duration: 3000,
        });
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, workspaceId, navigate, toast]);

  const handleSave = async () => {
    setSaving(true);

    try {
      await updateDoc(doc(db, "documents", documentId), {
        content,
        lastEditedBy: userData.uid,
        lastEditedAt: new Date(),
      });

      toast({
        title: "Document saved",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error saving document",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}></Flex>
      // Components/workspace/DocumentEditor.jsx (continued)
      <Box maxW="1200px" mx="auto" p={5}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="md">{document?.name}</Heading>
          <Flex>
            <Button
              colorScheme="teal"
              onClick={handleSave}
              isLoading={saving}
              mr={3}
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/workspace/${workspaceId}`)}
            >
              Back to Workspace
            </Button>
          </Flex>
        </Flex>

        <Box border="1px" borderColor="gray.200" borderRadius="md" h="70vh">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            style={{ height: "calc(70vh - 42px)" }} // Subtract toolbar height
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentEditor;
