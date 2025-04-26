import React, { useState } from "react";
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
  FormErrorMessage,
  useToast,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const JoinWorkspaceModal = ({ isOpen, onClose, onSuccess }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { userData } = useAuth();
  const toast = useToast();

  const handleJoinWorkspace = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }
    
    setError("");
    setIsJoining(true);
    
    try {
      // Extract workspace ID from invite code (first 6 characters before the dash)
      const workspaceIdPart = inviteCode.split("-")[0];
      
      // Query workspaces to find one that matches the pattern
      const workspacesRef = collection(db, "workspaces");
      const q = query(workspacesRef, where("id", ">=", workspaceIdPart), where("id", "<=", workspaceIdPart + "\uf8ff"));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError("Invalid invite code or workspace not found");
        return;
      }
      
      // Find the first workspace matching our criteria
      let workspaceDoc = null;
      querySnapshot.forEach((doc) => {
        if (!workspaceDoc && doc.id.startsWith(workspaceIdPart)) {
          workspaceDoc = doc;
        }
      });
      
      if (!workspaceDoc) {
        setError("Invalid invite code or workspace not found");
        return;
      }
      
      const workspaceData = workspaceDoc.data();
      
      // Check if user is already a member
      if (workspaceData.members && workspaceData.members.includes(userData.uid)) {
        setError("You're already a member of this workspace");
        return;
      }
      
      // Add user to workspace members
      const workspaceRef = doc(db, "workspaces", workspaceDoc.id);
      await updateDoc(workspaceRef, {
        members: arrayUnion(userData.uid),
        updatedAt: serverTimestamp()
      });
      
      // Add workspace to user's joined workspaces
      const userRef = doc(db, "users", userData.uid);
      await updateDoc(userRef, {
        joinedWorkspaces: arrayUnion(workspaceDoc.id),
        updatedAt: serverTimestamp()
      });
      
      toast({
        title: "Success!",
        description: `You have joined the workspace "${workspaceData.name}"`,
        status: "success",
        duration: 5000,
      });
      
      // Clear input and close modal
      setInviteCode("");
      onClose();
      
      // Call success callback if provided
      if (typeof onSuccess === "function") {
        onSuccess(workspaceDoc.id);
      }
    } catch (error) {
      console.error("Error joining workspace:", error);
      setError("An error occurred while joining the workspace");
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Join a Workspace</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Alert status="info" mb={4}>
            <AlertIcon />
            Ask your workspace admin for an invite code to join a workspace.
          </Alert>
          <FormControl isInvalid={!!error}>
            <FormLabel>Workspace Invite Code</FormLabel>
            <Input 
              placeholder="Enter workspace invite code" 
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                if (error) setError("");
              }}
            />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="teal" 
            onClick={handleJoinWorkspace}
            isLoading={isJoining}
            loadingText="Joining"
          >
            Join Workspace
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JoinWorkspaceModal;