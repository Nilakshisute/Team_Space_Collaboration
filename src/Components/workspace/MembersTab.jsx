import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Select,
  useDisclosure,
  useToast,
  Spinner,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Stack
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
  arrayRemove
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { FiSearch, FiMoreVertical, FiUserPlus, FiMail } from "react-icons/fi";

const MembersTab = ({ workspaceId, isAdmin }) => {
  const { userData } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // First, get the workspace to get member IDs
        const workspaceDoc = await getDoc(doc(db, "workspaces", workspaceId));
        
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
        const creatorId = workspaceData.createdBy;

        const membersList = [];

        // For each member ID, get user details
        for (const memberId of memberIds) {
          const memberDoc = await getDoc(doc(db, "users", memberId));
          if (memberDoc.exists()) {
            membersList.push({
              id: memberId,
              ...memberDoc.data(),
              role: memberId === creatorId ? "creator" : workspaceData.memberRoles?.[memberId] || "member",
              isCreator: memberId === creatorId,
            });
          }
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

    fetchMembers();
  }, [workspaceId, toast]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setInviting(true);

    try {
      // Check if user exists
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", inviteEmail.trim())
      );

      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        toast({
          title: "User not found",
          description: "No user found with that email address",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const userToInvite = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };

      // Check if user is already a member
      if (members.some((member) => member.id === userToInvite.id)) {
        toast({
          title: "Already a member",
          description: "This user is already a member of this workspace",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      // Add workspace to user's joined workspaces
      await updateDoc(doc(db, "users", userToInvite.id), {
        joinedWorkspaces: arrayUnion(workspaceId),
      });

      // Add user to workspace members and set their role
      const workspaceRef = doc(db, "workspaces", workspaceId);
      await updateDoc(workspaceRef, {
        members: arrayUnion(userToInvite.id),
        [`memberRoles.${userToInvite.id}`]: inviteRole
      });

      // Update local state
      setMembers([...members, { 
        ...userToInvite, 
        role: inviteRole,
        isCreator: false 
      }]);

      toast({
        title: "Member added",
        description: `${userToInvite.firstName} ${userToInvite.lastName} has been added to the workspace`,
        status: "success",
        duration: 3000,
      });

      // Reset form and close modal
      setInviteEmail("");
      setInviteRole("member");
      onClose();
    } catch (error) {
      toast({
        title: "Error inviting user",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      // Don't allow changing role of creator
      const memberToUpdate = members.find(m => m.id === memberId);
      if (memberToUpdate.isCreator) {
        toast({
          title: "Cannot change role",
          description: "The creator's role cannot be changed",
          status: "warning",
          duration: 3000,
        });
        return;
      }
      
      // Update in Firestore
      const workspaceRef = doc(db, "workspaces", workspaceId);
      await updateDoc(workspaceRef, {
        [`memberRoles.${memberId}`]: newRole
      });
      
      // Update local state
      setMembers(
        members.map(member => 
          member.id === memberId
            ? { ...member, role: newRole }
            : member
        )
      );
      
      toast({
        title: "Role updated",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };
  
  const handleRemoveMember = async (memberId) => {
    try {
      // Don't allow removing the creator
      const memberToRemove = members.find(m => m.id === memberId);
      if (memberToRemove.isCreator) {
        toast({
          title: "Cannot remove creator",
          description: "The workspace creator cannot be removed",
          status: "warning",
          duration: 3000,
        });
        return;
      }
      
      // Update in Firestore - remove from workspace members
      const workspaceRef = doc(db, "workspaces", workspaceId);
      await updateDoc(workspaceRef, {
        members: arrayRemove(memberId),
        [`memberRoles.${memberId}`]: null  // Remove role
      });
      
      // Remove workspace from user's joined workspaces
      await updateDoc(doc(db, "users", memberId), {
        joinedWorkspaces: arrayRemove(workspaceId),
      });
      
      // Update local state
      setMembers(members.filter(member => member.id !== memberId));
      
      toast({
        title: "Member removed",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error removing member",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Filter members based on search query
  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const email = member.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "creator": return "red";
      case "admin": return "orange";
      case "member": return "blue";
      case "viewer": return "green";
      default: return "gray";
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
      <Box 
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          p={4}
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          <Heading size="md">Workspace Members</Heading>
          {isAdmin && (
            <Button 
              leftIcon={<FiUserPlus />} 
              colorScheme="teal" 
              onClick={onOpen}
              size="sm"
            >
              Invite Member
            </Button>
          )}
        </Flex>

        <Box p={4}>
          <InputGroup mb={4}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search members by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          {filteredMembers.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  {isAdmin && <Th width="100px">Actions</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {filteredMembers.map((member) => (
                  <Tr key={member.id}>
                    <Td>
                      <Flex align="center">
                        <Avatar 
                          size="sm" 
                          name={`${member.firstName} ${member.lastName}`}
                          src={member.photoURL}
                          mr={3}
                        />
                        <Box>
                          <Text fontWeight="medium">
                            {`${member.firstName} ${member.lastName}`}
                            {member.id === userData.uid && (
                              <Badge ml={2} colorScheme="purple">You</Badge>
                            )}
                          </Text>
                          <Text fontSize="sm" color="gray.500">{member.email}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <Badge colorScheme={getRoleBadgeColor(member.role)}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </Td>
                    {isAdmin && (
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                            isDisabled={member.id === userData.uid || member.isCreator}
                          />
                          <MenuList fontSize="sm">
                            <MenuItem
                              isDisabled={member.role === "admin"}
                              onClick={() => handleUpdateRole(member.id, "admin")}
                            >
                              Make Admin
                            </MenuItem>
                            <MenuItem
                              isDisabled={member.role === "member"}
                              onClick={() => handleUpdateRole(member.id, "member")}
                            >
                              Make Member
                            </MenuItem>
                            <MenuItem
                              isDisabled={member.role === "viewer"}
                              onClick={() => handleUpdateRole(member.id, "viewer")}
                            >
                              Make Viewer
                            </MenuItem>
                            <MenuItem
                              color="red.500"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              Remove from Workspace
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Box textAlign="center" p={10} bg="gray.50" borderRadius="lg">
              <Text>No members found</Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Invite Member Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FiMail color="gray.300" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </Select>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  {inviteRole === "admin" && "Can manage workspace settings and members"}
                  {inviteRole === "member" && "Can view and edit workspace content"}
                  {inviteRole === "viewer" && "Can only view workspace content"}
                </Text>
              </FormControl>
            </Stack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleInvite}
              isLoading={inviting}
              loadingText="Inviting"
            >
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MembersTab;