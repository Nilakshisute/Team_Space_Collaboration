// Components/CreateWorkspace.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Heading,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const CreateWorkspace = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create new workspace document
      const workspaceRef = await addDoc(collection(db, "workspaces"), {
        name,
        description,
        createdBy: userData.uid,
        members: [userData.uid],
        createdAt: new Date(),
      });

      // Update the workspace with its ID (for easier querying)
      await updateDoc(workspaceRef, {
        id: workspaceRef.id,
      });

      // Add workspace to user's joined workspaces
      const userRef = doc(db, "users", userData.uid);
      await updateDoc(userRef, {
        joinedWorkspaces: arrayUnion(workspaceRef.id),
      });

      toast({
        title: "Workspace created",
        description: "Your new workspace has been created successfully.",
        status: "success",
        duration: 3000,
      });

      navigate(`/workspace/${workspaceRef.id}`);
    } catch (error) {
      toast({
        title: "Error creating workspace",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={8}>
      <Heading mb={8}>Create New Workspace</Heading>
      <form onSubmit={handleCreateWorkspace}>
        <VStack spacing={6} align="start">
          <FormControl isRequired>
            <FormLabel>Workspace Name</FormLabel>
            <Input
              placeholder="Enter workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Describe the purpose of this workspace"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </FormControl>

          <Box width="100%" pt={4}>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={isLoading}
              mr={3}
            >
              Create Workspace
            </Button>
            <Button variant="outline" onClick={() => navigate("/home")}>
              Cancel
            </Button>
          </Box>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateWorkspace;
