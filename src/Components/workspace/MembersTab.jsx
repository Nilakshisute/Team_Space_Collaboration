// Components/workspace/MembersTab.jsx
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
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const MembersTab = ({ workspaceId, isAdmin }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // First, get the workspace to get member IDs
        const workspaceDoc = await getDoc(doc(db, "workspaces", workspaceId));
        const memberIds = workspaceDoc.data().members || [];

        const membersList = [];

        // For each member ID, get user details
        for (const memberId of memberIds) {
          const memberDoc = await getDoc(doc(db, "users", memberId));
          if (memberDoc.exists()) {
            membersList.push({
              id: memberId,
              ...memberDoc.data(),
              isCreator: workspaceDoc.data().createdBy === memberId,
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
    setInviting(true);

    try {
      // Check if user exists
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", inviteEmail)
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

      // Add user to workspace members
      await updateDoc(doc(db, "workspaces", workspaceId), {
        members: arrayUnion(userToInvite.id),
      });

      // Update local state
      setMembers([...members, { ...userToInvite, role: inviteRole }]);

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
        <Heading size="md">Members</Heading>
        {isAdmin && (
          <Button colorScheme="teal" onClick={onOpen}>
            Invite Member
          </Button>
        )}
      </Flex>

      {members.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
            </Tr>
          </Thead>
          <Tbody>
            {members.map((member) => (
              <Tr key={member.id}>
                <Td>{`${member.firstName} ${member.lastName}`}</Td>
                <Td>{member.email}</Td>
                <Td>{member.isCreator ? "Creator" : member.role}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Box textAlign="center" p={10} bg="gray.50" borderRadius="lg">
          <Text>No members found</Text>
        </Box>
      )}

      {/* Invite Member Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleInvite}
              isLoading={inviting}
            >
              Invite
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MembersTab;
