import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  HStack,
  Text,
  Avatar,
  Heading,
  Badge,
  useToast,
  Spinner,
  IconButton,
  Flex,
  useColorModeValue,
  Divider,
  List,
  ListItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { FiUserPlus, FiTrash2, FiMail, FiCopy, FiCheck } from "react-icons/fi";

const MembersTab = ({ workspaceId, isAdmin }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  
  const { userData } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isAlertOpen, 
    onOpen: onAlertOpen, 
    onClose: onAlertClose 
  } = useDisclosure();
  const cancelRef = React.useRef();
  
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchMembers();
    generateInviteCode();
  }, [workspaceId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const workspaceRef = doc(db, "workspaces", workspaceId);
      const workspaceDoc = await getDoc(workspaceRef);
      
      if (!workspaceDoc.exists()) {
        toast({
          title: "Error",
          description: "Workspace not found",
          status: "error",
          duration: 3000,
        });
        return;
      }
      
      const workspaceData = workspaceDoc.data();
      const memberIds = workspaceData.members || [];
      
      // Get all member details
      const membersList = [];
      if (memberIds.length > 0) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "in", memberIds));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          membersList.push({
            uid: userData.uid,
            email: userData.email,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            avatarUrl: userData.avatarUrl || "",
            isOwner: userData.uid === workspaceData.createdBy
          });
        });
      }
      
      setMembers(membersList);
    } catch (error) {
      toast({
        title: "Error fetching members",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = () => {
    // Generate a simple invite code based on workspace ID and timestamp
    const timestamp = Date.now();
    const code = `${workspaceId.substring(0, 6)}-${timestamp.toString(36)}`;
    setInviteCode(code);
  };

  const inviteMember = async () => {
    if (!email.trim()) {
      setInviteError("Email is required");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setInviteError("Please enter a valid email address");
      return;
    }
    
    setInviteError("");
    setIsInviting(true);
    
    try {
      // Check if user with this email exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setInviteError("No user found with this email");
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.data().uid;
      
      // Check if user is already a member
      if (members.some(member => member.uid === userId)) {
        setInviteError("User is already a member of this workspace");
        return;
      }
      
      // Add user to workspace members
      const workspaceRef = doc(db, "workspaces", workspaceId);
      await updateDoc(workspaceRef, {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      
      // Add workspace to user's joined workspaces
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        joinedWorkspaces: arrayUnion(workspaceId),
        updatedAt: serverTimestamp()
      });
      
      // Refresh members list
      fetchMembers();
      
      // Clear input and show success message
      setEmail("");
      toast({
        title: "Member added",
        description: "User has been added to the workspace successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding member",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      // Cannot remove the workspace owner
      if (memberToRemove.isOwner) {
        toast({
          title: "Cannot remove owner",
          description: "The workspace owner cannot be removed",
          status: "error",
          duration: 3000,
        });
        return;
      }
      
      // Remove user from workspace members
      const workspaceRef = doc(db, "workspaces", workspaceId);
      await updateDoc(workspaceRef, {
        members: arrayRemove(memberToRemove.uid),
        updatedAt: serverTimestamp()
      });
      
      // Remove workspace from user's joined workspaces
      const userRef = doc(db, "users", memberToRemove.uid);
      await updateDoc(userRef, {
        joinedWorkspaces: arrayRemove(workspaceId),
        updatedAt: serverTimestamp()
      });
      
      // Refresh members list
      fetchMembers();
      
      toast({
        title: "Member removed",
        description: "User has been removed from the workspace",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error removing member",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      onAlertClose();
      setMemberToRemove(null);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmRemoveMember = (member) => {
    setMemberToRemove(member);
    onAlertOpen();
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" p={8}>
        <Spinner size="xl" thickness="4px" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Members section */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Workspace Members ({members.length})</Heading>
          {isAdmin && (
            <Button
              leftIcon={<FiUserPlus />}
              colorScheme="teal"
              variant="outline"
              onClick={onOpen}
            >
              Add Member
            </Button>
          )}
        </Flex>
        
        {members.length > 0 ? (
          <List spacing={3}>
            {members.map((member) => (
              <ListItem
                key={member.uid}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
                bg={bgColor}
                _hover={{ bg: hoverBg }}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={4}>
                    <Avatar 
                      size="sm" 
                      name={`${member.firstName} ${member.lastName}`}
                      src={member.avatarUrl}
                    />
                    <Box>
                      <Text fontWeight="medium">
                        {member.firstName} {member.lastName}
                        {member.isOwner && (
                          <Badge ml={2} colorScheme="green">Owner</Badge>
                        )}
                        {member.uid === userData.uid && !member.isOwner && (
                          <Badge ml={2} colorScheme="blue">You</Badge>
                        )}
                      </Text>
                      <Text fontSize="sm" color="gray.500">{member.email}</Text>
                    </Box>
                  </HStack>
                  
                  {isAdmin && !member.isOwner && member.uid !== userData.uid && (
                    <IconButton
                      icon={<FiTrash2 />}
                      aria-label="Remove member"
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                      onClick={() => confirmRemoveMember(member)}
                    />
                  )}
                </Flex>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box 
            p={4} 
            borderWidth="1px" 
            borderRadius="md" 
            borderColor={borderColor}
            bg={bgColor}
            textAlign="center"
            color="gray.500"
          >
            No members found. Add some members to your workspace.
          </Box>
        )}
      </Box>
      
      {/* Add Member Modal */}
      {isAdmin && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Member</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={2}>Invite by Email</Heading>
                  <FormControl isInvalid={!!inviteError}>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      placeholder="Enter user's email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (inviteError) setInviteError("");
                      }}
                    />
                    <FormErrorMessage>{inviteError}</FormErrorMessage>
                  </FormControl>
                </Box>
                
                <Divider my={2} />
                
                <Box>
                  <Heading size="sm" mb={2}>Share Invite Code</Heading>
                  <Text fontSize="sm" mb={2}>
                    Share this code with others to let them join your workspace:
                  </Text>
                  <Flex>
                    <Input value={inviteCode} isReadOnly mr={2} />
                    <IconButton
                      icon={copied ? <FiCheck /> : <FiCopy />}
                      colorScheme={copied ? "green" : "gray"}
                      onClick={copyInviteCode}
                      aria-label="Copy code"
                    />
                  </Flex>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="teal" 
                onClick={inviteMember}
                isLoading={isInviting}
                loadingText="Inviting"
              >
                Add Member
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      
      {/* Confirm Remove Member Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remove Member
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to remove 
              {memberToRemove ? ` ${memberToRemove.firstName} ${memberToRemove.lastName}` : " this member"} 
              from the workspace? They will lose access to all workspace resources.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleRemoveMember} ml={3}>
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default MembersTab;