import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Heading,
  useToast,
  VStack,
  Text,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const CreateWorkspace = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Workspace name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Workspace name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Workspace name must be less than 50 characters";
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Create new workspace document
      const workspaceRef = await addDoc(collection(db, "workspaces"), {
        name: formData.name.trim(),
        description: formData.description.trim(),
        createdBy: userData.uid,
        members: [userData.uid],
        createdAt: serverTimestamp(), // Use server timestamp for better consistency
        updatedAt: serverTimestamp(),
      });
      
      // Update the workspace with its ID (for easier querying)
      await updateDoc(workspaceRef, {
        id: workspaceRef.id,
      });
      
      // Add workspace to user's joined workspaces
      const userRef = doc(db, "users", userData.uid);
      await updateDoc(userRef, {
        joinedWorkspaces: arrayUnion(workspaceRef.id),
        updatedAt: serverTimestamp(),
      });
      
      toast({
        title: "Workspace created",
        description: "Your new workspace has been created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      navigate(`/workspace/${workspaceRef.id}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error creating workspace",
        description: error.message || "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={8}>
      <Heading mb={6}>Create New Workspace</Heading>
      <Text mb={8} color="gray.600">
        Create a workspace to collaborate with your team and manage projects together.
      </Text>
      
      <Box 
        as="form" 
        onSubmit={handleCreateWorkspace}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        p={6}
        shadow="md"
      >
        <VStack spacing={6} align="start">
          <FormControl isRequired isInvalid={!!errors.name}>
            <FormLabel fontWeight="medium">Workspace Name</FormLabel>
            <Input
              name="name"
              placeholder="Enter workspace name"
              value={formData.name}
              onChange={handleChange}
              maxLength={50}
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
            {!errors.name && formData.name && (
              <Text fontSize="sm" color="gray.500" mt={1}>
                {50 - formData.name.length} characters remaining
              </Text>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.description}>
            <FormLabel fontWeight="medium">Description</FormLabel>
            <Textarea
              name="description"
              placeholder="Describe the purpose of this workspace"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              resize="vertical"
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
            {!errors.description && (
              <Text fontSize="sm" color="gray.500" mt={1}>
                {500 - formData.description.length} characters remaining
              </Text>
            )}
          </FormControl>
          
          <HStack width="100%" pt={4} justifyContent="flex-end" spacing={4}>
            <Button 
              variant="outline" 
              onClick={() => navigate("/home")}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={isLoading}
              loadingText="Creating"
            >
              Create Workspace
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default CreateWorkspace;