import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Spinner,
  Badge,
  Text,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from "@chakra-ui/react";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import DocumentsTab from "./workspace/DocumentsTab";
import MembersTab from "./workspace/MembersTab";
import { FiHome, FiChevronRight, FiSettings, FiMoreVertical, FiShare2, FiStar, FiTrash2 } from "react-icons/fi";

// Import the enhanced MembersTab component we created

const WorkspaceDashboard = () => {
  const { id } = useParams();
  const { userData } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("white", "gray.800");
  
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const workspaceDoc = await getDoc(doc(db, "workspaces", id));
        if (!workspaceDoc.exists()) {
          toast({
            title: "Workspace not found",
            status: "error",
            duration: 3000,
          });
          navigate("/home");
          return;
        }
        const workspaceData = { id: workspaceDoc.id, ...workspaceDoc.data() };
        // Check if user is a member of this workspace
        if (!workspaceData.members.includes(userData.uid)) {
          toast({
            title: "Access denied",
            description: "You are not a member of this workspace",
            status: "error",
            duration: 3000,
          });
          navigate("/home");
          return;
        }
        setWorkspace(workspaceData);
        
        // Get user's favorite workspaces from localStorage
        const storedFavorites = localStorage.getItem('favoriteWorkspaces');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        toast({
          title: "Error fetching workspace",
          description: error.message,
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [id, userData, navigate, toast]);

  const toggleFavorite = () => {
    let newFavorites;
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(favId => favId !== id);
      toast({
        title: "Removed from favorites",
        status: "info",
        duration: 2000,
      });
    } else {
      newFavorites = [...favorites, id];
      toast({
        title: "Added to favorites",
        status: "success",
        duration: 2000,
      });
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteWorkspaces', JSON.stringify(newFavorites));
  };
  
  const handleDeleteWorkspace = async () => {
    try {
      if (workspace.createdBy !== userData.uid) {
        toast({
          title: "Permission denied",
          description: "Only workspace creator can delete this workspace",
          status: "error",
          duration: 3000,
        });
        return;
      }
      
      await deleteDoc(doc(db, "workspaces", id));
      toast({
        title: "Workspace deleted",
        status: "success",
        duration: 3000,
      });
      navigate("/home");
    } catch (error) {
      toast({
        title: "Error deleting workspace",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleShareWorkspace = () => {
    // Generate a shareable link or invite code
    const inviteCode = `${workspace.id.substring(0, 6)}-${Date.now().toString(36)}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(inviteCode);
    
    toast({
      title: "Invite code copied to clipboard",
      description: "Share this code with others to let them join your workspace",
      status: "success",
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" thickness="4px" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box maxW="1200px" mx="auto">
      <Box 
        bg={headerBg} 
        p={5} 
        borderBottom="1px" 
        borderColor={borderColor}
        position="sticky"
        top="60px"
        zIndex="sticky"
      >
        <Breadcrumb separator={<Icon as={FiChevronRight} color="gray.500" />} mb={4}>
          <BreadcrumbItem>
            <BreadcrumbLink as="button" onClick={() => navigate("/home")}>
              <HStack>
                <Icon as={FiHome} />
                <Text>Home</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{workspace?.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      
        <Flex justifyContent="space-between" alignItems="center">
          <HStack>
            <Heading size="lg">{workspace?.name}</Heading>
            {workspace?.isPublic && (
              <Badge colorScheme="green" variant="subtle">Public</Badge>
            )}
            {!workspace?.isPublic && (
              <Badge colorScheme="purple" variant="subtle">Private</Badge>
            )}
          </HStack>
          
          <HStack>
            <Button 
              leftIcon={<FiStar />} 
              variant="ghost" 
              colorScheme={favorites.includes(id) ? "yellow" : "gray"}
              onClick={toggleFavorite}
            >
              {favorites.includes(id) ? "Favorited" : "Favorite"}
            </Button>
            
            <Button 
              leftIcon={<FiShare2 />} 
              variant="outline"
              onClick={handleShareWorkspace}
            >
              Share
            </Button>
            
            <Menu>
              <MenuButton 
                as={Button} 
                variant="ghost"
                aria-label="Options"
              >
                <Icon as={FiMoreVertical} />
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiSettings />}>Workspace Settings</MenuItem>
                {workspace?.createdBy === userData.uid && (
                  <MenuItem icon={<FiTrash2 />} color="red.500" onClick={onOpen}>
                    Delete Workspace
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        <Text mt={2} color="gray.500">
          {workspace?.description || "No description available"}
        </Text>
      </Box>
      
      <Box p={5}>
        <Tabs colorScheme="teal" isLazy variant="enclosed">
          <TabList>
            <Tab>Documents</Tab>
            <Tab>Members</Tab>
            {workspace?.createdBy === userData.uid && <Tab>Settings</Tab>}
          </TabList>
          <TabPanels>
            <TabPanel>
              <DocumentsTab
                workspaceId={id}
                isAdmin={workspace.createdBy === userData.uid}
              />
            </TabPanel>
            <TabPanel>
              <MembersTab
                workspaceId={id}
                isAdmin={workspace.createdBy === userData.uid}
              />
            </TabPanel>
            {workspace?.createdBy === userData.uid && (
              <TabPanel>
                <Box p={4}>
                  <Heading size="md" mb={4}>Workspace Settings</Heading>
                  {/* Workspace settings content would go here */}
                </Box>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
      
      {/* Delete Workspace Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Workspace
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this workspace? This action cannot be undone.
              All documents and data associated with this workspace will be permanently deleted.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteWorkspace} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default WorkspaceDashboard;